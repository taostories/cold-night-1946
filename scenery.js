/* 手写 SVG 场景：没有调用任何图片生成服务。后续原画可由 assets.js 替换。 */
window.Scenery = (() => {
  const defs = '<defs><linearGradient id="sky" x2="0.7" y2="1"><stop stop-color="#26343a"/><stop offset="1" stop-color="#4c5148"/></linearGradient><linearGradient id="wall"><stop stop-color="#1c282c"/><stop offset="1" stop-color="#39423f"/></linearGradient><linearGradient id="floor" x2="0" y2="1"><stop stop-color="#424c49"/><stop offset="1" stop-color="#18282d"/></linearGradient><radialGradient id="glow"><stop stop-color="#e7bf72" stop-opacity=".5"/><stop offset="1" stop-color="#e2b96c" stop-opacity="0"/></radialGradient><linearGradient id="beam" x2="0" y2="1"><stop stop-color="#e9c781" stop-opacity=".13"/><stop offset="1" stop-color="#e9c781" stop-opacity="0"/></linearGradient><pattern id="brick" width="110" height="48" patternUnits="userSpaceOnUse"><path d="M0 0H110M0 24H110M55 0V24M0 24V48M110 24V48" fill="none" stroke="#d9d3b1" stroke-opacity=".08"/></pattern><pattern id="tiles" width="36" height="18" patternUnits="userSpaceOnUse"><path d="M0 18Q18 0 36 18" stroke="#7b8370" stroke-opacity=".35" fill="none"/></pattern><pattern id="rain" width="91" height="135" patternUnits="userSpaceOnUse"><path d="M21 0L5 46M71 65L55 115" stroke="#b1c0b6" stroke-width="1" opacity=".18"/></pattern></defs>';
  const wrap = body => '<svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">' + defs + body + '</svg>';
  const lamp = '<circle cx="1150" cy="325" r="230" fill="url(#glow)"/><path d="M1148 318L1008 950H1300Z" fill="url(#beam)"/><path d="M1197 1000V293Q1197 258 1164 258H1148V287" fill="none" stroke="#131e22" stroke-width="13"/><path d="M1118 291H1180L1170 339H1128Z" fill="#b9a16b" stroke="#1f2727" stroke-width="8"/><path d="M1113 288L1149 267L1185 288" fill="#1c282c"/><path d="M1148 296V334" stroke="#464b3a" stroke-width="4"/>';
  const street = '<rect width="1600" height="1000" fill="url(#sky)"/><circle cx="1070" cy="170" r="42" fill="#d2d0b6" opacity=".22"/><path d="M680 440H1050V720H680Z" fill="#34413f"/><path d="M636 441L786 386L1082 427L1064 449Z" fill="#253237"/><path d="M710 470H1010V700H710Z" fill="url(#brick)"/><path d="M0 0L535 242V1000H0Z" fill="#142328"/><path d="M0 206L745 483V1000H0Z" fill="url(#wall)"/><path d="M0 206L745 483V1000H0Z" fill="url(#brick)"/><path d="M0 160L758 450L735 491L0 231Z" fill="#16272c"/><path d="M0 165L758 455L735 486L0 224Z" fill="url(#tiles)"/><path d="M1600 210L1040 472V1000H1600Z" fill="#293633"/><path d="M1600 210L1040 472V1000H1600Z" fill="url(#brick)"/><path d="M1600 170L1018 443L1035 478L1600 237Z" fill="#15262b"/><path d="M1600 178L1025 447L1039 470L1600 231Z" fill="url(#tiles)"/><path d="M755 670H1042L1600 1000H0Z" fill="url(#floor)"/><path d="M785 675L430 1000M903 673L911 1000M1025 680L1358 1000M716 722H1128M626 789H1255M469 901H1460" stroke="#879085" stroke-opacity=".15" stroke-width="2"/><path d="M817 677V527Q877 461 938 526V678" fill="#16282c" stroke="#5c6654" stroke-width="10"/><path d="M852 551H911V671H852Z" fill="#c9b078" opacity=".27"/><path d="M881 551V670M852 596H911" stroke="#172a2d" stroke-width="8"/><path d="M174 406L383 480V815L174 854Z" fill="#102025" stroke="#526052" stroke-width="9"/><path d="M209 441L351 491V758L209 781Z" fill="#273a3c"/><path d="M252 458V773M305 477V765M210 545L350 571M210 647L351 651" stroke="#12282c" stroke-width="10"/><path d="M1310 423L1451 364V731L1310 708Z" fill="#12282b" stroke="#69705c" stroke-width="8"/><path d="M1330 449L1430 409V605L1330 616Z" fill="#797b5b" opacity=".25"/><path d="M1378 431V612M1330 528L1430 504" stroke="#182c2d" stroke-width="8"/><path d="M0 117Q560 390 1241 193T1600 177" fill="none" stroke="#0f2128" stroke-width="3"/><path d="M0 140Q570 403 1232 223T1600 196" fill="none" stroke="#182a30" stroke-width="2"/>' + lamp + '<path d="M1100 830L1170 824L1189 840L1082 854Z" fill="#b8ab7c" opacity=".13"/><path d="M1048 914L1215 884L1260 916L1000 951Z" fill="#bbad7e" opacity=".07"/>';
  const interior = '<rect width="1600" height="1000" fill="#202b2b"/><rect width="1600" height="760" fill="url(#brick)"/><path d="M800 0V760M1450 0V760" stroke="#131e22" stroke-width="24"/><rect x="900" y="125" width="390" height="415" fill="#34464a" stroke="#121f22" stroke-width="25"/><rect x="920" y="146" width="350" height="370" fill="url(#sky)"/><path d="M1088 135V533M910 322H1285M955 150V512M1220 150V512" stroke="#142427" stroke-width="13"/><path d="M922 420L1030 362L1165 414L1270 373V516H922Z" fill="#243438"/><path d="M0 767L1600 714V1000H0Z" fill="#182628"/><path d="M577 657L1417 596L1550 793L463 850Z" fill="#3a3c30" stroke="#161f20" stroke-width="9"/><path d="M463 850L1550 793V835L470 899Z" fill="#282c25"/><path d="M545 880V1000M1432 836V1000" stroke="#111e20" stroke-width="36"/><path d="M754 697L966 683L1037 764L797 786Z" fill="#b3a47d"/><path d="M800 721L947 711M812 737L961 726M825 753L978 741" stroke="#756e54" stroke-width="2"/><path d="M584 697L713 689L762 749L620 764Z" fill="#7c7d61"/><path d="M594 704L706 697M603 715L715 707M613 729L728 721" stroke="#333e33" stroke-width="2"/><circle cx="1160" cy="549" r="260" fill="url(#glow)"/><ellipse cx="1160" cy="718" rx="48" ry="14" fill="#141e20"/><path d="M1160 713V599" stroke="#192729" stroke-width="16"/><path d="M1116 603Q1114 561 1134 542L1127 512H1193L1186 542Q1206 560 1204 603Z" fill="#a68d57" fill-opacity=".5" stroke="#2a3229" stroke-width="8"/><ellipse cx="1160" cy="580" rx="9" ry="25" fill="#dcc17c"/><path d="M1117 510H1204L1187 494H1135Z" fill="#172629"/><path d="M176 358H575V650H176Z" fill="#142327" stroke="#38453a" stroke-width="15"/><path d="M181 460H571M181 557H571M323 359V645M462 359V645" stroke="#38453a" stroke-width="9"/><path d="M200 388H292V432H200ZM343 485H439V535H343ZM492 381H550V439H492Z" fill="#606b55" opacity=".35"/>';
  const teahouse = street + '<path d="M1320 348L1450 293V487L1320 532Z" fill="#9a9472" stroke="#26342d" stroke-width="7"/><text x="1384" y="386" text-anchor="middle" fill="#3c4436" font-family="serif" font-size="39" transform="rotate(-12 1384 386)">茶</text><path d="M1281 775L1414 800M1302 763V824M1395 788V848" stroke="#18272b" stroke-width="13"/>';
  const scenes = {
    cover: street,
    press: interior,
    alley: street,
    teahouse,
    rain: street + '<rect width="1600" height="1000" fill="#15303d" opacity=".17"/><rect width="1600" height="1000" fill="url(#rain)"/>',
    room: interior + '<rect width="1600" height="1000" fill="#081015" opacity=".2"/>',
    dawn: street + '<rect width="1600" height="1000" fill="#b4a778" opacity=".12"/><circle cx="1080" cy="410" r="330" fill="url(#glow)"/>'
  };
  const details = [
    '<rect width="300" height="170" fill="#344143"/><path d="M0 112H300M210 0V170" stroke="#1c3035" stroke-width="7"/><path d="M0 40H300M0 79H300M0 150H300M60 0V40M140 40V79M60 79V112" stroke="#7f8775" opacity=".22"/><ellipse cx="155" cy="152" rx="45" ry="8" fill="#1c2c32"/><circle cx="155" cy="58" r="17" fill="#1b2a2e"/><path d="M132 77Q155 65 178 77L186 130H124ZM140 126L135 157M169 126L176 157" fill="#1b2a2e" stroke="#1b2a2e" stroke-width="9"/><path d="M132 50H178L170 38H140Z" fill="#15262c"/>',
    '<rect width="300" height="170" fill="#26373a"/><path d="M60 0H245V170H60Z" fill="#495247" stroke="#182b2e" stroke-width="9"/><path d="M153 0V170" stroke="#1d3033" stroke-width="7"/><path d="M105 40H201V126H105Z" fill="#b1a780" transform="rotate(-6 153 83)"/><text x="154" y="72" text-anchor="middle" font-family="serif" font-size="20" fill="#514e39">炉灶修缮</text><text x="154" y="102" text-anchor="middle" font-family="serif" font-size="16" fill="#514e39">今日早歇</text>',
    '<rect width="300" height="170" fill="#27383b"/><path d="M0 90H300V170H0Z" fill="#394542"/><path d="M0 125H300M0 160H300M110 90V125M210 125V170" stroke="#68705d" opacity=".25"/><path d="M108 121L173 104" stroke="#b3af93" stroke-width="9"/><path d="M160 108L175 104" stroke="#bc6c44" stroke-width="10"/><path d="M176 100Q156 75 179 54T182 22" fill="none" stroke="#b6ba9b" stroke-width="3" opacity=".4"/>',
    '<rect width="300" height="170" fill="#1b2e35"/><path d="M40 10H263V170H40Z" fill="#34464a" stroke="#4a5345" stroke-width="10"/><path d="M42 30H260V155H42Z" fill="#142a32"/><path d="M45 28Q130 60 126 155M260 28Q160 60 164 155" fill="#485347"/><path d="M145 15V170" stroke="#2b3c3c" stroke-width="8"/><circle cx="169" cy="86" r="32" fill="url(#glow)"/><path d="M158 86H181M169 75V97" stroke="#d6d7b0" stroke-width="2"/><circle cx="169" cy="86" r="4" fill="#f2e8bf"/>'
  ];
  let active = '', generation = 0;
  const decoded = new Map();
  function load(source) {
    if (decoded.has(source)) return decoded.get(source);
    const img = new Image();
    img.className = 'scene-art';
    img.alt = '';
    img.decoding = 'async';
    const ready = new Promise(resolve => {
      img.onload = async () => {
        try { await img.decode(); } catch {}
        resolve(img.naturalWidth ? img : null);
      };
      img.onerror = () => resolve(null);
      img.src = source;
    });
    decoded.set(source, ready);
    return ready;
  }
  // Decode the supplied backgrounds once, before the story needs them.
  Object.values(window.GAME_ASSETS.scenes || {}).filter(Boolean).forEach(load);
  function set(name) {
    if (active === name) return;
    active = name;
    const request = ++generation;
    const root = document.getElementById('scenery');
    const source = (window.GAME_ASSETS.scenes || {})[name];
    document.body.dataset.scene = name;
    if (!source) {
      root.innerHTML = wrap(scenes[name] || street);
      root.dataset.renderedScene = name;
      return;
    }
    // Keep the previous scene until the next bitmap is decoded. No SVG flash.
    load(source).then(img => {
      if (request !== generation) return;
      if (img) {
        // Keep the outgoing bitmap underneath until the new one has painted.
        root.append(img);
        requestAnimationFrame(() => requestAnimationFrame(() => {
          if (request !== generation) return;
          for (const child of [...root.children]) if (child !== img) child.remove();
          root.dataset.renderedScene = name;
        }));
      } else {
        root.innerHTML = wrap(scenes[name] || street);
        root.dataset.renderedScene = name;
      }
    });
  }
  return { set, detail: i => '<svg viewBox="0 0 300 170" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' + defs + details[i] + '</svg>' };
})();
