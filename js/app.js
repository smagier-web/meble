(function(){
'use strict';
const KC=window.KC, F=KC.fmt;
const KEY='kuchnia-v2';
let model=load()||KC.defaults();
let res=null, selId=null, tab='formatki', sbTab='cabs', onlySel=false, packMat='korpus';
const $=id=>document.getElementById(id);

function load(){
  try{
    const j=JSON.parse(localStorage.getItem(KEY)||'null');
    if(j&&j.s&&Array.isArray(j.cabs)){const d=KC.defaults();j.s=Object.assign(d.s,j.s);return j;}
  }catch(e){}
  return null;
}
function save(){try{localStorage.setItem(KEY,JSON.stringify(model));}catch(e){}}

const TYPES={
  base:{drzwi:'Szafka z drzwiami',szuflady:'Szafka z szufladami',zlew:'Szafka pod zlew',zmywarka:'Zmywarka (sam front)',naroznik:'Narożna ślepa'},
  wall:{drzwi:'Szafka wisząca'},
  tall:{drzwi:'Słupek'},
  mod:{drzwi:'Moduł (wnęka)'}
};
const WIDTHS=[150,200,300,400,450,500,600,800,900,1000];
let uid=100;
const nid=()=>'c'+(++uid)+Math.random().toString(36).slice(2,5);

/* ---------------- settings schema ---------------- */
const SET=[
 {h:'Płyty i okleiny'},
 {k:'t',l:'Płyta korpusu',u:'mm',t:'sel',o:[16,18,19]},
 {k:'frontT',l:'Płyta frontów',u:'mm',t:'sel',o:[16,18,19,22]},
 {k:'hdf',l:'HDF (plecy)',u:'mm',t:'sel',o:[3,4]},
 {k:'eVis',l:'Okleina krawędzi widocznych',u:'mm',t:'sel',o:[0.45,1,2]},
 {k:'hidEdges',l:'Oklejaj krawędzie niewidoczne',t:'chk'},
 {k:'eBody',l:'Okleina krawędzi niewidocznych',u:'mm',t:'sel',o:[0.45,0.6,1]},
 {k:'eFront',l:'Okleina frontów',u:'mm',t:'sel',o:[0.8,1,2]},
 {k:'subEdge',l:'Od wymiaru do cięcia odejmuj okleinę',t:'chk'},
 {h:'Wymiary i standardy'},
 {k:'gap',l:'Szczelina między frontami',u:'mm',t:'sel',o:[2,3,4]},
 {k:'plinth',l:'Wysokość cokołu (nóżki)',u:'mm',t:'sel',o:[100,120,150]},
 {k:'baseH',l:'Wysokość korpusu dolnego',u:'mm',t:'sel',o:[720,760,800]},
 {k:'baseD',l:'Głębokość korpusu dolnego',u:'mm',t:'sel',o:[460,520,560]},
 {k:'blatT',l:'Grubość blatu',u:'mm',t:'sel',o:[28,38,40]},
 {k:'blatD',l:'Głębokość blatu',u:'mm',t:'sel',o:[600,635,650]},
 {k:'wallH',l:'Wysokość szafek wiszących',u:'mm',t:'sel',o:[360,576,720,900]},
 {k:'wallD',l:'Głębokość szafek wiszących',u:'mm',t:'sel',o:[300,320,350]},
 {k:'wallY',l:'Dół szafek wiszących od podłogi',u:'mm',t:'num',step:10},
 {k:'tallTotal',l:'Wysokość słupka (z cokołem)',u:'mm',t:'num',step:50},
 {k:'tallSplit',l:'Podział frontów słupka od podłogi',u:'mm',t:'num',step:10},
 {h:'Cokół'},
 {k:'plMode',l:'Rodzaj cokołu',t:'sel',o:[['ciagly','płyta — jedna listwa na ciąg'],['szafki','płyta — osobno pod każdą szafką'],['listwa','profil alu / PCV (w mb)'],['brak','brak cokołu']]},
 {k:'plMat',l:'Płyta cokołu',t:'sel',o:[['korpus','jak korpus'],['front','jak fronty']]},
 {k:'plT',l:'Grubość płyty cokołu',u:'mm',t:'sel',o:[16,18,19]},
 {k:'plClr',l:'Prześwit nad podłogą',u:'mm',t:'num',step:1},
 {k:'plRecess',l:'Cofnięcie od frontu',u:'mm',t:'num',step:5},
 {k:'plMax',l:'Maks. długość jednej listwy',u:'mm',t:'num',step:50},
 {k:'plEnd',l:'Zaślepki na wolnych końcach',t:'chk'},
 {h:'Konstrukcja'},
 {k:'back',l:'Plecy HDF',t:'sel',o:[['rowek','w rowku'],['nakladane','nakładane']]},
 {k:'backSet',l:'Cofnięcie płyt (przy rowku)',u:'mm',t:'num',step:1},
 {k:'topMode',l:'Góra szafki dolnej',t:'sel',o:[['wience','2 wieńce'],['pelna','pełna płyta']]},
 {k:'wienceW',l:'Szerokość wieńców',u:'mm',t:'num',step:10},
 {h:'Pomieszczenie'},
 {k:'layout',l:'Układ',t:'sel',o:[['I','prosty (ciąg A)'],['L','litera L (A + B)']]},
 {k:'roomA',l:'Ściana A (tylna)',u:'mm',t:'num',step:10},
 {k:'roomB',l:'Ściana B (lewa)',u:'mm',t:'num',step:10},
 {h:'Rozkrój'},
 {k:'sheetL',l:'Arkusz — długość',u:'mm',t:'num',step:10},
 {k:'sheetW',l:'Arkusz — szerokość',u:'mm',t:'num',step:10},
 {k:'kerf',l:'Szerokość cięcia (rzaz)',u:'mm',t:'num',step:1},
 {k:'trim',l:'Obcięcie obrzeża arkusza',u:'mm',t:'num',step:1},
 {k:'rotate',l:'Dekor bez usłojenia (obrót formatek)',t:'chk'},
 {k:'frontSame',l:'Fronty z tej samej płyty co korpus',t:'chk'},
 {k:'waste',l:'Zapas okleiny',u:'%',t:'num',step:1},
 {h:'Kolory (podgląd 3D)'},
 {k:'cBody',l:'Korpus',t:'col'},{k:'cFront',l:'Fronty',t:'col'},{k:'cBlat',l:'Blat',t:'col'}
];
function renderSet(){
  let h='';
  SET.forEach(f=>{
    if(f.h){h+=`<div class="sec-h">${f.h}</div>`;return;}
    const v=model.s[f.k];let inp='';
    if(f.t==='sel'){
      inp='<select data-k="'+f.k+'">'+f.o.map(o=>{const val=Array.isArray(o)?o[0]:o,lab=Array.isArray(o)?o[1]:F(o);return `<option value="${val}" ${String(val)===String(v)?'selected':''}>${lab}</option>`;}).join('')+'</select>';
      if(typeof f.o[0]==='number'&&!f.o.includes(v)) inp=inp.replace('</select>',`<option value="${v}" selected>${F(v)}</option></select>`);
    } else if(f.t==='num') inp=`<input type="number" data-k="${f.k}" value="${v}" step="${f.step||1}">`;
    else if(f.t==='chk') inp=`<input type="checkbox" data-k="${f.k}" ${v?'checked':''}>`;
    else inp=`<input type="color" data-k="${f.k}" value="${v}">`;
    h+=`<div class="setrow"><label>${f.l}${f.u?` <span class="u">(${f.u})</span>`:''}</label><div>${inp}</div></div>`;
  });
  h+='<div id="setInfo" class="info"></div>';
  $('pSet').innerHTML=h;
  $('pSet').querySelectorAll('[data-k]').forEach(el=>{
    const k=el.dataset.k,f=SET.find(x=>x.k===k);
    const apply=()=>{
      let v;
      if(f.t==='chk')v=el.checked;else if(f.t==='col')v=el.value;
      else if(f.t==='num')v=+el.value;
      else v=(typeof f.o[0]==='number')?+el.value:el.value;
      model.s[k]=v;refresh({keepSet:true});
    };
    el.addEventListener(f.t==='col'?'input':'change',apply);
  });
}

/* ---------------- cabinets panel ---------------- */
const isFloor=c=>c.lvl!=='wall';
function renderCabs(){
  const s=model.s;let h='';
  const sec=(run,floor)=>{
    const list=model.cabs.filter(c=>c.run===run&&(floor?c.lvl!=='wall':c.lvl==='wall'));
    const title=`Ciąg ${run} — ${floor?'dolne i słupki':'wiszące'}`;
    h+=`<div class="sec-h">${title}</div>`;
    if(!list.length)h+='<div style="margin:0 12px 6px;color:var(--mut);font-size:12.5px">brak szafek</div>';
    list.forEach(c=>h+=cabHtml(c));
  };
  sec('A',true);sec('A',false);
  if(s.layout==='L'){sec('B',true);sec('B',false);}
  h+=`<div class="sec-h">Dodaj szafkę</div><div class="addbar">
   <select id="addRun" style="width:78px"><option value="A">Ciąg A</option>${s.layout==='L'?'<option value="B">Ciąg B</option>':''}</select>
   <button id="bWiz" class="pri" style="width:100%">Zaprojektuj moduł wg wnęki…</button><div style="width:100%;height:0"></div><button data-add="base">+ Dolna</button><button data-add="wall">+ Wisząca</button><button data-add="tall">+ Słupek</button></div>`;
  $('pCabs').innerHTML=h;
  $('pCabs').querySelectorAll('.cab .row').forEach(r=>r.addEventListener('click',()=>{selId=selId===r.parentNode.dataset.id?null:r.parentNode.dataset.id;renderCabs();sel3D();renderRes();}));
  $('pCabs').querySelectorAll('[data-add]').forEach(b=>b.addEventListener('click',()=>addCab(b.dataset.add,$('addRun').value)));
  $('bWiz').addEventListener('click',()=>{wiz=newWiz();$('modal2').style.display='flex';renderWiz();});
  const c=selId&&model.cabs.find(x=>x.id===selId);
  if(c)wireEditor(c);
}
const opt=(list,cur)=>list.map(o=>{const v=Array.isArray(o)?o[0]:o,l=Array.isArray(o)?o[1]:o;return `<option value="${v}" ${String(v)===String(cur)?'selected':''}>${l}</option>`;}).join('');
function cabHtml(c){
  const code=res&&res.code[c.id]||'';
  const active=c.run==='A'||model.s.layout==='L';
  const d=KC.dimsOf(c,model.s);
  const label=c.lvl==='mod'?`Moduł · wnęka ${c.nw}×${c.nh}×${c.nd}`:(TYPES[c.lvl][c.type]||c.type);
  let h=`<div class="cab lv-${c.lvl} ${c.id===selId?'sel':''}" data-id="${c.id}"><div class="row"><span class="code">${code||'–'}</span><span class="t">${label}</span><span class="w">${c.w}×${d.H}</span></div>`;
  if(c.id===selId&&active)h+=`<div class="ed">${c.lvl==='mod'?modFields(c):genFields(c)}${commonFields(c)}</div>`;
  return h+'</div>';
}
function genFields(c){
  const types=TYPES[c.lvl];
  const hasDoors=c.type==='drzwi'||c.type==='zlew';
  const poz=c.orient==='poz'&&hasDoors;
  const nOpts=c.type==='szuflady'?[1,2,3,4,5]:c.type==='naroznik'?[1]:poz?[1,2,3,4,5,6]:[1,2,3,4];
  return `<div><label>Typ</label><select data-f="type" ${Object.keys(types).length<2?'disabled':''}>${opt(Object.keys(types).map(k=>[k,types[k]]),c.type)}</select></div>
    <div><label>Szerokość (mm)</label><input type="number" data-f="w" value="${c.w}" step="10" min="100"></div>
    <div class="full"><div class="chips">${WIDTHS.map(w=>`<button data-w="${w}">${w}</button>`).join('')}<button data-fill="1" title="Dopasuj do wolnego miejsca na ścianie">wypełnij</button></div></div>
    ${hasDoors?`<div class="full"><label>Układ frontów</label><select data-f="orient">${opt([['pion','Pionowe — drzwi obok siebie'],['poz','Poziome — fronty jeden nad drugim']],c.orient||'pion')}</select></div>`:''}
    ${c.type==='zmywarka'?'':`<div><label>${c.type==='szuflady'?'Liczba szuflad':poz?'Liczba frontów':'Liczba drzwi'}</label><select data-f="n">${opt(nOpts,c.n)}</select></div>`}
    ${(c.type==='drzwi'||c.type==='naroznik'||c.type==='zlew')?`<div><label>Półki</label><select data-f="shelves">${opt([0,1,2,3,4,5,6,7,8],c.shelves||0)}</select></div>`:''}
    ${c.type==='naroznik'?`<div><label>Szerokość frontu (mm)</label><input type="number" data-f="fw" value="${c.fw}" step="10"></div>`:''}
    <div><label>Usłojenie frontów</label><select data-f="grain">${opt([['auto','Wg układu'],['pion','Pionowe'],['poz','Poziome']],c.grain||'auto')}</select></div>`;
}
function autoSel(c,label,flag,key,list){
  const auto=c[flag]!==false;
  return `<div><label>${label}</label><select data-ma="${flag}|${key}"><option value="auto" ${auto?'selected':''}>Auto (${c[key]})</option>${list.map(o=>`<option value="${o}" ${!auto&&c[key]===o?'selected':''}>${o}</option>`).join('')}</select></div>`;
}
function modFields(c){
  const poz=c.orient==='poz';
  return `<div><label>Szerokość wnęki (mm)</label><input type="number" data-mn="nw" value="${c.nw}" step="10" min="150"></div>
    <div><label>Wysokość wnęki (mm)</label><input type="number" data-mn="nh" value="${c.nh}" step="10" min="250"></div>
    <div><label>Głębokość wnęki (mm)</label><input type="number" data-mn="nd" value="${c.nd}" step="10" min="200"></div>
    <div><label>Luz na stronę (mm)</label><input type="number" data-mn="clr" value="${c.clr}" step="1" min="0"></div>
    <div><label>Cokół</label><select data-ms="pl">${opt([[0,'brak'],[100,'100 mm'],[120,'120 mm'],[150,'150 mm']],c.pl)}</select></div>
    <div><label>Układ frontów</label><select data-ms="orient">${opt([['pion','Pionowe (drzwi)'],['poz','Poziome (jeden nad drugim)']],c.orient||'pion')}</select></div>
    ${autoSel(c,poz?'Liczba frontów':'Liczba drzwi','aN','n',poz?[1,2,3,4,5,6]:[1,2,3,4])}
    ${autoSel(c,'Półki w każdej sekcji','aSh','shelves',[0,1,2,3,4,5,6,7,8,9,10])}
    ${autoSel(c,'Przegrody pionowe','aDiv','dividers',[0,1,2,3,4])}
    ${poz?'':autoSel(c,'Podział frontów góra/dół','aLv','levels',[1,2])}
    <div><label>Usłojenie frontów</label><select data-ms="grain">${opt([['auto','Wg układu'],['pion','Pionowe'],['poz','Poziome']],c.grain||'auto')}</select></div>`;
}
function commonFields(c){
  return `<div><label>Ciąg</label><select data-f="run">${opt(model.s.layout==='L'?['A','B']:['A'],c.run)}</select></div>
    ${c.lvl==='wall'?'':`<div><label>Cokół pod szafką</label><select data-f="noPl">${opt([['0','tak'],['1','nie']],c.noPl?'1':'0')}</select></div>`}
    <div class="full acts"><button data-act="up">↑</button><button data-act="down">↓</button><button data-act="dup">Duplikuj</button><button data-act="del">Usuń</button></div>`;
}
function wireMod(root,obj,cb){
  root.querySelectorAll('[data-mn]').forEach(i=>i.addEventListener('change',()=>{obj[i.dataset.mn]=Math.max(0,+i.value||0);cb();}));
  root.querySelectorAll('[data-ms]').forEach(i=>i.addEventListener('change',()=>{const k=i.dataset.ms;obj[k]=(k==='pl')?+i.value:i.value;if(k==='orient')obj.aN=true;cb();}));
  root.querySelectorAll('[data-ma]').forEach(i=>i.addEventListener('change',()=>{const p=i.dataset.ma.split('|');if(i.value==='auto')obj[p[0]]=true;else{obj[p[0]]=false;obj[p[1]]=+i.value;}cb();}));
}
const fixN=c=>{if(c.type==='szuflady'||c.type==='zmywarka'||c.type==='naroznik')return;c.n=c.orient==='poz'?(c.lvl==='wall'?1:2):(c.w>600?2:1);};
function wireEditor(c){
  const el=$('pCabs').querySelector(`.cab[data-id="${c.id}"]`);if(!el)return;
  el.querySelectorAll('[data-f]').forEach(inp=>inp.addEventListener('change',()=>{
    const f=inp.dataset.f;let v=inp.value;
    if(['w','n','shelves','fw'].includes(f))v=+v;
    if(f==='noPl'){c.noPl=v==='1';refresh();return;}
    c[f]=v;
    if(f==='type'){c.n=v==='szuflady'?3:(c.w>600?2:1);if(v==='zlew'||v==='zmywarka'||v==='szuflady')c.shelves=0;if(v==='drzwi'&&c.lvl==='base'&&!c.shelves)c.shelves=1;if(v!=='drzwi'&&v!=='zlew')c.orient='pion';}
    if(f==='w')fixN(c);
    if(f==='orient')fixN(c);
    if(f==='run'&&model.s.layout!=='L')c.run='A';
    refresh();
  }));
  if(c.lvl==='mod')wireMod(el,c,()=>refresh());
  el.querySelectorAll('[data-w]').forEach(b=>b.addEventListener('click',()=>{c.w=+b.dataset.w;fixN(c);refresh();}));
  el.querySelectorAll('[data-fill]').forEach(b=>b.addEventListener('click',()=>{
    const info=res.info[c.run];if(!info)return;
    const room=c.run==='A'?model.s.roomA:model.s.roomB;
    const end=isFloor(c)?info.floorEnd:info.wallEnd;
    const free=room-end;if(free>0||c.w+free>=100){c.w=Math.max(100,c.w+free);refresh();}
  }));
  el.querySelectorAll('[data-act]').forEach(b=>b.addEventListener('click',e=>{
    e.stopPropagation();
    const a=b.dataset.act,i=model.cabs.indexOf(c);
    if(a==='del'){model.cabs.splice(i,1);selId=null;}
    if(a==='dup'){const d=Object.assign({},c,{id:nid()});model.cabs.splice(i+1,0,d);selId=d.id;}
    if(a==='up'||a==='down'){
      const dir=a==='up'?-1:1;
      for(let j=i+dir;j>=0&&j<model.cabs.length;j+=dir){
        const o=model.cabs[j];
        if(o.run===c.run&&isFloor(o)===isFloor(c)){model.cabs[i]=o;model.cabs[j]=c;break;}
      }
    }
    refresh();
  }));
}
function addCab(lvl,run){
  const d={base:{type:'drzwi',w:600,n:1,shelves:1},wall:{type:'drzwi',w:600,n:1,shelves:2},tall:{type:'drzwi',w:600,n:1,shelves:4}}[lvl];
  const c=Object.assign({id:nid(),run,lvl,fw:450},d);
  model.cabs.push(c);selId=c.id;refresh();
}
/* ---- kreator modułu ---- */
let wiz=null;
function newWiz(){return {id:'w',run:'A',lvl:'mod',type:'drzwi',nw:1200,nh:2100,nd:560,clr:2,pl:100,orient:'pion',grain:'auto',aN:true,aSh:true,aDiv:true,aLv:true,n:1,shelves:0,dividers:0,levels:1,fw:450};}
function renderWiz(){
  const s=model.s;
  KC.resolveMod(wiz,s);
  $('wForm').innerHTML=modFields(wiz)+`<div><label>Dodaj do ciągu</label><select id="wRun">${opt(s.layout==='L'?['A','B']:['A'],wiz.run)}</select></div>`;
  wireMod($('wForm'),wiz,renderWiz);
  $('wRun').addEventListener('change',e=>{wiz.run=e.target.value;});
  const parts=KC.buildCab(wiz,s);
  const poz=wiz.orient==='poz',sec=(wiz.dividers||0)+1;
  const doorW=poz?wiz.w-s.gap:wiz.w/(wiz.n||1)-s.gap;
  let area=0;const map=new Map();
  parts.forEach(p=>{if(p.kind==='handle')return;area+=p.L*p.W/1e6;const k=[p.name,Math.round(p.L*10),Math.round(p.W*10),p.T].join('|');if(map.has(k))map.get(k).q++;else map.set(k,{p,q:1});});
  const rows=[...map.values()].map(({p,q})=>`<tr><td>${p.name}</td><td class="n">${q}</td><td>${F(Math.round(p.L*10)/10)} × ${F(Math.round(p.W*10)/10)}</td><td>${p.T}</td><td>${p.mat==='hdf'?'—':edgeTxt(p.edges)}</td></tr>`).join('');
  $('wPrev').innerHTML=`<div class="info" style="margin:0 0 8px"><b>Moduł ${wiz.w} × ${wiz.H} × ${wiz.D+s.frontT} mm</b> (szer. × wys. korpusu × głęb. z frontem) w wnęce ${wiz.nw} × ${wiz.nh} × ${wiz.nd} mm. Luz ${wiz.clr} mm na stronę i u góry${wiz.pl?`, cokół ${wiz.pl} mm`:', bez cokołu'}.<br>
   ${wiz.n} ${poz?'fr. poziomych':'drzwi'} po ${F(Math.round(doorW*10)/10)} mm · ${sec} ${sec===1?'sekcja':'sekcje'} · półki: ${wiz.shelves} w sekcji (razem ${wiz.shelves*sec}) · płyta korpusu ok. ${F(area,2)} m²</div>
   <table><tr><th>Element</th><th class="n">Szt</th><th>Wymiar gotowy (dł. × szer.)</th><th>Gr.</th><th>Okleina</th></tr>${rows}</table>`;
}

/* ---------------- results ---------------- */
const TABS=[['formatki','Formatki'],['fronty','Fronty'],['okleina','Okleina'],['rozkroj','Rozkrój'],['okucia','Okucia i podsumowanie']];
function renderTabs(){
  $('tabs').innerHTML=TABS.map(t=>`<button class="tab ${t[0]===tab?'on':''}" data-t="${t[0]}">${t[1]}</button>`).join('')+
   `<span style="flex:1"></span><label style="font-size:12.5px;color:var(--mut);display:${tab==='formatki'||tab==='fronty'?'flex':'none'};gap:6px;align-items:center;padding-bottom:4px"><input type="checkbox" id="onlySel" ${onlySel?'checked':''}>tylko wybrana szafka</label>`;
  $('tabs').querySelectorAll('.tab').forEach(b=>b.addEventListener('click',()=>{tab=b.dataset.t;renderTabs();renderRes();}));
  const o=$('onlySel');if(o)o.addEventListener('change',()=>{onlySel=o.checked;renderRes();});
}
function edgeTxt(e){
  const f=v=>v?F(v):'–';
  return `D ${f(e[0])} / ${f(e[1])} · S ${f(e[2])} / ${f(e[3])}`;
}
function group(list,keyf){
  const m=new Map();
  list.forEach(p=>{const k=keyf(p);if(m.has(k))m.get(k).q++;else m.set(k,{p,q:1});});
  return [...m.values()];
}
function renderMetrics(){
  const a=res.area,sh=res.sheets,s=model.s;
  const edgeTot=res.edges.reduce((x,e)=>x+e.gross,0);
  const sc=(sh.korpus?sh.korpus.count:0),sf=(sh.front?sh.front.count:0),sd=(sh.hdf?sh.hdf.count:0);
  const blatMb=res.blat.reduce((x,b)=>x+b.L,0)/1000;
  const M=(b,l)=>`<div class="m"><b>${b}</b><span>${l}</span></div>`;
  $('metrics').innerHTML=
    M(F(a.korpus,2)+' m²','płyta korpusowa '+s.t+' mm')+
    M(F(a.front,2)+' m²','fronty '+s.frontT+' mm')+
    M(F(a.hdf,2)+' m²','HDF '+s.hdf+' mm')+
    M(F(edgeTot,1)+' mb','okleina z zapasem '+s.waste+'%')+
    M(`${sc}${s.frontSame?'':' + '+sf} szt.`,s.frontSame?'arkuszy korpus + fronty':'arkuszy korpus + front')+
    M(sd+' szt.','arkuszy HDF')+
    M(F(blatMb,2)+' mb','blat '+s.blatT+' mm × '+s.blatD);
}
function renderRes(){
  if(!res)return;
  const s=model.s,H=[];
  const sel=(p)=>!onlySel||!selId||p.cab===selId;
  if(tab==='formatki'){
    H.push('<div class="leg">Wymiary w mm: dł. × szer. (dł. = wzdłuż usłojenia). <b>Do cięcia</b> = gotowy wymiar minus okleina na krawędziach. Okleina: D = krawędzie wzdłuż długości (1 / 2), S = krawędzie wzdłuż szerokości (1 / 2); wartości w mm.</div>');
    H.push('<table><tr><th>Szafka</th><th>Element</th><th class="n">Szt</th><th>Gotowy</th><th>Do cięcia</th><th>Gr.</th><th>Okleina</th></tr>');
    ['korpus','front','hdf','blat'].forEach(mat=>{
      const rows=group(res.pieces.filter(p=>p.mat===mat&&p.kind!=='handle'&&sel(p)),p=>[p.code,p.name,p.L,p.W,p.T,p.edges.join()].join('|'));
      if(!rows.length)return;
      H.push(`<tr class="sec"><td colspan="7">${res.matName[mat]}</td></tr>`);
      rows.sort((a,b)=>a.p.code.localeCompare(b.p.code,'pl',{numeric:true}));
      rows.forEach(({p,q})=>H.push(`<tr class="${p.cab===selId?'hl':''}"><td><span class="code">${p.code}</span></td><td>${p.name}</td><td class="n">${q}</td><td>${F(p.L)} × ${F(p.W)}</td><td class="cut">${F(p.cutL)} × ${F(p.cutW)}</td><td>${p.T}</td><td>${p.mat==='hdf'?'—':edgeTxt(p.edges)}</td></tr>`));
    });
    H.push('</table>');
  }
  else if(tab==='fronty'){
    H.push(`<div class="leg">Fronty nakładane: szerokość = szerokość szafki / liczba drzwi − szczelina ${s.gap} mm; wysokość = wysokość korpusu − szczelina. Krawędzie frontów oklejone ${F(s.eFront)} mm ze wszystkich stron.</div>`);
    H.push('<table><tr><th>Szafka</th><th>Front</th><th class="n">Szt</th><th>Gotowy (szer. × wys.)</th><th>Do cięcia</th><th>Usłojenie</th><th class="n">Zawiasy</th><th class="n">Prowadnice</th></tr>');
    const fr=res.pieces.filter(p=>p.kind==='front'&&sel(p));
    const vw=p=>p.box[3],vh=p=>p.box[4];
    group(fr,p=>[p.code,p.name,p.box[3],p.box[4]].join('|')).sort((a,b)=>a.p.code.localeCompare(b.p.code,'pl',{numeric:true})).forEach(({p,q})=>{
      const cw=p.cutW,cl=p.cutL;const dims=p.gv?[p.cutW,p.cutL]:[p.cutL,p.cutW];
      H.push(`<tr class="${p.cab===selId?'hl':''}"><td><span class="code">${p.code}</span></td><td>${p.name}</td><td class="n">${q}</td><td>${F(vw(p))} × ${F(vh(p))}</td><td class="cut">${F(dims[0])} × ${F(dims[1])}</td><td>${p.gv?'pionowe':'poziome'}</td><td class="n">${p.hinges?p.hinges*q:'–'}</td><td class="n">${p.slides?q:'–'}</td></tr>`);
    });
    H.push('</table>');
  }
  else if(tab==='okleina'){
    H.push(`<div class="leg">Zapas ${s.waste}% na docinanie i odpad. „Zakup” zaokrąglone w górę do pełnych metrów.</div>`);
    H.push('<table><tr><th>Okleina</th><th class="n">Grubość</th><th class="n">Netto, mb</th><th class="n">Z zapasem, mb</th><th class="n">Zakup, mb</th></tr>');
    const nm={korpus:'Do płyty korpusowej',front:'Do frontów',blat:'Do blatu'};
    res.edges.forEach(e=>H.push(`<tr><td>${nm[e.mat]}</td><td class="n">${F(e.th)} mm</td><td class="n">${F(e.net,1)}</td><td class="n">${F(e.gross,1)}</td><td class="n cut">${e.buy}</td></tr>`));
    H.push('</table>');
  }
  else if(tab==='rozkroj'){
    const keys=Object.keys(res.sheets);if(!keys.includes(packMat))packMat=keys[0];
    H.push('<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">');
    keys.forEach(k=>H.push(`<button data-pm="${k}" class="${k===packMat?'on':''}">${k==='korpus'?(s.frontSame?'Korpus + fronty':'Korpus'):k==='front'?'Fronty':'HDF'}</button>`));
    const R=res.sheets[packMat];
    H.push(`<span style="color:var(--mut)">Arkusz ${s.sheetL}×${s.sheetW} · rzaz ${s.kerf} mm · obrzeże ${s.trim} mm · <b style="color:var(--ink)">${R.count} szt.</b> · wykorzystanie ${Math.round(R.util*100)}%</span></div>`);
    if(R.unfit.length)H.push(`<div class="warn">Nie mieszczą się w arkuszu: ${R.unfit.map(u=>u.label+' '+F(u.L)+'×'+F(u.W)).join(', ')}</div>`);
    H.push('<div class="sheets">');
    R.sheets.forEach((sh,i)=>{
      let svg=`<svg viewBox="0 0 ${s.sheetL} ${s.sheetW}"><rect x="0" y="0" width="${s.sheetL}" height="${s.sheetW}" fill="none" stroke="currentColor" stroke-width="6" opacity=".5"/><rect x="${s.trim}" y="${s.trim}" width="${s.sheetL-2*s.trim}" height="${s.sheetW-2*s.trim}" fill="none" stroke="currentColor" stroke-dasharray="20 20" stroke-width="3" opacity=".3"/>`;
      sh.items.forEach(it=>{
        const hue=(parseInt(it.cab.replace(/\D/g,''),10)*47+(it.cab.charCodeAt(1)||0)*13)%360;
        svg+=`<rect x="${it.x}" y="${it.y}" width="${it.w}" height="${it.h}" fill="hsl(${hue} 55% 62%)" stroke="#222" stroke-width="3"><title>${it.label} ${F(it.w)}×${F(it.h)}</title></rect>`;
        if(it.w>330&&it.h>120)svg+=`<text x="${it.x+it.w/2}" y="${it.y+it.h/2+26}" font-size="${it.h>200?72:56}" text-anchor="middle" fill="#111">${it.label.split(' ')[0]} ${F(it.w)}×${F(it.h)}</text>`;
      });
      svg+=`<text x="30" y="${s.sheetW-24}" font-size="64" fill="currentColor" opacity=".6">Arkusz ${i+1}</text></svg>`;
      H.push(svg);
    });
    H.push('</div>');
  }
  else {
    const hw=res.hw;
    H.push('<table><tr><th>Pozycja</th><th class="n">Ilość</th></tr>');
    [['Zawiasy (puszkowe)',hw.hinges],['Prowadnice szuflad (pary)',hw.slides],['Uchwyty',hw.handles],['Nóżki cokołowe',hw.legs],['Zawieszki szafek wiszących',hw.hangers]].concat(res.plProfile>0?[['Listwa cokołowa — profil, mb',F(Math.ceil(res.plProfile/100)/10,1)]]:[]).forEach(r=>H.push(`<tr><td>${r[0]}</td><td class="n cut">${r[1]}</td></tr>`));
    H.push('</table>');
    H.push(`<div class="leg" style="margin-top:10px">Założenia: zawiasy 2 szt. do frontu ≤ 900 mm, 3 szt. do 1600 mm, 4 szt. do 2000 mm. Nóżki 4 szt. na szafkę (6 szt. powyżej 900 mm). Szuflady zakładane jako boxy metalowe (bez formatek).</div>`);
  }
  $('tbody').innerHTML=H.join('');
  $('tbody').querySelectorAll('[data-pm]').forEach(b=>b.addEventListener('click',()=>{packMat=b.dataset.pm;renderRes();}));
}
function renderWarns(){
  const w=res.warn.slice();
  Object.keys(res.sheets).forEach(k=>{if(res.sheets[k].unfit.length)w.push('Są formatki większe niż arkusz ('+k+').');});
  const s=model.s;
  $('warns').innerHTML=w.map(x=>`<div class="warn">${x}</div>`).join('');
  const blatY=s.plinth+s.baseH+s.blatT,gapW=s.wallY-blatY;
  const A=res.info.A,B=res.info.B;
  const si=$('setInfo');
  if(si)si.innerHTML=`Wysokość blatu od podłogi: <b>${blatY} mm</b> (typowo 850–950)<br>Odstęp blat – szafki wiszące: <b>${gapW} mm</b> (zalecane 450–600)<br>Góra szafek wiszących: <b>${s.wallY+s.wallH} mm</b><br>Ciąg A: dolne ${A.floorLen} z ${s.roomA} mm (wolne ${s.roomA-A.floorEnd}), wiszące ${A.wallLen} mm (wolne ${s.roomA-A.wallEnd})`+(res.plin.length?`<br><b>Cokół:</b> `+res.plin.map(p=>`${p.name} ${F(Math.round(p.L*10)/10)} × ${F(p.W)} × ${p.T} mm`).join('; '):(s.plMode==='szafki'?'<br><b>Cokół:</b> osobno pod każdą szafką (zob. Formatki)':''))+(B?`<br>Ciąg B: dolne ${B.floorLen} mm (wolne ${s.roomB-B.floorEnd}), wiszące ${B.wallLen} mm (wolne ${s.roomB-B.wallEnd})`:'');
}

/* ---------------- 3D ---------------- */
const mm=0.001;
function isDark(){const t=document.documentElement.getAttribute('data-theme');return t?t==='dark':matchMedia('(prefers-color-scheme: dark)').matches;}
let three=null;
function init3D(){
  if(!window.THREE){$('hint').textContent='Nie udało się wczytać biblioteki 3D (three.js). Reszta aplikacji działa.';return;}
  const el=$('view');
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  el.insertBefore(renderer.domElement,el.firstChild);
  const scene=new THREE.Scene();
  const cam=new THREE.PerspectiveCamera(40,1,0.05,60);
  scene.add(new THREE.HemisphereLight(0xffffff,0x8a857a,0.85));
  const sun=new THREE.DirectionalLight(0xffffff,0.75);
  sun.position.set(3.5,5.5,5);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
  const sc=sun.shadow.camera;sc.left=-5;sc.right=5;sc.top=5;sc.bottom=-5;sc.near=0.5;sc.far=16;sun.shadow.bias=-0.0004;
  scene.add(sun);
  const root=new THREE.Group();scene.add(root);
  const ctl=new THREE.OrbitControls(cam,renderer.domElement);
  ctl.enableDamping=true;ctl.dampingFactor=.08;ctl.maxPolarAngle=Math.PI*0.495;ctl.autoRotateSpeed=1.6;
  three={renderer,scene,cam,ctl,root,groups:[],blat:[],show:{fronts:true,wall:true,blat:true},ray:new THREE.Raycaster(),fitted:false};
  const resize=()=>{const w=el.clientWidth,h=el.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();};
  new ResizeObserver(resize).observe(el);resize();
  let down=null;
  renderer.domElement.addEventListener('pointerdown',e=>{down=[e.clientX,e.clientY];});
  renderer.domElement.addEventListener('pointerup',e=>{
    if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>4)return;
    const r=renderer.domElement.getBoundingClientRect();
    const v=new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);
    three.ray.setFromCamera(v,cam);
    const hits=three.ray.intersectObjects(root.children,true);
    for(const h of hits){
      let o=h.object,vis=true,id=null;
      while(o){if(!o.visible)vis=false;if(o.userData&&o.userData.cabId){id=o.userData.cabId;}o=o.parent;}
      if(vis&&id){selId=id;renderCabs();sel3D();renderRes();return;}
    }
  });
  (function loop(){requestAnimationFrame(loop);ctl.update();renderer.render(scene,cam);})();
}
function setView(v){
  if(!three)return;
  const s=model.s,cx=s.roomA*mm*.45,cz=s.layout==='L'?s.roomB*mm*.4:1.0;
  three.ctl.target.set(cx,0.8,cz);
  const P={persp:[cx+s.roomA*mm*.65,3.4,cz+Math.max(s.roomA,s.roomB)*mm*.95],top:[cx,Math.max(s.roomA,s.roomB)*mm*1.15+2,cz+0.001],front:[cx,1.3,cz+5.2],side:[cx+5.4,1.3,cz]}[v];
  three.cam.position.set(...P);three.ctl.update();
  document.querySelectorAll('[data-v]').forEach(b=>b.classList.toggle('on',b.dataset.v===v));
}
const matCache={};
function mat(color,o){return new THREE.MeshStandardMaterial(Object.assign({color,roughness:.75,metalness:0},o||{}));}
function boxMesh(b,m,edge){
  const g=new THREE.BoxGeometry(b[3]*mm,b[4]*mm,b[5]*mm);
  const me=new THREE.Mesh(g,m);
  me.position.set((b[0]+b[3]/2)*mm,(b[1]+b[4]/2)*mm,(b[2]+b[5]/2)*mm);
  me.castShadow=me.receiveShadow=true;
  if(edge){me.add(new THREE.LineSegments(new THREE.EdgesGeometry(g),edge));}
  return me;
}
function build3D(){
  if(!three)return;
  const s=model.s,T=three;
  while(T.root.children.length){const o=T.root.children[0];T.root.remove(o);o.traverse(x=>{if(x.geometry)x.geometry.dispose();});}
  T.groups=[];T.blat=[];
  const mBody=mat(s.cBody),mFront=mat(s.cFront,{roughness:.55}),mBack=mat('#cfc8b8'),mBlat=mat(s.cBlat,{roughness:.4}),mPl=mat(s.plMode==='listwa'?'#9aa0a6':(s.plMat==='front'?s.cFront:s.cBody),{roughness:.6}),mH=mat('#b9bec5',{metalness:.85,roughness:.3});
  const eB=new THREE.LineBasicMaterial({color:0x000000,transparent:true,opacity:.18});
  const eF=new THREE.LineBasicMaterial({color:0x000000,transparent:true,opacity:.28});
  // floor and walls
  const dk=isDark();
  const RA=s.roomA*mm,RB=(s.layout==='L'?s.roomB:Math.max(1800,res.Df+800))*mm,WH=2.6;
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(RA,RB),mat(dk?'#252d32':'#d9dcd7',{roughness:.9}));
  floor.rotation.x=-Math.PI/2;floor.position.set(RA/2,0,RB/2);floor.receiveShadow=true;T.root.add(floor);
  const wA=new THREE.Mesh(new THREE.PlaneGeometry(RA,WH),mat(dk?'#343d43':'#f2f3ef',{roughness:1}));wA.position.set(RA/2,WH/2,0);wA.receiveShadow=true;T.root.add(wA);
  if(s.layout==='L'){const wB=new THREE.Mesh(new THREE.PlaneGeometry(RB,WH),mat(dk?'#2d353a':'#e7e9e4',{roughness:1}));wB.rotation.y=Math.PI/2;wB.position.set(0,WH/2,RB/2);wB.receiveShadow=true;T.root.add(wB);}
  // cabinets
  res.act.forEach(c=>{
    const pl=res.place[c.id];if(!pl)return;
    const g=new THREE.Group();g.userData={cabId:c.id,lvl:c.lvl};
    if(pl.run==='A')g.position.set(pl.pos*mm,0,0);
    else{g.position.set(0,0,(pl.pos+c.w)*mm);g.rotation.y=Math.PI/2;}
    const d=KC.dimsOf(c,s);
    (res.byCab[c.id]||[]).forEach(p=>{
      if(p.kind==='front'){
        const m=boxMesh(p.box,mFront,eF);m.userData.front=true;g.add(m);
        if(p.handle){const h=boxMesh(p.handle,mH);h.userData.front=true;g.add(h);}
      } else if(p.kind==='back') g.add(boxMesh(p.box,mBack));
      else if(p.kind==='plinth') g.add(boxMesh(p.box,mPl));
      else g.add(boxMesh(p.box,mBody,eB));
    });
    const y1=c.lvl==='wall'?d.y0:0,hh=d.y0+d.H-y1;
    const bx=new THREE.BoxGeometry((c.w+8)*mm,(hh+8)*mm,(d.D+s.frontT+8)*mm);
    const sb=new THREE.LineSegments(new THREE.EdgesGeometry(bx),new THREE.LineBasicMaterial({color:0xff7a00}));
    sb.position.set(c.w/2*mm,(y1+hh/2)*mm,(d.D+s.frontT)/2*mm);sb.visible=c.id===selId;g.userData.sel=sb;g.add(sb);
    T.root.add(g);T.groups.push(g);
  });
  res.blat.forEach(b=>{const m=boxMesh(b.box,mBlat);T.root.add(m);T.blat.push(m);});
  res.plin.forEach(p=>{T.root.add(boxMesh(p.box,mPl));});
  applyShow();
  if(!T.fitted){T.fitted=true;setView('persp');}
}
function applyShow(){
  if(!three)return;const T=three;
  T.groups.forEach(g=>{
    g.visible=!(g.userData.lvl==='wall'&&!T.show.wall);
    g.children.forEach(o=>{if(o.userData.front)o.visible=T.show.fronts;});
  });
  T.blat.forEach(b=>b.visible=T.show.blat);
}
function sel3D(){
  if(!three)return;
  three.groups.forEach(g=>{g.userData.sel.visible=g.userData.cabId===selId;});
}

