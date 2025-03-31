const express = require('express');
const path = require('path');
const port=6500;
const crypto = require('node-forge');

const app = express();

app.use(express.static('./resources'));
app.use(express.static('./redirect'));

app.get('/',(req,res)=>{
    res.sendFile(path.resolve(__dirname,'app.html'));
})

app.get('/about',(req,res)=>{
    res.sendFile(path.resolve(__dirname,'./redirect/about.html'));
})

app.get('/api',async (req,res)=>{
    let {q} = req.query;
    q = q.replace(/ /g, '+');
    try{
        const result = await fetch(`https://www.jiosaavn.com/api.php?p=1&q=${q}&_format=json&_marker=0&api_version=4&ctx=web6dot0&n=20&__call=search.getResults`, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
              'Referer': 'https://www.jiosaavn.com/', 
              'Accept': 'application/json'
            }
          });
        console.log(result);
        if(!result.ok){
            throw new Error('Couldnt fetch results');
        }else{
            let data = await result.json();

            res.json(data);
        }
    }catch(err){
        console.log(err);
        res.status(500).json({ error: 'An error occurred while fetching the media URL' });
    }
})

app.get('/getSong',async (req,res)=>{
    let {id} = req.query;
    try{
        let decoded_url = await encurlfetch(id);
        res.send(decoded_url);  
    }catch{
        res.status(500).send('Error Decrypting data');
    }
})

async function encurlfetch(id) {
    try{
        let result = await fetch(`https://www.jiosaavn.com/api.php?__call=song.getDetails&pids=${id}&api_version=4&_format=json&_marker=0&ctx=web6dot0`, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
              'Referer': 'https://www.jiosaavn.com/', 
              'Accept': 'application/json'
            }
          });
        if(!result.ok){
            throw new Error('Error fetching enc url');
        }else{
            let data = await result.json();
            let play_link = await createDownloadLink(data.songs[0].more_info.encrypted_media_url);
            return play_link[4]?.url;
        }
    }catch(err){
        console.log(err);
    }
}



function createDownloadLink(encryptedMediaUrl) {
  if (!encryptedMediaUrl) return [];

  const qualities = [
    { id: "_12", bitrate: "12kbps" },
    { id: "_48", bitrate: "48kbps" },
    { id: "_96", bitrate: "96kbps" },
    { id: "_160", bitrate: "160kbps" },
    { id: "_320", bitrate: "320kbps" },
  ];

  const key = "38346591";
  const iv = "00000000";

  const encrypted = crypto.util.decode64(encryptedMediaUrl);
  const decipher = crypto.cipher.createDecipher(
    "DES-ECB",
    crypto.util.createBuffer(key)
  );
  decipher.start({ iv: crypto.util.createBuffer(iv) });
  decipher.update(crypto.util.createBuffer(encrypted));
  decipher.finish();
  const decryptedLink = decipher.output.getBytes();

  return qualities.map(quality => ({
    quality: quality.bitrate,
    url: decryptedLink.replace("_96", quality.id),
  }));
};


app.listen(port,()=>{
    console.log(`Voyager is up and running at port ${port}! `)
})