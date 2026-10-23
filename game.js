(()=>{
 'use strict';
 const {nodes,ends,clues,chapters,locations}=Story;
 const app=document.querySelector('#app'),overlay=document.querySelector('#overlay');
 const RESULT_KEY='cold-night-1946-results-v4';
 const SAVE_KEY='cold-night-1946-save-v4',END_KEY='cold-night-1946-endings-v4';
 const fresh=()=>({version:4,node:'prologue',flags:{},clues:[],history:[],puzzle:null,furthest:0,checkpoints:{},serial:0});
 const copy=x=>JSON.parse(JSON.stringify(x));
 let state=fresh(),saved=null,screen='home',unlocked=[],toastTimer,paintedView='',paintedScene='';
 const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function read(k){try{return JSON.parse(localStorage.getItem(k));}catch{return null;}}
 function write(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true;}catch{return false;}}
 function valid(v){if(v&&typeof v.node==='string'&&!nodes[v.node]){if(/^prologue-\d+$/.test(v.node))v.node='prologue-4';else if(/^letter-intro-\d+$/.test(v.node))v.node='letter-intro-2';}if(!v||v.version!==4||!nodes[v.node]||!Array.isArray(v.clues)||!Array.isArray(v.history)||!v.flags||!v.checkpoints)return null;return {...fresh(),...v,clues:v.clues.filter(id=>clues[id]),history:v.history.filter(id=>nodes[id])};}
 saved=valid(read(SAVE_KEY));const archived=read(END_KEY);unlocked=Array.isArray(archived)?archived.filter(id=>ends[id]):[];
 function save(){saved=copy(state);write(SAVE_KEY,state);}
 function notify(text){const t=document.querySelector('#toast');t.textContent=text;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),2200);}
 function btn(label,action,primary=false,attrs=''){return '<button class="'+(primary?'primary':'secondary')+'" data-action="'+action+'" '+attrs+'>'+label+'</button>';}
 function progress(ch){const root=document.querySelector('#progress');if(root.dataset.chapter===String(ch))return;root.dataset.chapter=ch;root.innerHTML=[1,2,3,4].map(i=>'<span class="'+(i===ch?'current':i<ch?'passed':'')+'" '+(i===ch?'aria-current="step"':'')+'><i></i><b>'+['壹','贰','叁','肆'][i-1]+'</b></span>').join('');}
 function paint(html,keep=false){
   const mode=document.body.dataset.mode;
   const view=['story','choice'].includes(mode)?'dialogue':mode;
   const scene=document.body.dataset.scene;
   const transition=view!==paintedView||scene!==paintedScene;
   const y=scrollY;
   app.innerHTML=html;
   app.classList.remove('enter');
   if(transition&&!keep&&y!==0)window.scrollTo(0,0);
   else if(scrollY!==y)window.scrollTo(0,y);
   paintedView=view;paintedScene=scene;
 }
 function renderDialogue(n){
   const current=app.querySelector('.scene-page');
   const template=document.createElement('template');
   template.innerHTML=dialogue(n);
   const next=template.content.firstElementChild;
   if(!current){
     paint(dialogue(n));
     const page=app.querySelector('.scene-page');
     page.dataset.scene=n.scene;page.dataset.chapter=n.chapter;
     return;
   }
   // Scene changes also keep the paper and controls; only their content changes.
   for(const selector of ['.scene-number','.scene-heading h2','.location','.speaker','.mood','.line']){
     const target=current.querySelector(selector),source=next.querySelector(selector);
     if(target.textContent!==source.textContent)target.textContent=source.textContent;
   }
   current.querySelector('.dialogue-meta').className=next.querySelector('.dialogue-meta').className;
   const controls=current.querySelector('.dialogue-controls'),newControls=next.querySelector('.dialogue-controls');
   if(controls.innerHTML!==newControls.innerHTML)controls.innerHTML=newControls.innerHTML;
   const oldChoices=current.querySelector('.choice-stack'),newChoices=next.querySelector('.choice-stack');
   if(newChoices){if(oldChoices)oldChoices.replaceWith(newChoices);else current.insertBefore(newChoices,current.querySelector('.dialogue'));}
   else if(oldChoices)oldChoices.remove();
   const oldPortrait=current.querySelector('.portrait'),newPortrait=next.querySelector('.portrait');
   if(newPortrait){
     if(!oldPortrait)current.insertBefore(newPortrait,current.querySelector('.dialogue'));
     else if(oldPortrait.getAttribute('src')!==newPortrait.getAttribute('src'))oldPortrait.replaceWith(newPortrait);
     else oldPortrait.alt=newPortrait.alt;
   }else if(oldPortrait)oldPortrait.remove();
   const oldArt=current.querySelector('.scene-illustration'),newArt=next.querySelector('.scene-illustration');
   if(newArt){if(oldArt)oldArt.replaceWith(newArt);else current.insertBefore(newArt,current.querySelector('.dialogue'));}else if(oldArt)oldArt.remove();
   current.className=next.className;
   current.dataset.scene=n.scene;current.dataset.chapter=n.chapter;
   paintedView='dialogue';paintedScene=n.scene;
 }
 function addClue(id){if(id&&clues[id]&&!state.clues.includes(id))state.clues.push(id);}
 function snapshot(){return copy({node:state.node,flags:state.flags,clues:state.clues,history:state.history,puzzle:null,furthest:state.furthest,serial:state.serial});}
 function go(id){
   const n=nodes[id];if(!n)throw Error('Missing node '+id);
   if(n.type==='conditional')return go(state.flags[n.test]?n.yes:n.no);
   if(state.node!==id)state.puzzle=null;
   state.node=id;state.furthest=Math.max(state.furthest,n.chapter||0);
   if(['chapter','choice','game'].includes(n.type)&&!state.checkpoints[id]){state.serial++;state.checkpoints[id]=snapshot();}
   if(n.set)Object.assign(state.flags,n.set);addClue(n.clue);
   if(n.type==='ending'){const canonical=n.ending;if(!unlocked.includes(canonical)){unlocked.push(canonical);write(END_KEY,unlocked);}}
   if(n.text&&state.history.at(-1)!==id)state.history.push(id);
   save();render();
 }
 function rewind(id){
   const cp=state.checkpoints[id];if(!cp)return notify('这次旅程尚未经过这个节点。');
   const earlier=Object.fromEntries(Object.entries(state.checkpoints).filter(([,v])=>v.serial<=cp.serial));
   state={...fresh(),...copy(cp),checkpoints:earlier,puzzle:null};overlay.close();go(id);
 }
 function home(){Music.set('investigation');screen='home';document.body.dataset.mode='home';Scenery.set('cover');progress(0);
   const can=saved&&nodes[saved.node].type!=='epilogue';
   paint('<section class="cover centered-cover"><h1 class="calligraphy-title"><img src="assets/title-calligraphy.png" alt="寒夜信使：北平1946" width="1506" height="783" fetchpriority="high"></h1><div class="cover-actions">'+btn(can?'继续调查 →':'拆开密信 →',can?'continue':'start',true)+(can?'<button class="text-button" data-action="new">重新开始</button>':'')+'</div></section>');
 }
 function portrait(n){if(n.mood&&/信|笺/.test(n.mood))return '';const id={'陶知微':'tao','傅慎之':'fu','苏望安':'su'}[n.speaker];const src=id&&(GAME_ASSETS.portraits||{})[id];return src?'<img class="portrait" data-person="'+id+'" src="'+esc(src)+'" alt="'+n.speaker+'">':'';}
 function sceneIllustration(n){const src=n.illustration&&GAME_ASSETS.minigames[n.illustration];return src?'<figure class="scene-illustration"><img src="'+esc(src)+'" alt="推开后窗，撤入空院"></figure>':'';}
 function dialogue(n){const choice=n.type==='choice',narrator=!n.speaker||n.speaker==='旁白';return '<section class="scene-page '+(choice?'choice-screen':'')+'"><div class="scene-number">'+(n.chapter?'第'+['','一','二','三','四'][n.chapter]+'章':'北平 · 深秋')+'</div><div class="scene-heading"><h2>'+chapters[n.chapter]+'</h2><span class="location">'+locations[n.scene]+'</span></div>'+portrait(n)+sceneIllustration(n)+(choice?'<div class="choice-stack">'+n.choices.map((c,i)=>'<button class="choice" data-action="choose" data-index="'+i+'"><span>0'+(i+1)+'</span>'+c.label+'</button>').join('')+'</div>':'')+'<div class="dialogue"><div class="dialogue-meta '+(narrator?'narrator-meta':'')+'"><span class="speaker">'+(narrator?'':n.speaker)+'</span><span class="mood">'+(narrator?'':(n.mood||({'陶知微':'单线交通员','傅慎之':'联络上线','苏望安':'学运联络员'}[n.speaker]||'')))+'</span></div><p class="line">'+n.text+'</p><div class="dialogue-controls"><button class="text-button" data-action="history">回看</button>'+(choice?'<span class="mood">这次选择会被记住</span>':btn('继续 →','next',true))+'</div></div></section>';}
 function render(){screen='game';const n=nodes[state.node];Music.set(n.type==='epilogue'?'epilogue':n.type==='ending'?null:'investigation');document.body.dataset.mode=n.type;Scenery.set(n.scene);progress(n.chapter);
   if(['story','choice'].includes(n.type))renderDialogue(n);
   else if(n.type==='chapter')paint('<section class="chapter-card"><span class="chapter-glyph">0'+n.chapter+'</span><h2>'+n.title+'</h2><p>'+n.subtitle+'</p>'+btn('进入本章 →','next',true)+'</section>');
   else if(n.type==='game')renderGame();
   else if(n.type==='ending')ending(n);
   else if(n.type==='epilogue')renderEpilogue();
 }
 function puzzle(){if(!state.puzzle||state.puzzle.id!==state.node)state.puzzle={id:state.node};return state.puzzle;}
 function renderGame(keep=false){
   const n=nodes[state.node],p=puzzle();
   const focused=app.contains(document.activeElement)?{...document.activeElement.dataset}:null;
   paint('<section class="task-page casework" data-game="'+n.game+'">'+Casework.render(n,p,state)+'</section>',keep);
   if(focused?.action){const same=[...app.querySelectorAll('button[data-action]')].find(b=>!b.disabled&&Object.keys(focused).every(k=>b.dataset[k]===focused[k]));if(same)same.focus({preventScroll:true});}
   save();
 }
 function interactionContext(){return {state,node:nodes[state.node],p:puzzle(),save,go,addClue,notify,render:()=>renderGame(true)};}
 function renderEpilogue(){
   const last=state.history.map(id=>nodes[id]).filter(n=>n?.type==='ending').at(-1);
   const result=last?.ending||'dawn',f=state.flags;
   const opening=result==='exposed'?'你没能走到约定的灯下。<br>这一程停在了寒夜，故事留下的追问仍在。':result==='blind'?(f.obeyed||f.indexGiven?'你没能守住这条联络线。<br>一句未经核实的承诺，牵动的是许多人的安危。':'你没能走出那间民房。<br>但先行送出的情报，仍沿着另一条路抵达。'):(f.suAvailable?'信送到了。望安仍在约定的地方等你。<br>你们带出的，既是真相，也是彼此的生路。':'信送到了，你独自走向城外。<br>有些约定已经烧掉，有些人的归期仍未可知。');
   const pages=[
    {label:'尾声 · 一',title:'信的尽头，是人',body:'<p>'+opening+'</p><p>一封信的分量，<br>是它背后那些不能被轻易交出去的人。</p>'},
    {label:'尾声 · 二',title:'守住心中的归期',body:'<p>忠诚，落在危急关头仍不交出的名单里；<br>求实，落在不凭一份罪状就放弃同志的坚持里。</p><p>信仰使人知道为何出发，<br>责任让人记得，要为谁守住这条路。</p>'},
    {label:'尾声 · 三',title:'把黎明留给更多人',body:'<p>陶知微、傅慎之、苏望安，是故事中的名字。<br>我们借这一程寒夜，致敬革命斗争中<br>为理想与人民坚守的人们。</p><p class="epilogue-quote">待到春暖，共赴归期。</p><p>愿今天的我们珍惜和平，<br>把对历史的敬意，化为求真与担当。</p>'}
   ];
   const index=Math.max(0,Math.min(2,state.epiloguePage||0)),page=pages[index];
   paint('<section class="epilogue-screen memorial-screen"><div class="eyebrow">'+page.label+'</div><h2>'+page.title+'</h2><div class="ending-rule"></div><div class="epilogue-copy">'+page.body+'</div>'+(index===2?'<p class="epilogue-fiction">本作为历史背景下的虚构交互叙事，人物与案件不对应真实个案。</p><details class="epilogue-sources"><summary>创作说明与资料来源</summary><p>作品以1946年北平为故事背景。人物、联络线路、仿信案件、密会、城防情报内容及谜题机制均为虚构；场景与人物图为生成式插画，不是历史照片、档案或真实遗址复原。</p><p>精神主题参考：习近平《在庆祝中国共产党成立100周年大会上的讲话》（2021年7月1日，中国政府网）。本作对忠诚、理想、责任的表达参考该文；该文不作为本故事案件发生过的证据。</p><a href="https://www.gov.cn/xinwen/2021-07/01/content_5621847.htm" target="_blank" rel="noopener noreferrer">阅读来源原文 ↗</a><p>“待到春暖，共赴归期”为本作虚构人物台词，不是历史引文。制作中使用AI辅助编程与生成式图像，图片由创作者提供、整理并接入。</p></details>':'')+'<div class="epilogue-actions">'+(index?btn('上一页','epilogue-back'):'')+(index<2?btn('继续 →','epilogue-next',true):btn('回到封面 →','home',true))+'</div></section>');
 }
 function ending(n){
   const f=state.flags,notes=[];let text=n.text;
   if(n.ending==='blind'){
     if(f.obeyed)text='你随安排的车进入搜查点，被当场拘捕。原件与应急索引一起落入敌手，敌人沿名单展开搜捕。你把旧日恩情当作今天的保证，最终没能保住这封信。';
     else if(f.indexGiven)text='原件已经由独立送件人送出，你却因他答对暗语，交出了索引的封存位置。门外的人拿到地址后锁住民房，你被拘捕，名单上的同志面临搜捕。';
     else text='原件已经送出，应急索引仍封存在别处。可正门被锁，后窗没有事先松闩，你被留在民房里。独立送件人按约停用了旧线，情报抵达时，收件簿上没有你的归讯。';
   }
   if(n.ending==='dawn'){
     text='拂晓，独立送件人确认城防情报送达。你也带出了傅慎之受胁迫、亲写诱捕密信的真相，旧线随即停用。'+(f.suAvailable?'南院的紧急约定仍在，望安接住你，两人一同离城。':'你已经烧掉南院的接应约定，只能独自离城；望安的去向暂时无人证实。');
   }
   if(n.ending!=='exposed'){
     notes.push(f.sharedPoint?'报出了新点地址 → 新点被搜，两名联络员失联。':'暂缓报出新地址 → 新点避开搜查，随后停用旧渠道。');
     notes.push(f.suAvailable?'保留南院约定 → 望安仍能提供紧急接应。':'彻底切断望安 → 失去南院接应，也无法确认他的去向。');
     notes.push(f.obeyed?'携带原件和索引赴约 → 情报与名单同时被搜走。':f.indexGiven?'原件先行送出，但交出封存地址 → 情报安全，名单暴露。':'原件先送、索引封存 → 情报送达，名单未交出。');
     if(f.escaped)notes.push(f.fuHelped?'用取药收据唤回他的迟疑 → 傅慎之拖延放行。':'事先松开后窗 → 拒绝合作后仍能撤离。');
     else if(!f.obeyed&&!f.indexGiven)notes.push(f.fuClosed?'无关质问消耗了劝说余地，且没有准备出口 → 撤离失败。':'拒绝合作后没有可用的出口 → 撤离失败。');
     if(f.riskMissed)notes.push('雨巷撤离延误 → 错过当夜车次，密件改走次晨渠道。');
   }
   const help=f.fuHelped?'<p class="ending-note">傅慎之拖住了这一次搜捕。他此后没有再回信，下落未明；这次放行，也无法抹掉他此前的出卖。</p>':'';
   const results=read(RESULT_KEY)||{};results[n.ending]={text,notes,help:!!f.fuHelped};write(RESULT_KEY,results);
   paint('<section class="ending-screen"><div class="eyebrow">'+n.kicker+'</div><h1>'+n.title+'</h1><div class="ending-rule"></div><p>'+text+'</p>'+help+'<p class="ending-note">'+n.note+'</p>'+(notes.length?'<details class="causal-summary"><summary>这些后果，从哪里开始？</summary><ul>'+notes.map(x=>'<li>'+x+'</li>').join('')+'</ul></details>':'')+'<div class="ending-actions">'+btn('阅读尾声 →','epilogue',true)+btn('重回抉择','retry')+'</div></section>');
 }
 function modal(title,body){overlay.innerHTML='<div class="modal-top"><h2 id="overlay-title">'+title+'</h2><button class="close-modal" data-action="close" aria-label="关闭">×</button></div>'+body;if(!overlay.open)overlay.showModal();overlay.scrollTop=0;}
 function notebook(){const s=screen==='home'?(saved||fresh()):state;modal('交通员手记','<p class="notebook-objective">当前目标：'+Story.objectives[nodes[s.node].chapter||0]+'</p>'+(s.clues.length?s.clues.map(id=>'<article class="notebook-item"><h3>'+clues[id].title+'</h3><p>'+clues[id].text+'</p></article>').join(''):'<p class="modal-copy">只有你亲手查到的证据，才会写进这本手记。</p>'));}
 function history(){modal('来时的声音',state.history.slice(-16).map(id=>{const n=nodes[id],speaker=n.speaker==='旁白'?'':(n.speaker||'');return '<article class="notebook-item '+(speaker?'':'history-narration')+'">'+(speaker?'<h3>'+speaker+'</h3>':'')+'<p>'+n.text+'</p></article>';}).join(''));overlay.scrollTop=overlay.scrollHeight;}
 const END_GROUPS=[
  {id:'exposed',title:'失约',desc:'第一道判断失误，密信把你带进埋伏。'},
  {id:'blind',title:'落入圈套',desc:'看见危险，却没把证据和退路准备好。'},
  {id:'dawn',title:'带出真相',desc:'情报送达，信使带出真相；同行者随选择而变。'}
 ];
 function unlockedGroupCount(){return END_GROUPS.filter(g=>unlocked.includes(g.id)).length;}
 function menu(){modal('暂歇片刻','<div class="menu-buttons">'+btn('回到故事','close')+btn('章节回望','chapters')+btn('结局留痕 · '+unlockedGroupCount()+' / 3','endings')+btn('音乐与素材署名','credits')+btn('重新开始','new')+btn('回到封面','home')+'</div>');}
 function chapterMenu(){const s=screen==='home'?(saved||fresh()):state;modal('章节回望','<div class="menu-buttons">'+[1,2,3,4].map(i=>btn(['壹','贰','叁','肆'][i-1]+' · '+chapters[i],'jump',false,'data-id="chapter'+i+'" '+(!s.checkpoints['chapter'+i]?'disabled':''))).join('')+'</div><p class="modal-copy" style="margin-top:20px">回望会恢复该章开始时的证据与选择。后来的决定需要重新做出，已见结局仍会保留。</p>');}
 function endMenu(){modal('三种结局','<div class="archive-grid">'+END_GROUPS.map(g=>unlocked.includes(g.id)?'<button class="archive-item unlocked" data-action="view-end" data-id="'+g.id+'"><strong>'+ends[g.id].title+'</strong><p>'+g.desc+'</p></button>':'<div class="archive-item"><strong>尚未抵达</strong><p>'+g.title+' · '+g.desc+'</p></div>').join('')+'</div>');}
 function newGame(){modal('重新踏入寒夜','<p class="modal-copy">当前进度将从第一封信重新开始，已见结局会保留。</p><div class="modal-actions">'+btn('重新开始','start',true)+btn('取消','close')+'</div>');}
 function perform(a,el){
   const n=nodes[state.node];const i=el?Number(el.dataset.index):0;
   if(a==='music-toggle')return Music.toggle();
   if(a==='credits')return modal('音乐与素材署名',"<p class=\"modal-copy\">背景音乐：Kevin MacLeod（incompetech.com）</p><div class=\"music-credits\"><article class=\"notebook-item\"><h3>Long Note Three</h3><p>调查主线 · Kevin MacLeod</p><a href=\"https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1100424\" target=\"_blank\" rel=\"noopener noreferrer\">作者曲目页 ↗</a></article><article class=\"notebook-item\"><h3>Reawakening</h3><p>结局尾声 · Kevin MacLeod</p><a href=\"https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1400017\" target=\"_blank\" rel=\"noopener noreferrer\">作者曲目页 ↗</a></article><p>Licensed under Creative Commons: By Attribution 4.0</p><a href=\"https://creativecommons.org/licenses/by/4.0/\" target=\"_blank\" rel=\"noopener noreferrer\">CC BY 4.0 许可 ↗</a><p>原始录音未剪辑、未转码；游戏中作循环播放、音量调整与淡入淡出。</p><p>场景、人物与书法标题由创作者提供；场景与人物为生成式插画。图片不是历史照片或档案。</p></div>");
   if(a==='close')return overlay.close();
   if(a==='start'){overlay.close();state=fresh();return go('prologue');}
   if(a==='new')return saved?newGame():perform('start');
   if(a==='continue'){state=valid(saved)||fresh();return go(state.node);}
   if(a==='home'){overlay.close();return home();}
   if(a==='menu')return menu();if(a==='notebook')return notebook();if(a==='history')return history();if(a==='chapters')return chapterMenu();if(a==='endings')return endMenu();
   if(a==='jump'){const id=el.dataset.id;return modal('回到'+nodes[id].title,'<p class="modal-copy">恢复本章开始时的状态，之后的调查会重新进行。</p><div class="modal-actions">'+btn('回到本章','confirm-jump',true,'data-id="'+id+'"')+btn('取消','close')+'</div>');}
   if(a==='confirm-jump'){if(screen==='home')state=valid(saved)||fresh();return rewind(el.dataset.id);}
   if(a==='view-end'){const id=el.dataset.id;if(!unlocked.includes(id))return;return modal(ends[id].title,'<p class="modal-copy">'+((read(RESULT_KEY)||{})[id]?.text||ends[id].text)+'</p><div class="modal-actions">'+btn('返回留痕','endings')+'</div>');}
   if(screen!=='game'||overlay.open)return;
   if(a==='next'&&n.next)return go(n.next);
   if(a==='choose'&&n.type==='choice'){const c=n.choices[i];if(!c)return;Object.assign(state.flags,c.set||{});return go(c.next);}
   if(a==='retry'&&n.type==='ending')return rewind(n.retry);
   if(a==='epilogue'){state.epiloguePage=0;return go('epilogue');}
   if(n.type==='epilogue'&&['epilogue-next','epilogue-back'].includes(a)){state.epiloguePage=Math.max(0,Math.min(2,(state.epiloguePage||0)+(a==='epilogue-next'?1:-1)));save();return renderEpilogue();}
   if(n.type==='game')Casework.act(a,el,interactionContext());
 }
 document.addEventListener('click',e=>{const b=e.target.closest('button[data-action]');if(!b||b.disabled)return;e.preventDefault();perform(b.dataset.action,b);if(b.dataset.action!=='music-toggle')Music.unlock();});
 document.addEventListener('keydown',e=>{if(e.repeat||overlay.open||screen!=='game'||/BUTTON|INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName))return;if(['Space','ArrowRight'].includes(e.code)&&['story','chapter'].includes(nodes[state.node].type)){e.preventDefault();go(nodes[state.node].next);Music.unlock();}});
 overlay.addEventListener('click',e=>{if(e.target===overlay){const r=overlay.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)overlay.close();}});
 app.addEventListener('error',e=>{if(e.target.matches('img.portrait'))e.target.remove();},true);
 home();
})();