/* ---------------- main ---------------- */
function refresh(o){
  o=o||{};
  res=KC.compute(model);
  if(selId&&!model.cabs.find(c=>c.id===selId))selId=null;
  save();
  if(!o.keepSet&&$('pSet').childElementCount===0)renderSet();
  renderCabs();renderMetrics();renderTabs();renderRes();renderWarns();build3D();
  if(o.layoutChanged&&three)setView('persp');
}
document.querySelectorAll('.sbtab').forEach(b=>b.addEventListener('click',()=>{
  sbTab=b.dataset.p;
  document.querySelectorAll('.sbtab').forEach(x=>x.classList.toggle('on',x===b));
  $('pCabs').style.display=sbTab==='cabs'?'':'none';
  $('pSet').style.display=sbTab==='set'?'':'none';
}));
const tog=(id,key)=>$(id).addEventListener('click',e=>{if(!three)return;three.show[key]=!three.show[key];e.currentTarget.classList.toggle('on',three.show[key]);applyShow();});
tog('tFronts','fronts');tog('tWall','wall');tog('tBlat','blat');
$('tSpin').addEventListener('click',e=>{if(!three)return;three.ctl.autoRotate=!three.ctl.autoRotate;e.currentTarget.classList.toggle('on',three.ctl.autoRotate);});
document.querySelectorAll('[data-v]').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.v)));
$('bReset').addEventListener('click',()=>{model=KC.defaults();selId=null;$('pSet').innerHTML='';renderSet();refresh({layoutChanged:true});});
$('bCsv').addEventListener('click',()=>{$('csvText').value=KC.csv(res,model);$('modal').style.display='flex';$('mMsg').textContent='';$('csvText').focus();$('csvText').select();});
$('wClose').addEventListener('click',()=>$('modal2').style.display='none');
$('wAdd').addEventListener('click',()=>{
  const c=Object.assign({},wiz,{id:nid()});
  model.cabs.push(c);selId=c.id;$('modal2').style.display='none';refresh();
});
$('mClose').addEventListener('click',()=>$('modal').style.display='none');
$('mCopy').addEventListener('click',async()=>{
  try{await navigator.clipboard.writeText($('csvText').value);$('mMsg').textContent='Skopiowano.';}
  catch(e){$('csvText').select();$('mMsg').textContent='Zaznaczone — skopiuj skrótem Ctrl+C.';}
});
const layoutWatch=$('pSet');
layoutWatch.addEventListener('change',e=>{if(e.target.dataset&&(e.target.dataset.k==='layout'||e.target.dataset.k==='roomA'||e.target.dataset.k==='roomB')&&three)setView('persp');});

renderSet();
init3D();
try{matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>build3D());new MutationObserver(()=>build3D()).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});}catch(e){}
refresh();
})();
