/* 调查玩法。所有进度写入同一份本地存档。 */
window.Casework=(()=>{
 'use strict';
 const words=['西院','东院','北门','南桥','十九时','七时','四十分','整点'];
 const code=[5,1,3];
 const wall=new Set(['1,0','2,0','1,1','1,2','3,1','4,3']);
 const patrols=[[[2,3],[3,3],[3,2],[2,2]],[[5,0],[4,0],[3,0],[4,0]]];
 const rounds=[
  {say:'迁点那夜二十时十分，望安穿过北巷。轨迹是查实过的。',answer:'gate',reply:'傅慎之看了封巷时刻：“外围记错了时间，也不能抹掉所有记录。”他避开了那段不可能发生的行程。'},
  {say:'消息都是望安散出去的。我的联络渠道，从来没有泄露。',answer:'trace',reply:'“也许信在途中被截了。”他终于承认渠道可能受控。你记下：这还不能证明他本人参与，必须继续核实。'},
  {say:'他带着药包私自绕路，除了私会，还有什么解释？',answer:'family',reply:'你把收据翻到有他签记的一面。他的手停住了：“这件事……是我托他的。”望安的隐瞒，并非那份罪状里的原因。'}
 ];
 const exhibitIds=['gate','trace','family','promise','late'];
 const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const button=(label,action,attrs='',primary=false)=>'<button type="button" class="'+(primary?'primary':'secondary')+'" data-action="'+action+'" '+attrs+'>'+label+'</button>';
 function art(key,cls=''){const src=window.GAME_ASSETS?.minigames?.[key];return src?'<img class="game-art '+cls+'" src="'+esc(src)+'" alt="" draggable="false">':'';}
 function artStyle(key){const src=window.GAME_ASSETS?.minigames?.[key];return src?' style="--piece-art:url('+esc(src)+')"':'';}
 function head(title,desc,status=''){return '<div class="task-header"><h2>'+title+'</h2>'+(status?'<span class="task-count">'+status+'</span>':'')+'</div><p class="game-instruction">'+desc+'</p>';}
 function message(p,fallback){return '<p class="game-feedback" role="status" aria-live="polite">'+esc(p.message||fallback)+'</p>';}
 function resetRoute(p){Object.assign(p,{x:0,y:3,turn:0,alarm:0,trail:[[0,3]],failed:false,won:false,message:''});}
 function route(p){
  const current=patrols.map(path=>path[p.turn%path.length]),next=patrols.map(path=>path[(p.turn+1)%path.length]);
  let h=head('走出雨巷','点上下左右相邻格，14 步内到右上角出口。巡查也会移动，避开「下步」格和迎面相撞。','已走 '+p.turn+' / 14 步');
  h+='<div class="route-layout"><div class="street-grid" aria-label="巷道地图，六列四行">';
  for(let y=0;y<4;y++)for(let x=0;x<6;x++){
   const key=x+','+y,blocked=wall.has(key),you=x===p.x&&y===p.y,guards=current.map((a,i)=>a[0]===x&&a[1]===y?i:-1).filter(i=>i>=0),incoming=next.map((a,i)=>a[0]===x&&a[1]===y?i:-1).filter(i=>i>=0),exit=x===5&&y===0,visited=p.trail.some(a=>a[0]===x&&a[1]===y),adj=Math.abs(p.x-x)+Math.abs(p.y-y)===1;
   const title=blocked?'封巷':you?'你':guards.length?'巡'+guards.map(i=>['甲','乙'][i]).join(''):exit?'出口':visited?'·':'';
   const label='第'+(y+1)+'行第'+(x+1)+'列，'+(title||'巷道')+(exit?'，出口':'')+(incoming.length?'，下回合巡查到达':'');
   h+='<button class="street-cell '+(blocked?'wall ':'')+(you?'you ':'')+(guards.length?'guard ':'')+(incoming.length?'incoming ':'')+(exit?'exit ':'')+(adj?'reachable':'')+'" data-action="route-move" data-x="'+x+'" data-y="'+y+'" aria-label="'+label+'" '+(blocked||p.failed||p.won?'disabled':'')+'>'+art(blocked?'route-wall':exit?'route-exit':'route-floor','route-tile')+(you?art('route-tao','route-token'):guards.length?art('route-patrol-'+(guards[0]===0?'a':'b'),'route-token'):'')+(exit?'<span class="exit-label">出口 ↗</span>':'')+'<strong>'+title+'</strong>'+(incoming.length?'<span class="incoming-label">下步 '+incoming.map(i=>['甲','乙'][i]).join('·')+'</span>':'')+'</button>';
  }
  h+='</div><aside class="route-orders"><div class="alarm-track" aria-label="警觉程度 '+p.alarm+' / 3"><span>被发现 '+p.alarm+' / 3 次</span>'+[0,1,2].map(i=>'<i class="'+(p.alarm>i?'lit':'')+'"></i>').join('')+'</div><p>「巡」是当前位置；「下步」是他将走到的位置。被发现 3 次需重走。</p><p class="route-evidence">北巷十九时起封闭，已记入手记。</p>'+message(p,p.won?'你借院门消失在视线外，尾随者没有跟上。':p.failed?'巡查收紧了巷口。重新推演路线，已造成的延误会保留。':'不能安全前进时，点「原地等一步」。')+'<figure class="route-scene">'+art(p.won?'route-safe':p.failed||/撞见|退回/.test(p.message)?'route-caught':'route-wait')+'</figure><div class="case-controls">'+(p.won?button('离开雨巷 →','game-done','',true):p.failed?button('重新规划','route-reset','',true):button('原地等一步','route-wait','',true))+'</div></aside></div>';
  return h;
 }
 function confront(p,state){
  const done=p.round>=rounds.length,r=rounds[Math.min(p.round,2)];
  const evidenceArt={gate:'confront-gate',trace:'confront-trial',family:'confront-receipt',promise:'confront-promise',late:'confront-late'};
  if(done)return head('核对完成','点击下方按钮，继续询问傅慎之。','3 / 3')+'<div class="confront-finish illustrated-finish">'+art('confront-table','confront-summary-art')+'<p>北巷轨迹不可能成立。<br>傅的通信渠道确实泄密。<br>药包来自他自己的托付。</p>'+message(p,p.mistakes>=2?'他开始催门外的人。劝说余地已经收紧，撤离要靠事先的安排。':'他不再坚持那份指控，却仍索要索引。你决定对一遍旧约。')+button('问出最后一句 →','game-done','',true)+'</div>';
  const preview=p.answered?(p.round===2?'confront-turn-receipt':'confront-show'):p.mistakes>=2?'confront-impatient':evidenceArt[p.selectedEvidence];
  const caption=p.answered?(p.round===2?'翻到收据背面':'把证据推到他面前'):p.mistakes>=2?'门外传来脚步声':p.selectedEvidence?Story.clues[p.selectedEvidence].title:'';
  return head('用证据反驳','读他说的话 → 点证据查看详情 → 点「出示证据」。选错两次，他会失去耐心。','第 '+(p.round+1)+' / 3 轮')+'<div class="testimony"><span>傅慎之</span><p>“'+r.say+'”</p></div><div class="pressure"><span>失言 '+p.mistakes+' 次</span><span>'+(p.mistakes>=2?'门外有人开始靠近':'孤灯下，仍有核实的余地')+'</span></div><div class="evidence-selection illustrated-evidence">'+exhibitIds.filter(id=>state.clues.includes(id)).map(id=>'<button class="evidence-exhibit '+(p.selectedEvidence===id?'selected ':'')+(p.wrong.includes(id)?'tried':'')+'" data-action="confront-pick" data-id="'+id+'" aria-pressed="'+(p.selectedEvidence===id)+'" '+(p.answered?'disabled':'')+'>'+art(evidenceArt[id],'evidence-thumbnail')+'<strong>'+Story.clues[id].title+'</strong></button>').join('')+'</div><div class="evidence-preview '+(preview?'has-art':'')+'">'+(preview?'<figure>'+art(preview,'evidence-closeup')+'<figcaption>'+caption+'</figcaption></figure>':'')+'<p class="exhibit-detail">'+(p.selectedEvidence?Story.clues[p.selectedEvidence].text:'点上方一份证据，查看内容。')+'</p></div><div class="case-controls">'+message(p,p.answered?r.reply:'找能直接推翻这句话的证据。')+(p.answered?button('继续核对 →','confront-next','',true):button('出示证据','confront-show',p.selectedEvidence?'':'disabled',true))+'</div>';
 }

 function init(n,p){
  if(p.kind===n.game&&p.revision===4){
   if(n.game==='watch'&&p.watchVersion!==2){p.watchVersion=2;p.moved=!!(p.test||p.observed.length);p.moment=p.moved?'after':'before';p.message='';}
   return;
  }
  Object.keys(p).filter(k=>k!=='id').forEach(k=>delete p[k]);
  Object.assign(p,{kind:n.game,revision:4,message:''});
  if(n.game==='cipher')Object.assign(p,{shift:0,stage:0,order:[2,0,1],selected:null,stamps:[null,null,null],marked:null});
  if(n.game==='route')resetRoute(p);
  if(n.game==='confront')Object.assign(p,{round:0,selectedEvidence:'',mistakes:0,answered:false,wrong:[]});
  if(n.game==='watch')Object.assign(p,{watchVersion:2,moved:false,moment:'before',observed:[],selected:''});
  if(n.game==='timeline')Object.assign(p,{order:['tea','cross','receipt','gate'],selected:null,stage:0,links:[],done:false});
  if(n.game==='trial')Object.assign(p,{sent:'',sealed:'',selected:'',stage:0,seen:[]});
  if(n.game==='room')Object.assign(p,{seen:[],selected:'',windowStep:0});
 }
 function cipherDial(p){
  const position=(i,r)=>{const angle=(i*45-67.5)*Math.PI/180;return '--x:'+Math.cos(angle)*r+'%;--y:'+Math.sin(angle)*r+'%;';};
  const describe=words.map((_,i)=>String(i+1).padStart(2,'0')+' 对应 '+words[(i+p.shift)%8]).join('，');
  const numbers=words.map((_,i)=>'<span class="dial-number '+([4,7].includes(i)?'calibration-target':'')+'" style="'+position(i,43)+'" aria-hidden="true">'+String(i+1).padStart(2,'0')+'</span>').join('');
  const terms=words.map((word,i)=>{const slot=(i-p.shift+8)%8;return '<span class="dial-word '+([4,7].includes(slot)?'calibration-target':'')+'" data-slot="'+slot+'" style="'+position(slot,27)+'" aria-hidden="true">'+word+'</span>';}).join('');
  return '<div class="cipher-wheel aligned-dial" role="img" aria-label="译码盘：'+describe+'">'+art('cipher-dial','dial-art')+numbers+terms+'<div class="dial-center" aria-hidden="true"><span>移位</span><b>'+p.shift+'</b><span>格</span></div></div>';
 }
 function cipher(p){
  if(p.stage===2)return head('找出假信','正确接头：西院 · 19:40。点时间不符的信盖章，再出发；选错会被捕。','3 / 3')+'<div class="letter-pair">'+['上午七时四十分','晚间七时四十分'].map((time,i)=>'<button class="cipher-letter stamp-letter '+(p.marked===i?'marked':'')+'" data-action="cipher-mark" data-index="'+i+'" aria-pressed="'+(p.marked===i)+'"'+artStyle('cipher-letter-'+['a','b'][i])+'><span>密信 · '+['甲','乙'][i]+'</span><p>知微：明日西院后门。<br>见门内留灯，即可进入。</p><strong>'+time+'</strong><p class="signature">阅后即焚。　慎之</p><span class="ink-stamp">'+art('cipher-seal','seal-art')+(p.marked===i?'已标为假信':'点此标为假信')+'</span></button>').join('')+'</div>'+message(p,p.marked===null?'盖错可点另一封更改。':'已标记'+['甲','乙'][p.marked]+'为假信，将按'+['乙','甲'][p.marked]+'信赴约。')+button('按另一封信出发 →','cipher-depart',p.marked===null?'disabled':'',true);
  if(p.stage===1)return head('拼好并译出纸条',p.order.join(',')!=='0,1,2'?'点两片交换位置：从 ◇ 拼到 □，相邻边的符号要相同。':p.stamps.some(x=>x===null)?'纸片已拼好。点下方三个「译出」，再点「核对译文」。':'三个词已译出。点「核对译文」，查看接头时间。','2 / 3')+'<div class="fragment-table">'+p.order.map((id,i)=>'<button class="torn-slip '+(p.selected===i?'selected':'')+'" data-action="cipher-swap" data-index="'+i+'" aria-pressed="'+(p.selected===i)+'"'+artStyle('cipher-fragment-'+['a','b','c'][id])+'><span>'+['◇','△','○'][id]+'</span><strong>'+['06','02','04'][id]+'</strong><span>'+['△','○','□'][id]+'</span></button>').join('')+'</div><div class="decode-slots"'+artStyle('cipher-translated')+'>'+p.order.map((id,i)=>'<button class="decode-slot" data-action="cipher-stamp" data-index="'+i+'"><span>'+['06','02','04'][id]+' 的译词</span><strong>'+(p.stamps[i]===null?'译出':words[p.stamps[i]])+'</strong></button>').join('')+'</div><div class="word-key">'+p.order.map(id=>'<span>'+['06','02','04'][id]+' → '+words[(code[id]+p.shift)%8]+'</span>').join('')+'</div>'+message(p,'交换纸片后，需重新点击三个「译出」。')+button('核对译文 →','cipher-check',p.stamps.some(x=>x===null)?'disabled':'',true);
  return head('转动译码盘','点左右按钮转动词环，让红框的 08 对应北门、05 对应整点，再点「确认」。','1 / 3')+'<div class="cipher-layout"><div class="cipher-machine">'+cipherDial(p)+'<div class="wheel-controls">'+button('← 向左转','cipher-turn','data-dir="-1"')+button('向右转 →','cipher-turn','data-dir="1"')+'</div></div><div class="cipher-sheet"'+artStyle('cipher-calibration')+'><span class="sheet-label">需要对准</span><h3>08 → 北门<br>05 → 整点</h3><p class="calibration-note">转盘上的数字不动，词随按钮转动。</p>'+message(p,'两组对应必须同时吻合。')+button('确认 →','cipher-key','',true)+'</div></div>';
 }
 function roomHint(p){
  if(p.selected==='window'&&p.windowStep<3)return ['点击「托住窗框」，开始准备后窗退路。','点击「抽出横闩」，松开后窗。','点击「轻推窗框」，确认后窗能打开。'][p.windowStep];
  if(!p.seen.includes('door')||!p.seen.includes('window'))return '点击正门和后窗检查。后窗可操作，桌椅可选看。';
  return p.windowStep===3?'退路已准备好。点击「回到桌边等他」继续。':'想留退路，点击后窗操作；也可直接点「回到桌边等他」。';
 }
 function watch(p){
  const after=p.moved&&p.moment==='after',done=p.observed.length===2;
  const hint=done?'已找出两人。点击「收好观察记录」继续。':!p.moved?'点击后门的「把纸包移到这里」，看看谁跟着换位。':after?'点击两个换了位置的人。虚线标着他们原来的位置；可点「查看原位」对照。':'这是移动前的位置。记住后，点「查看现在」找出换位的人。';
  const person=(id,name)=>'<button class="watch-person '+(p.observed.includes(id)?'found':'')+'" data-action="watch-mark" data-id="'+id+'" '+(!after||done?'disabled':'')+' aria-pressed="'+p.observed.includes(id)+'">'+art({parcel:'watch-cobbler',curtain:'watch-grey-hat',customer:'watch-customer'}[id],'watch-figure')+'<strong>'+name+'</strong>'+(p.observed.includes(id)?'<span>已标记</span>':'')+'</button>';
  const parcel='<span class="watch-parcel">'+art('watch-parcel')+'<span>纸包</span></span>';
  const ghost=name=>'<span class="watch-origin">'+name+'原位</span>';
  const cells=[
   ['街口',after?ghost('补鞋人'):person('parcel','补鞋人')],
   ['前窗',after?ghost('灰帽客'):person('curtain','灰帽客')],
   ['柜台',after?'<span class="watch-empty">纸包已移走</span>':parcel],
   ['后巷',after?person('parcel','补鞋人'):'<span class="watch-empty">无人</span>'],
   ['茶桌',person('customer','喝茶客')],
   ['后门',after?parcel+person('curtain','灰帽客'):p.moved?'<span class="watch-empty">无人</span>':button('把纸包移到这里','watch-move','',true)]
  ];
  return head('谁在跟着纸包走？',hint,'已找到 '+p.observed.length+' / 2')+'<div class="watch-moment"><strong>'+(!p.moved?'移动前':after?'移动后':'原位对照')+'</strong>'+(p.moved?button(after?'查看原位':'查看现在','watch-compare'):'')+'</div><div class="watch-board">'+cells.map(([label,content],i)=>'<div class="watch-zone illustrated-zone">'+art(['watch-street','watch-front-window','watch-counter','watch-back-alley','watch-tea-table','watch-back-door'][i],'watch-place')+'<span class="watch-zone-name">'+label+'</span>'+content+'</div>').join('')+'</div><div class="parcel-story">'+(p.moved?'<figure>'+art('watch-parcel-lift')+'<figcaption>从柜台拿起</figcaption></figure><figure>'+art('watch-parcel-place')+'<figcaption>移到后门</figcaption></figure>':'<figure>'+art('watch-parcel-open')+'<figcaption>里面只是废报纸</figcaption></figure>')+'</div>'+message(p,done?'补鞋人和灰帽客都靠近了后门，喝茶客一直没动。茶馆已被盯上。':!p.moved?'纸包里只有废报纸，用它试探谁在盯着柜台。':'找位置变化的人，点击名字或人形即可。')+(done?button('收好观察记录 →','game-done','',true):'');
 }
 const timelineCards={receipt:['18:40','药铺取药','收据留有傅慎之签记。'],gate:['19:00','北巷钉栅','你亲见告示：封到明晨。'],cross:['20:10','穿过北巷','轨迹记录，标注“已查实”。'],tea:['20:20','到茶馆后门','同一份轨迹记录中的后一行。']};
 function timeline(p){
  return head(p.stage===0?'按时间排序':'找出矛盾记录',p.stage===0?'点两张卡交换位置，按时间从早到晚排列，再点「确认顺序」。':p.done?'已找到造假的记录，点击下方按钮继续。':'点选两条不能同时成立的记录，再点「核对矛盾」。',''+(p.stage+1)+' / 2')+'<div class="timeline-board">'+p.order.map((id,i)=>'<button class="timeline-card '+((p.stage===0?p.selected===i:p.links.includes(id))?'selected':'')+'" data-action="timeline-card" data-index="'+i+'" '+(p.done?'disabled':'')+' aria-pressed="'+(p.stage===0?p.selected===i:p.links.includes(id))+'">'+art({receipt:'timeline-receipt',gate:'timeline-gate',cross:'timeline-cross',tea:'timeline-tea'}[id],'timeline-art')+'<b>'+timelineCards[id][0]+'</b><strong>'+timelineCards[id][1]+'</strong><span>'+timelineCards[id][2]+'</span></button>').join('')+'</div>'+message(p,p.done?'十九时已经封死的北巷，不可能在二十时十分被直接穿过。指控至少有这一段造假。':p.stage===0?'按卡片上的时刻排列。':'留意北巷封路的时间。')+(p.done?button('记下轨迹的硬伤 →','game-done','',true):button(p.stage===0?'确认顺序 →':'核对矛盾','timeline-check',p.stage===1&&p.links.length!==2?'disabled':'',true));
 }
 const yards={east:'东院',west:'西院'};
 function trial(p){
  if(p.stage===1)return head('观察两处空院','分别点击东院、西院，比较哪一处出现了盯梢。','观察 '+p.seen.length+' / 2')+'<div class="trial-sealed">'+art('trial-seal')+'<span>一份寄出，一份封存。次夜，远处观察。</span></div><div class="trial-cards illustrated-trial">'+Object.entries(yards).map(([id,title])=>{const seen=p.seen.includes(id);return '<button class="yard-card '+(seen?'inspected':'unseen')+'" data-action="trial-look" data-id="'+id+'" aria-label="'+title+'，'+(seen?'已观察':'点击观察')+'"><div class="yard-view">'+(seen?art('trial-'+id+'-'+(p.sent===id?'watched':'empty'),'yard-art'):'<span class="unseen-yard">点击观察</span>')+'</div><strong>'+title+'</strong><span>'+(seen?(p.sent===id?'寄出地址：门外有人徘徊':'封存地址：整夜无人停留'):'尚未观察')+'</span></button>';}).join('')+'</div>'+message(p,p.seen.length===2?'只有寄出的地址出现盯梢。渠道已经泄密，傅本人是否参与仍待核实。':'不要走进院子。看清外面的动静就够了。')+(p.seen.length===2?button('记录对照结果 →','game-done','',true):'');
  return head('测试谁在泄密',p.selected?'已选'+yards[p.selected]+'。点击下方一个信袋，把地址放进去。':'点院名，再点信袋：一个寄出，一个留下。')+'<div class="paper-tags illustrated-tags">'+Object.entries(yards).map(([id,title])=>'<button type="button" data-action="trial-pick" data-id="'+id+'" aria-pressed="'+(p.selected===id)+'">'+art('trial-'+id+'-tag')+'<strong>'+title+'</strong></button>').join('')+'</div><div class="trial-cards illustrated-trial">'+[['sent','寄出袋','交给傅慎之'],['sealed','封存袋','留在自己手里']].map(([slot,title,desc])=>'<button class="envelope-slot" data-action="trial-place" data-slot="'+slot+'" aria-label="'+title+'：'+(yards[p[slot]]||'未放入地址')+'"><span>'+title+'</span><div class="envelope-picture">'+art(slot==='sent'?'trial-sent-envelope':'trial-kept-envelope')+'<strong>'+(yards[p[slot]]||'放入纸签')+'</strong></div><span>'+desc+'</span></button>').join('')+'</div>'+message(p,p.selected?'已选'+yards[p.selected]+'，点信袋放入。':'两处都是空院，纸签不含真人或真实联络点。')+button('开始观察 →','trial-launch',p.sent&&p.sealed?'':'disabled',true);
 }
 function room(p){
  const descriptions={door:'门外还有一道门扣。从外面扣住后，屋内开锁也走不了。',desk:'灯照着桌面，椅子挡在后窗前。你把椅子轻轻挪开。',window:['木闩压得很紧。先托住窗框，再抽横闩。','窗框已托稳，可以平着抽出横闩。','横闩已抽开。轻推窗框，确认外面能走。','窗外是空院。后窗已留缝，随时可以推开撤离。'][p.windowStep]};
  const detail=p.selected==='window'?['room-window-closed','room-window-support','room-window-unbolt','room-window-ready'][p.windowStep]:p.selected==='door'?'room-door-latch':p.selected==='desk'?'room-desk-chair':'';
  return head('检查房间，留下退路',roomHint(p))+'<div class="room-layout illustrated-room"><div class="room-plan room-photo">'+art('room-overview','room-overview')+[['door','正门'],['desk','桌与椅'],['window','后窗']].map(([id,title])=>'<button class="room-object '+id+' '+(p.selected===id?'selected':'')+'" data-action="room-look" data-id="'+id+'" aria-pressed="'+(p.selected===id)+'"><strong>'+title+'</strong><span>'+(p.seen.includes(id)?'已查看':'检查')+'</span></button>').join('')+'</div><div class="room-detail">'+(detail?art(detail,'room-detail-art'):'')+'<p class="exhibit-detail">'+(descriptions[p.selected]||'点击画面中的正门和后窗，检查出口。')+'</p>'+(p.selected==='window'&&p.windowStep<3?'<div class="object-controls room-work-controls">'+[['support','托住窗框'],['bolt','抽出横闩'],['push','轻推窗框']].map(([id,title],i)=>'<button type="button" class="secondary '+(i===p.windowStep?'next-step':'')+'" data-action="room-work" data-id="'+id+'" '+(i<p.windowStep?'disabled':'')+'>'+art(['room-window-support','room-window-unbolt','room-window-push'][i])+'<span>'+title+'</span></button>').join('')+'</div>':'')+message(p,p.windowStep===3?'后窗可用。正门被锁时，这就是退路。':'检查门窗后可以等人；松开后窗会留下退路。')+button('回到桌边等他 →','game-done',p.seen.includes('door')&&p.seen.includes('window')?'':'disabled',true)+'</div></div>';
 }

 function render(n,p,state){init(n,p);const view={cipher,route,confront,watch,timeline,trial,room}[n.game];return '<div class="interaction-surface">'+view(p,state)+'</div>';}
 function act(a,el,c){
  if(!/^(cipher-|route-|confront-|watch-|timeline-|trial-|room-|game-done)/.test(a))return false;
  const {p,state,node}=c;init(node,p);
  if(a==='game-done'){
   const done=(node.game==='route'&&p.won)||(node.game==='confront'&&p.round>=3)||(node.game==='watch'&&p.observed.length===2)||(node.game==='timeline'&&p.done)||(node.game==='trial'&&p.seen.length===2)||(node.game==='room'&&p.seen.includes('door')&&p.seen.includes('window'));
   if(done){
    if(node.game==='watch'){state.flags.watchCorrect=true;c.addClue('watch');}
    if(node.game==='timeline'){state.flags.timelineCorrect=true;c.addClue('forged');}
    if(node.game==='trial'){state.flags.channelLeak=true;c.addClue('trace');}
    if(node.game==='room')state.flags.exitPrepared=p.windowStep===3;
    c.go(node.next);
   }
   return true;
  }
  if(node.game==='cipher'){
   const i=Number(el.dataset.index);
   if(a==='cipher-turn'&&p.stage===0){p.shift=(p.shift+Number(el.dataset.dir)+8)%8;p.message='词环已转动。检查 08 和 05 同格内圈的词是否同时吻合。';}
   if(a==='cipher-key'&&p.stage===0){if(p.shift===3){p.stage=1;p.message='转盘已对准。接下来拼好纸条。';}else p.message='08 目前对应「'+words[(7+p.shift)%8]+'」，05 对应「'+words[(4+p.shift)%8]+'」。两条都对上，才能锁定。';}
   if(a==='cipher-swap'&&p.stage===1&&i>=0&&i<3){if(p.selected===null)p.selected=i;else{[p.order[i],p.order[p.selected]]=[p.order[p.selected],p.order[i]];p.selected=null;p.stamps=[null,null,null];}p.message='相邻符号要相同，从 ◇ 拼到 □。交换后需重新点三个「译出」。';}
   if(a==='cipher-stamp'&&p.stage===1&&i>=0&&i<3){p.stamps[i]=(code[p.order[i]]+p.shift)%8;p.message='已译出这个数字。继续译出其他数字。';}
   if(a==='cipher-check'&&p.stage===1){if(p.order.join(',')==='0,1,2'&&p.stamps.join(',')==='0,4,6'){p.stage=2;p.message='正确时间：西院 · 19:40。接下来标记假信。';}else p.message='还没拼对：从 ◇ 排到 □，相邻符号相同，再点三个「译出」。';}
   if(a==='cipher-mark'&&p.stage===2&&(i===0||i===1)){p.marked=i;p.message='';}
   if(a==='cipher-depart'&&p.stage===2&&p.marked!==null){c.go(p.marked===0?node.next:'end-exposed');return true;}
  }
  if(node.game==='watch'){
   if(a==='watch-move'&&!p.moved){p.moved=true;p.moment='after';p.message='纸包移到后门，两个人也换了位置。点出他们。';}
   if(a==='watch-compare'&&p.moved){p.moment=p.moment==='after'?'before':'after';p.message='';}
   if(a==='watch-mark'&&p.moved&&p.moment==='after'){
    const id=el.dataset.id;
    if(['parcel','curtain'].includes(id)&&!p.observed.includes(id)){p.observed.push(id);p.message=p.observed.length===2?'两个人都跟着纸包靠近后门，盯梢已确认。':'找对了一个。再点出另一个换位的人。';}
    else if(id==='customer')p.message='喝茶客一直在茶桌旁，位置没有变。再对照一下。';
   }
  }
  if(node.game==='timeline'){
   const i=Number(el.dataset.index);
   if(a==='timeline-card'&&!p.done&&i>=0&&i<4){
    if(p.stage===0){if(p.selected===null)p.selected=i;else{[p.order[i],p.order[p.selected]]=[p.order[p.selected],p.order[i]];p.selected=null;}}
    else{const id=p.order[i];if(p.links.includes(id))p.links=p.links.filter(x=>x!==id);else if(p.links.length<2)p.links.push(id);else p.message='已连接两项。先点一项撤回，再换另一张。';}
   }
   if(a==='timeline-check'&&!p.done){if(p.stage===0){if(p.order.join(',')==='receipt,gate,cross,tea'){p.stage=1;p.selected=null;p.links=[];p.message='顺序复原了。现在连接互相矛盾的两项。';}else p.message='先核对卡上的时刻，从最早排到最晚。点两张卡交换。';}else if(p.links.includes('gate')&&p.links.includes('cross')){p.done=true;state.flags.timelineCorrect=true;c.addClue('forged');p.message='封巷早于穿行。这份轨迹至少有一段不可能成立。';}else p.message='这两项可以先后发生，不能互相推翻。检查哪两条对同一条路的状态说法不同。';}
  }
  if(node.game==='trial'){
   const id=el.dataset.id,slot=el.dataset.slot;
   if(a==='trial-pick'&&p.stage===0&&yards[id]){p.selected=id;p.message='';}
   if(a==='trial-place'&&p.stage===0&&['sent','sealed'].includes(slot)){if(p.selected){const other=slot==='sent'?'sealed':'sent';if(p[other]===p.selected)p[other]='';p[slot]=p.selected;p.selected='';p.message='纸签已放入信袋。两袋必须使用不同的地址。';}else p.message='先点上方一个院名，再点信袋。';}
   if(a==='trial-launch'&&p.stage===0){if(p.sent&&p.sealed&&p.sent!==p.sealed){p.stage=1;p.message='寄出袋只交给傅的渠道；封存袋始终留在自己手里。次夜，去比较两边。';}else p.message='分别放入两处不同的空院，才能保留对照。';}
   if(a==='trial-look'&&p.stage===1&&yards[id]&&!p.seen.includes(id)){p.seen.push(id);p.message=p.seen.length===2?'两处已比较：只有寄出的地址出现盯梢，泄密发生在这条渠道。':'记下这一处，还要看另一处才能判断。';}
  }
  if(node.game==='room'){
   const id=el.dataset.id;
   if(a==='room-look'&&['door','desk','window'].includes(id)){p.selected=id;if(!p.seen.includes(id))p.seen.push(id);p.message='';}
   if(a==='room-work'&&p.selected==='window'&&p.windowStep<3){const order=['support','bolt','push'];if(id===order[p.windowStep]){p.windowStep++;p.message=['','你托稳窗框，木闩不再承重。','横闩已取下，还要确认窗框推得开。','窗外空院可通行。后窗已留缝，退路准备好了。'][p.windowStep];}else p.message=p.windowStep===0?'窗框的重量压着木闩，直接抽闩或推窗都动不了。先托稳窗框。':'按检查到的结构操作：先抽出横闩，再轻推窗框。';}
  }
  if(node.game==='route'){
   if(a==='route-reset'&&p.failed)resetRoute(p);
   if((a==='route-move'||a==='route-wait')&&!p.failed&&!p.won){
    const x=a==='route-wait'?p.x:Number(el.dataset.x),y=a==='route-wait'?p.y:Number(el.dataset.y);
    if(!Number.isInteger(x)||!Number.isInteger(y)||x<0||x>5||y<0||y>3)return true;
    if(wall.has(x+','+y)||Math.abs(x-p.x)+Math.abs(y-p.y)>(a==='route-wait'?0:1)||(a==='route-move'&&x===p.x&&y===p.y)){p.message='一次只走相邻的一格；封巷不能通行。';c.render();return true;}
    const old=[p.x,p.y],before=patrols.map(path=>path[p.turn%path.length]);p.turn++;
    const after=patrols.map(path=>path[p.turn%path.length]);
    const hit=after.some((pos,i)=>(pos[0]===x&&pos[1]===y)||(before[i][0]===x&&before[i][1]===y&&pos[0]===old[0]&&pos[1]===old[1]));
    if(hit){p.alarm++;state.flags.riskMissed=true;const retreat=[...p.trail].reverse().find(pos=>after.every(a=>a[0]!==pos[0]||a[1]!==pos[1]))||[0,3];p.x=retreat[0];p.y=retreat[1];p.message='你在巷角撞见巡查，被迫退回掩体。送件车的时刻已错过。';}
    else{p.x=x;p.y=y;p.trail.push([x,y]);p.message=a==='route-wait'?'你隐在门洞里，等巡查先过。':'你贴着墙移动了一格。';}
    if(p.alarm>=3){p.failed=true;p.message='三次暴露，巷口已被堵住。重新推演；延误送件车的后果保留。';}
    else if(p.x===5&&p.y===0){p.won=true;p.message=state.flags.riskMissed?'尾随甩开了，密件仍在；今晚的送件车已经错过。':'你准时脱身，密件与新点都没有暴露。';}
    else if(p.turn>=14){p.failed=true;state.flags.riskMissed=true;p.message='送件车已离开，巡查收紧包围。重新规划路线，密件改走明晨渠道。';}
   }
  }
  if(node.game==='confront'&&p.round<3){
   if(a==='confront-pick'&&!p.answered&&exhibitIds.includes(el.dataset.id)&&state.clues.includes(el.dataset.id)){p.selectedEvidence=el.dataset.id;p.message='';}
   if(a==='confront-show'&&!p.answered&&p.selectedEvidence){
    const r=rounds[p.round];
    if(p.selectedEvidence===r.answer){p.answered=true;p.message=r.reply;}
    else if(p.wrong.includes(p.selectedEvidence))p.message='这项已核对过，仍不能推翻当前这句话。换一项直接证据。';
    else{p.wrong.push(p.selectedEvidence);p.mistakes++;p.message='“这和我说的这一件事有什么关系？”这项疑点不能直接反驳当前证词。';if(p.mistakes>=2){state.flags.fuClosed=true;p.message+=' 他开始叫门外的人，劝说余地减少了。';}}
   }
   if(a==='confront-next'&&p.answered){p.round++;p.answered=false;p.selectedEvidence='';p.wrong=[];p.message='';}
  }
  c.render();return true;
 }
 return {render,act};
})();

