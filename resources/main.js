const gsearch=document.querySelector('.button');
const source=document.getElementById('main-player');
let player=document.querySelector('.master');
const playpause = document.querySelector('.playpause');
const slider = document.querySelector('.progress-bar');
const timer=document.querySelector('.timer');
const content=document.querySelector('.content');
let playername=document.querySelector('.playname');
let playerdesc=document.querySelector('.artistname');
let download=document.querySelector('.downloader');
let url;


document.querySelector('.searchbox').addEventListener('keydown',(inp)=>{
    if(inp.key==='Enter'){
        const value = document.querySelector('.searchbox').value;
        fetcher(value);
    }
})

gsearch.addEventListener('click',()=>{
    const value = document.querySelector('.searchbox').value;
    fetcher(value);
});


async function fetcher(value){
     try{
        value = value.replace(/\s+/g, '+');
        document.querySelector('.status').innerHTML=`<span class="toggle-text"> Loading... </span>`;
        startdarkmode();
        const result = await fetch(`/api?q=${value}`);
        if(!result.ok){
            throw new Error('Error Fetching Api') ;
        };
        const object= await result.json();
        document.querySelector('.status').innerHTML=`<span class="effect">Top Results: </span>`;


        content.innerHTML="";
        for(let i=0;i<=20;i++){
            if(object.results[i]){
            content.innerHTML+=`           <div class="card obj-${i} light-card">
                <div class="main-iconholder">
                    <img src="/website/resources/fallback.png" class="main-player-thumb" id="img-${i}">
                </div>
                <div class="main-details">
                    <div class="playname toggle-text" id="title-${i}"></div>
                    <div class="artistname" id="desc-${i}"></div>
                </div>
            </div>`
        }}
        imagepicker(object);
        titlesetter(object);
        descsetter(object);

        for(let i=0;i<=50;i++){
            let card=document.querySelector(`.obj-${i}`);
            if(object.results[i]){
                card.addEventListener('click',async ()=>{

                    url = await geturl(object.results[i]?.id);

                    document.querySelector('.playpause').checked="checked";
                    document.querySelector('.iconholder').innerHTML=`                    <img src="" class="player-thumb">`;
                    let playerthumb=document.querySelector('.player-thumb');
                
                    playerthumb.src=object.results[i]?.image;
                    playername.innerHTML=object.results[i]?.title;
                    playerdesc.innerHTML=object.results[i]?.more_info.artistMap.primary_artists[0]?.name;
                    player.src = url;
                
                    player.load();
                    player.play();
                    sidebar(object,i);


                    setInterval(()=>{
                        timer.innerHTML = `${Math.floor(player.currentTime/60)}:${Math.floor(player.currentTime%60).toString().padStart(2, '0')}/${Math.floor(player.duration/60)}:${Math.floor(player.duration%60).toString().padStart(2, '0')}`
                    },1000);
                })

                    download.addEventListener('click',()=>{
                        download.href = url;
                        download.download = object.results[i]?.title;

                    document.querySelector('.playpause').checked="checked";
            
             });
            }
        }

     }catch(err){
        console.log(err);
     }   
};

playpause.addEventListener("click",()=>{
    if (player.paused) {
        player.play();
    } else {
        player.pause();
    }
});

player.addEventListener("timeupdate",()=>{
    const value = (player.currentTime / player.duration) * 100;
    slider.value = value;
});

slider.addEventListener("input", function () {
    const newTime = (slider.value / 100) * player.duration;
    player.currentTime = newTime;
});

function imagepicker(object){
    for(let i=0;i<=50;i++){
    try{
        let picker = document.getElementById(`img-${i}`);
        let url=object.results[i]?.image;
        if(url){
           picker.src = url;
        }else{
            picker.src = "/website/resources/fallback.png";
        }
    }catch{}

    }
}

function titlesetter(object){
    for(let i=0;i<=50;i++){
    try{
        let picker = document.getElementById(`title-${i}`);
        const name = object.results[i]?.title;
        if(name){
            picker.innerHTML=name;
        }else{
            picker.innerHTML="";
        }
        startdarkmode();
    }catch{}

    }
}

function descsetter(object){
    try{
    for(let i=0;i<=50;i++){
        let picker = document.getElementById(`desc-${i}`);
        const artist = object.results[i]?.more_info.artistMap.primary_artists[0]?.name;
        if(artist){
            picker.innerHTML=artist;
        }else{
            picker.innerHTML="";
        }
    } 
    }catch{}
}


function startdarkmode(){
    let toggletext=document.querySelectorAll('.toggle-text');
    let card=document.querySelectorAll('.light-card');

    if(document.body.classList.contains("light-bg")){

        toggletext.forEach((element)=>{element.classList.add("light-mode-text")});
        card.forEach((element)=>{element.classList.add("light-mode-card")});

    }
}


function darkmode(){
        let toggletext=document.querySelectorAll('.toggle-text');
        let card=document.querySelectorAll('.light-card');
        let header=document.querySelector('.header');
        let logo=document.querySelector('.logo');


        if(document.body.classList.contains("light-bg")){
    
            document.body.classList.remove("light-bg");
            toggletext.forEach((element)=>{element.classList.remove("light-mode-text");});
            card.forEach((element)=>{element.classList.remove("light-mode-card")});
            header.classList.remove('header-light');
            logo.classList.remove('logo-light');
    
    
        }else{
            document.body.classList.add("light-bg");
            toggletext.forEach((element)=>{element.classList.add("light-mode-text");});
            card.forEach((element)=>{element.classList.add("light-mode-card")});
            header.classList.add('header-light');
            logo.classList.add('logo-light');
        }
    

    }

async function geturl(codedurl){
    try{
        
        let res_url = await fetch(`/getSong?id=${codedurl}`);

        if(!res_url){
            throw new Error('Decryption failed');
        }else{
            let url = await res_url.text();
            return url;
        }
    }catch(err){
        console.error(err);
    }
}

function sidebar(object,i){
    const thumb = document.querySelector('.iconholder');

    function setbar(){
        document.querySelector('.bar-container').innerHTML=`            <div class="side-bar">
        <button class="close">X</button>
        <img src="${object.results[i]?.image.replace('150x150', '500x500')}" class="sidebar-image">
        <div class="sidebar-title">${object.results[i]?.title}</div>
        <div class="sidebar-desc">${object.results[i]?.more_info.artistMap.primary_artists[0]?.name}</div>
        <div class="year">Year: ${object.results[i].year}</div>
        <div class="album">Album: ${object.results[i].more_info.album}</div>
    </div>`;
                if(object.results[i]?.more_info.artistMap.primary_artists[1]?.name){
                document.querySelector('.sidebar-desc').innerHTML+=`, ${object.results[i]?.more_info.artistMap.primary_artists[1]?.name}` 
                }
                const close = document.querySelector('.close');
                close.addEventListener('click',()=>{
                document.querySelector('.bar-container').innerHTML=''
                })
    }

    thumb.addEventListener('click',setbar);
    playername.addEventListener('click',setbar);
    thumb.click();

}

