/* Two locally bundled, credited recordings. Keep playback independent of dialogue renders. */
window.Music=(()=>{
 'use strict';
 const KEY='cold-night-1946-music-muted';
 let muted=false,unlocked=false,wanted='investigation',context=null,channels=null;
 try{muted=localStorage.getItem(KEY)==='true';}catch{}
 const tracks={investigation:{src:'assets/music/long-note-three.mp3',level:.19},epilogue:{src:'assets/music/reawakening.mp3',level:.23}};
 function update(){const b=document.querySelector('[data-action="music-toggle"]');if(!b)return;b.textContent=muted?'音乐：关':'音乐：开';b.setAttribute('aria-pressed',String(!muted));b.setAttribute('aria-label',muted?'开启背景音乐':'关闭背景音乐');}
 function init(){
  if(channels)return;
  const AudioContext=window.AudioContext||window.webkitAudioContext;
  // file:// media must use native playback: Web Audio treats local files as
  // cross-origin and can produce silence even while currentTime advances.
  if(AudioContext&&location.protocol!=='file:')try{context=new AudioContext();}catch{}
  channels=Object.fromEntries(Object.entries(tracks).map(([id,track])=>{
   const audio=new Audio(track.src);audio.loop=true;audio.preload='none';audio.setAttribute('playsinline','');audio.volume=0;
   const ch={audio,gain:null,timer:null,frame:null,revision:0,target:0,pending:false};
   if(context){try{const source=context.createMediaElementSource(audio),gain=context.createGain();gain.gain.value=0;source.connect(gain);gain.connect(context.destination);ch.gain=gain;audio.volume=1;}catch{}}
   audio.addEventListener('error',()=>{document.querySelector('[data-action="music-toggle"]')?.setAttribute('title','音乐暂未加载，点击可重试');});
   return [id,ch];
  }));
 }
 function level(ch,to,duration=900){
  clearTimeout(ch.timer);cancelAnimationFrame(ch.frame);const rev=++ch.revision;ch.target=to;
  if(ch.gain){const param=ch.gain.gain,now=context.currentTime;param.cancelScheduledValues(now);param.setValueAtTime(param.value,now);param.linearRampToValueAtTime(to,now+duration/1000);}
  else{const from=ch.audio.volume,start=performance.now();const frame=now=>{if(rev!==ch.revision)return;const t=Math.min(1,(now-start)/duration);ch.audio.volume=from+(to-from)*t;if(t<1)ch.frame=requestAnimationFrame(frame);};ch.frame=requestAnimationFrame(frame);}
  if(to===0)ch.timer=setTimeout(()=>{if(ch.target===0&&rev===ch.revision)ch.audio.pause();},duration+40);
 }
 function sync(){
  if(!unlocked||!channels)return;
  const active=muted||document.hidden?null:wanted;
  for(const [id,ch]of Object.entries(channels)){
   const target=id===active?tracks[id].level:0;
   if(target===0){if(ch.target!==0)level(ch,0,document.hidden?30:500);continue;}
   clearTimeout(ch.timer);
   if(ch.audio.paused&&!ch.pending){ch.pending=true;ch.audio.play().then(()=>{ch.pending=false;if(!muted&&!document.hidden&&wanted===id)level(ch,target);else{ch.audio.pause();level(ch,0,30);}}).catch(()=>{ch.pending=false;});}
   else if(ch.target!==target)level(ch,target);
  }
 }
 function unlock(){unlocked=true;if(!muted){init();if(context?.state==='suspended')context.resume().catch(()=>{});}sync();}
 function set(id){if(wanted===id)return;wanted=id;sync();}
 function toggle(){muted=!muted;try{localStorage.setItem(KEY,String(muted));}catch{}update();unlock();}
 document.addEventListener('visibilitychange',sync);
 window.addEventListener('pagehide',()=>{if(channels)for(const ch of Object.values(channels)){level(ch,0,20);ch.audio.pause();}});
 update();
 return {set,unlock,toggle};
})();
