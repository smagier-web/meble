(function(root){
'use strict';
const r1=v=>Math.round(v*10)/10;

function defaults(){
  const c=(id,run,lvl,type,w,n,shelves,fw)=>({id,run,lvl,type,w,n,shelves,fw:fw||450});
  return {
    s:{
      t:18,hdf:3,frontT:18,
      eBody:0.45,eVis:1,eFront:2,hidEdges:true,subEdge:true,
      plMode:'ciagly',plT:18,plClr:2,plRecess:50,plMax:2400,plEnd:true,plMat:'korpus',
      gap:3,plinth:100,baseH:720,baseD:520,blatT:38,blatD:600,
      wallH:720,wallD:300,wallY:1400,tallTotal:2100,tallSplit:1300,
      back:'rowek',backSet:20,topMode:'wience',wienceW:100,
      sheetL:2800,sheetW:2070,kerf:4,trim:10,rotate:false,frontSame:false,waste:10,
      layout:'L',roomA:3700,roomB:3000,
      cBody:'#ECE9E1',cFront:'#7E9C94',cBlat:'#3B3B39'
    },
    cabs:[
      c('c1','A','base','naroznik',900,1,1,450),
      c('c2','A','base','zlew',800,2,0),
      c('c3','A','base','zmywarka',600,1,0),
      c('c4','A','base','szuflady',800,3,0),
      c('c5','A','tall','drzwi',600,1,4),
      c('c6','A','wall','drzwi',600,1,2),
      c('c7','A','wall','drzwi',800,2,2),
      c('c8','A','wall','drzwi',600,1,2),
      c('c9','A','wall','drzwi',800,2,2),
      c('c10','A','wall','drzwi',300,1,2),
      c('c11','B','base','szuflady',600,3,0),
      c('c12','B','base','drzwi',800,2,1),
      c('c13','B','base','drzwi',600,1,1),
      c('c14','B','wall','drzwi',600,1,2),
      c('c15','B','wall','drzwi',800,2,2)
    ]
  };
}

function dimsOf(c,s){
  if(c.lvl==='mod') return {H:c.H,D:c.D,y0:c.y0};
  if(c.lvl==='wall') return {H:s.wallH,D:s.wallD,y0:s.wallY};
  if(c.lvl==='tall') return {H:s.tallTotal-s.plinth,D:s.baseD,y0:s.plinth};
  return {H:s.baseH,D:s.baseD,y0:s.plinth};
}
// edges: [L1,L2,W1,W2]; L1/L2 run along the length, W1/W2 along the width
function edgesOf(s,vis){
  return [0,1,2,3].map(i=>vis.includes(i)?s.eVis:(s.hidEdges?s.eBody:0));
}
function resolveMod(c,s){
  const t=s.t;
  const clr=c.clr===undefined?2:c.clr, pl=c.pl===undefined?100:c.pl;
  c.clr=clr;c.pl=pl;
  c.w=Math.max(100,Math.round(c.nw-2*clr));
  c.D=Math.max(150,Math.round(c.nd-s.frontT-2));
  c.y0=pl;
  c.H=Math.max(200,Math.round(c.nh-clr-pl));
  if(c.aLv!==false)c.levels=c.H>1300?2:1;
  c.split=Math.round((pl+c.H*0.6)/10)*10;
  if(c.aN!==false)c.n=c.orient==='poz'?Math.min(6,Math.max(1,Math.ceil(c.H/600))):Math.min(4,Math.max(1,Math.ceil(c.w/650)));
  const iw=c.w-2*t;
  if(c.aDiv!==false)c.dividers=Math.max(0,Math.ceil(iw/800)-1);
  const inner=c.H-2*t;
  if(c.aSh!==false)c.shelves=Math.min(10,Math.max(0,Math.ceil(inner/360)-1));
  c.type='drzwi';
  return c;
}
function hingeCount(h){return h<=900?2:h<=1600?3:h<=2000?4:5;}

function buildCab(c,s){
  const P=[],t=s.t,g=s.gap,{H,D,y0}=dimsOf(c,s),W=c.w;
  const nak=s.back==='nakladane';
  const zb=nak?s.hdf:s.backSet, zs=nak?s.hdf:0;
  const add=o=>{o.cab=c.id;P.push(o);return o;};
  const part=(name,mat,T,L,Wd,vis,box,extra)=>add(Object.assign({name,mat,T,L,W:Wd,edges:edgesOf(s,vis),box,kind:'body'},extra||{}));
  const hz=D+s.frontT;
  const pH=c.lvl==='mod'?c.pl:s.plinth;

  if(c.type!=='zmywarka'){
    const sv=c.lvl==='wall'?[0,2,3]:c.lvl==='tall'?[0,3]:[0];
    const iw=W-2*t;
    part('Bok','korpus',t,H,D-zs,sv,[0,y0,zs,t,H,D-zs]);
    part('Bok','korpus',t,H,D-zs,sv,[W-t,y0,zs,t,H,D-zs]);
    part('Dno','korpus',t,iw,D-zb,[0],[t,y0,zb,iw,t,D-zb]);
    if(c.lvl==='base'&&s.topMode==='wience'){
      part('Wieniec przedni','korpus',t,iw,s.wienceW,[0],[t,y0+H-t,D-s.wienceW,iw,t,s.wienceW]);
      part('Wieniec tylny','korpus',t,iw,s.wienceW,[],[t,y0+H-t,zb,iw,t,s.wienceW]);
    } else {
      part('Góra','korpus',t,iw,D-zb,[0],[t,y0+H-t,zb,iw,t,D-zb]);
    }
    if(c.lvl==='wall') part('Listwa montażowa','korpus',t,iw,100,[],[t,y0+H-2*t,zb,iw,t,100]);
    const k=(c.type==='drzwi'||c.type==='naroznik'||c.type==='zlew')?(c.shelves||0):0;
    const dv=c.lvl==='mod'?(c.dividers||0):0;
    const inner=H-2*t,cw=(iw-dv*t)/(dv+1),sd=D-zb-20;
    for(let j=0;j<dv;j++) part('Przegroda pionowa','korpus',t,inner,sd,[0],[t+(j+1)*cw+j*t,y0+t,zb,t,inner,sd]);
    if(k>0){
      const gap=(inner-k*t)/(k+1);
      for(let j=0;j<=dv;j++){
        const sx=t+j*(cw+t);
        for(let i=0;i<k;i++) part('Półka','korpus',t,cw-2,sd,[0],[sx+1,y0+t+gap*(i+1)+t*i,zb,cw-2,t,sd]);
      }
    }
    if(nak) part('Plecy HDF','hdf',s.hdf,H-2,W-2,[],[1,y0+1,0,W-2,H-2,s.hdf],{kind:'back',edges:[0,0,0,0]});
    else part('Plecy HDF','hdf',s.hdf,H-2*t+14,W-2*t+14,[],[t-7,y0+t-7,Math.max(0,s.backSet-12),W-2*t+14,H-2*t+14,s.hdf],{kind:'back',edges:[0,0,0,0]});
  }
  if(c.lvl!=='wall'&&pH>0&&s.plMode==='szafki'&&!c.noPl){
    part('Cokół',s.plMat,s.plT,W,pH-s.plClr,[0],[0,s.plClr,hz-s.plRecess-s.plT,W,pH-s.plClr,s.plT],{kind:'plinth'});
  }

  const fe=[s.eFront,s.eFront,s.eFront,s.eFront];
  const gvf=def=>c.grain==='pion'?true:c.grain==='poz'?false:def;
  const poz=c.orient==='poz'&&(c.type==='drzwi'||c.type==='zlew');
  const fr=(name,x,y,w,h,o)=>{const gv=gvf(!!o.vertical);return add({name,mat:'front',T:s.frontT,L:gv?h:w,W:gv?w:h,gv,edges:fe.slice(),
    box:[x,y,D,w,h,s.frontT],kind:'front',handle:o.handle||null,hinges:o.hinges||0,slides:o.slides||0});};
  const vh=(x,y)=>[x,y,hz,12,160,16];
  const hh=(x,y,w)=>[x+w/2-80,y,hz,160,12,16];
  const doors=(prefix,n,y,h,handleLow)=>{
    if(poz){
      const band=h+g,fh=band/n-g,w=W-g;
      for(let i=0;i<n;i++){
        const yi=y-g/2+g/2+i*(fh+g);
        const hy=handleLow&&i===0?yi+20:yi+fh-40;
        fr(n>1?'Front poziomy':'Front',g/2,yi,w,fh,{vertical:false,handle:hh(g/2,hy,w),hinges:hingeCount(w)});
      }
      return;
    }
    for(let i=0;i<n;i++){
      const w=W/n-g,x=i*(W/n)+g/2;
      const hx=(n>=2&&i>=n/2)?x+16:x+w-28;
      const hy=handleLow?y+20:y+h-180;
      fr(prefix,x,y,w,h,{vertical:true,handle:vh(hx,hy),hinges:hingeCount(h)});
    }
  };
  if(c.type==='zmywarka'){
    fr('Front zmywarki',g/2,y0+g/2,W-g,H-g,{vertical:true,handle:hh(g/2,y0+H-60,W-g)});
  } else if(c.type==='szuflady'){
    const n=c.n||3,h=H/n-g;
    for(let i=0;i<n;i++){
      const y=y0+g/2+i*(h+g);
      fr('Front szuflady',g/2,y,W-g,h,{vertical:false,handle:hh(g/2,y+h-40,W-g),slides:1});
    }
  } else if(c.type==='naroznik'){
    const w=(c.fw||450)-g,x=W-(c.fw||450)+g/2;
    fr('Front narożnika',x,y0+g/2,w,H-g,{vertical:true,handle:vh(x+16,y0+H-180),hinges:hingeCount(H-g)});
  } else if(!poz&&(c.lvl==='tall'||(c.lvl==='mod'&&c.levels===2))){
    const sp=c.lvl==='tall'?s.tallSplit:c.split;
    const hl=sp-y0-g,hu=y0+H-sp-g;
    doors('Front dolny',c.n||1,y0+g/2,hl,false);
    doors('Front górny',c.n||1,sp+g/2,hu,true);
  } else if(c.lvl==='wall'){
    doors('Front',c.n||1,y0+g/2,H-g,true);
  } else if(poz){
    doors('Front',c.n||1,y0+g/2,H-g,false);
  } else {
    doors('Front',c.n||1,y0+g/2,H-g,false);
  }
  return P;
}

function compute(m){
  const s=m.s;
  m.cabs.forEach(c=>{if(c.lvl==='mod')resolveMod(c,s);});
  const act=m.cabs.filter(c=>c.run==='A'||s.layout==='L');
  const code={},cnt={};
  act.forEach(c=>{const k=c.run+(c.lvl==='wall'?'W':c.lvl==='tall'?'S':c.lvl==='mod'?'M':'D');cnt[k]=(cnt[k]||0)+1;code[c.id]=k+cnt[k];});

  const Df=s.baseD+s.frontT,Dw=s.wallD+s.frontT;
  const place={},blat=[],warn=[],info={},plin=[];let plProfile=0;
  for(const run of ['A','B']){
    if(run==='B'&&s.layout!=='L') continue;
    const start=run==='A'?0:Df,wstart=run==='A'?0:Dw;
    let pos=start,wpos=wstart,seg=null;const segs=[];const fl=[];
    act.filter(c=>c.run===run&&c.lvl!=='wall').forEach(c=>{
      const a0=pos;
      place[c.id]={run,pos:pos+(c.lvl==='mod'?c.clr:0)};
      if(c.lvl==='base'){ if(!seg){seg={a:pos,b:pos+c.w};segs.push(seg);} else seg.b=pos+c.w; }
      else seg=null;
      pos+=c.lvl==='mod'?c.nw:c.w;
      fl.push({c,a:a0,b:pos,pH:c.lvl==='mod'?c.pl:s.plinth,Dd:dimsOf(c,s).D});
    });
    act.filter(c=>c.run===run&&c.lvl==='wall').forEach(c=>{place[c.id]={run,pos:wpos};wpos+=c.w;});
    info[run]={floorStart:start,floorEnd:pos,floorLen:pos-start,wallStart:wstart,wallEnd:wpos,wallLen:wpos-wstart};
    const by=s.plinth+s.baseH;
    segs.forEach((sg,i)=>{
      let a=sg.a;if(run==='B'&&i===0&&a<s.blatD)a=s.blatD;
      const len=sg.b-a;if(len<=0)return;
      blat.push({cab:'blat',name:'Blat '+run+(i+1),mat:'blat',T:s.blatT,L:len,W:s.blatD,
        edges:[s.eFront,0,0,0],kind:'blat',
        box:run==='A'?[a,by,0,len,s.blatT,s.blatD]:[0,by,a,s.blatD,s.blatT,len]});
    });
    const roomLen=run==='A'?s.roomA:s.roomB;

    if(s.plMode==='ciagly'||s.plMode==='listwa'){
      const ps=[];let cur=null;
      fl.forEach(f=>{
        if(f.c.noPl||f.pH<=0||f.c.type==='zmywarka'&&false){cur=null;return;}
        const key=f.pH+'|'+f.Dd;
        if(cur&&cur.key===key)cur.b=f.b;
        else{cur={key,a:f.a,b:f.b,pH:f.pH,Dd:f.Dd};ps.push(cur);}
      });
      ps.forEach((sg,si)=>{
        const zf=sg.Dd+s.frontT-s.plRecess,h=sg.pH-s.plClr;
        let a=sg.a;
        if(run==='B'&&si===0&&sg.a===start)a=Math.min(a,s.baseD+s.frontT-s.plRecess);
        const len=sg.b-a,n=Math.max(1,Math.ceil(len/s.plMax)),Lp=len/n;
        if(s.plMode==='listwa'){plProfile+=len;}
        for(let i=0;i<n;i++){
          const aa=a+i*Lp;
          plin.push({cab:'plinth',code:'COK-'+run,name:`Cokół ${run}${ps.length>1?si+1:''}${n>1?` (${i+1}/${n})`:''}`,
            mat:s.plMode==='listwa'?'profil':s.plMat,T:s.plT,L:Lp,W:h,edges:edgesOf(s,[0]),kind:'plinth',
            box:run==='A'?[aa,s.plClr,zf-s.plT,Lp,h,s.plT]:[zf-s.plT,s.plClr,aa,s.plT,h,Lp]});
        }
        const roomLen2=run==='A'?s.roomA:s.roomB;
        if(si===ps.length-1&&s.plEnd&&sg.b<roomLen2-1){
          plin.push({cab:'plinth',code:'COK-'+run,name:'Zaślepka cokołu',mat:s.plMode==='listwa'?'profil':s.plMat,T:s.plT,L:h,W:s.plRecess,
            edges:edgesOf(s,[0]),kind:'plinth',
            box:run==='A'?[sg.b-s.plT,s.plClr,zf,s.plT,h,s.plRecess]:[zf,s.plClr,sg.b-s.plT,s.plRecess,h,s.plT]});
        }
      });
    }
    if(info[run].floorEnd>roomLen) warn.push(`Ciąg ${run}: dolne szafki (${r1(info[run].floorEnd)} mm) przekraczają ścianę (${roomLen} mm).`);
    if(info[run].wallEnd>roomLen) warn.push(`Ciąg ${run}: szafki wiszące (${r1(info[run].wallEnd)} mm) przekraczają ścianę (${roomLen} mm).`);
  }
  if(s.layout==='L'){
    const f=act.find(c=>c.run==='A'&&c.lvl!=='wall');
    if(f&&f.w<Df) warn.push(`Narożnik: pierwsza szafka w ciągu A ma ${f.w} mm, a ciąg B zaczyna się po ${Df} mm — szafki będą się nakładać.`);
    const fw=act.find(c=>c.run==='A'&&c.lvl==='wall');
    if(fw&&fw.w<Dw) warn.push(`Narożnik: pierwsza szafka wisząca w ciągu A jest węższa niż ${Dw} mm.`);
  }

  act.filter(c=>c.lvl==='mod').forEach(c=>{
    const iw=c.w-2*s.t,cw=(iw-(c.dividers||0)*s.t)/((c.dividers||0)+1);
    if(c.shelves>0&&cw-2>800)warn.push(`Moduł ${code[c.id]}: półki mają rozpiętość ${Math.round(cw-2)} mm (powyżej 800 mm mogą się uginać) — dodaj przegrodę pionową.`);
    if(c.orient!=='poz'&&c.w/(c.n||1)-s.gap>700)warn.push(`Moduł ${code[c.id]}: fronty szersze niż 700 mm — zwiększ liczbę drzwi.`);
    if(c.orient==='poz'&&c.w-s.gap>1000)warn.push(`Moduł ${code[c.id]}: poziome fronty szersze niż 1000 mm mogą się wyginać.`);
  });
  const pieces=[];
  act.forEach(c=>buildCab(c,s).forEach(p=>{p.code=code[c.id];pieces.push(p);}));
  blat.forEach(p=>{p.code='—';pieces.push(p);});
  plin.forEach(p=>{if(p.mat!=='profil')pieces.push(p);});

  pieces.forEach(p=>{
    const e=p.edges;
    if(s.subEdge&&p.mat!=='blat'){p.cutL=r1(p.L-(e[2]+e[3]));p.cutW=r1(p.W-(e[0]+e[1]));}
    else{p.cutL=r1(p.L);p.cutW=r1(p.W);}
    p.L=r1(p.L);p.W=r1(p.W);
  });

  const matName={korpus:`Płyta korpusowa ${s.t} mm`,front:`Płyta frontowa ${s.frontT} mm`,hdf:`HDF ${s.hdf} mm`,blat:`Blat ${s.blatT} mm`};
  const area={korpus:0,front:0,hdf:0,blat:0};
  const edgeMap={};
  pieces.forEach(p=>{
    area[p.mat]+=p.L*p.W/1e6;
    p.edges.forEach((e,i)=>{
      if(!e)return;
      const len=(i<2?p.L:p.W);
      const k=(p.mat==='front'?'front':p.mat==='blat'?'blat':'korpus')+'|'+e;
      edgeMap[k]=(edgeMap[k]||0)+len/1000;
    });
  });
  const edges=Object.keys(edgeMap).map(k=>{
    const [mat,th]=k.split('|');const net=edgeMap[k];
    return {mat,th:+th,net:r1(net),gross:r1(net*(1+s.waste/100)),buy:Math.ceil(net*(1+s.waste/100))};
  }).sort((a,b)=>a.mat===b.mat?a.th-b.th:a.mat.localeCompare(b.mat));

  const hw={hinges:0,slides:0,handles:0,legs:0,hangers:0};
  pieces.forEach(p=>{if(p.kind==='front'){hw.hinges+=p.hinges;hw.slides+=p.slides;if(p.handle)hw.handles++;}});
  act.forEach(c=>{
    if(c.lvl==='wall')hw.hangers+=2;
    else if(c.lvl!=='mod'||c.pl>0)hw.legs+=c.w>900?6:4;
  });

  // sheet packing
  const groups={};
  pieces.forEach(p=>{
    if(p.kind==='blat')return;
    const key=p.mat==='front'&&s.frontSame?'korpus':p.mat;
    (groups[key]=groups[key]||[]).push({L:p.cutL,W:p.cutW,label:p.code+' '+p.name,cab:p.code});
  });
  const sheets={};
  Object.keys(groups).forEach(k=>{sheets[k]=pack(groups[k],s);});

  const byCab={};
  pieces.forEach(p=>{(byCab[p.cab]=byCab[p.cab]||[]).push(p);});
  return {act,code,place,info,blat,plin,plProfile,warn,pieces,byCab,area,edges,hw,sheets,matName,Df,Dw};
}

function pack(items,s){
  const ux=s.sheetL-2*s.trim,uy=s.sheetW-2*s.trim,k=s.kerf;
  const unfit=[],prep=[];
  items.forEach(it=>{
    let opts=[[it.L,it.W]];
    if(s.rotate)opts.push([it.W,it.L]);
    opts=opts.filter(o=>o[0]<=ux&&o[1]<=uy);
    if(!opts.length){unfit.push(it);return;}
    opts.sort((a,b)=>a[1]-b[1]);
    prep.push({x:opts[0][0],y:opts[0][1],label:it.label,cab:it.cab});
  });
  prep.sort((a,b)=>b.y-a.y||b.x-a.x);
  const sheets=[];
  const put=(sh,shelf,it)=>{
    sh.items.push({x:s.trim+shelf.used,y:s.trim+shelf.y,w:it.x,h:it.y,label:it.label,cab:it.cab});
    shelf.used+=it.x+k;sh.area+=it.x*it.y;
  };
  prep.forEach(it=>{
    let done=false;
    for(const sh of sheets){
      for(const shelf of sh.shelves){
        if(it.y<=shelf.h&&shelf.used+it.x<=ux){put(sh,shelf,it);done=true;break;}
      }
      if(done)break;
      if(sh.usedY+it.y<=uy){
        const shelf={y:sh.usedY,h:it.y,used:0};sh.shelves.push(shelf);sh.usedY+=it.y+k;
        put(sh,shelf,it);done=true;break;
      }
    }
    if(!done){
      const sh={shelves:[],items:[],usedY:0,area:0};sheets.push(sh);
      const shelf={y:0,h:it.y,used:0};sh.shelves.push(shelf);sh.usedY=it.y+k;
      put(sh,shelf,it);
    }
  });
  const partsArea=prep.reduce((a,b)=>a+b.x*b.y,0);
  const total=sheets.length*s.sheetL*s.sheetW;
  return {sheets,unfit,count:sheets.length,util:total?partsArea/total:0};
}

const fmt=(n,d)=>{
  if(n===0)return '–';
  let v=(d===undefined?Math.round(n*100)/100:n.toFixed(d));
  return String(v).replace('.',',');
};

function csv(res,m){
  const rows=[['Szafka','Element','Szt','Dł. gotowa','Szer. gotowa','Grubość','Materiał','Okl. dł. 1','Okl. dł. 2','Okl. szer. 1','Okl. szer. 2','Dł. do cięcia','Szer. do cięcia']];
  const map={};
  res.pieces.forEach(p=>{
    const k=[p.code,p.name,p.L,p.W,p.T,p.mat,p.edges.join('/')].join('|');
    if(!map[k]){map[k]={p,q:0};}
    map[k].q++;
  });
  Object.values(map).forEach(({p,q})=>{
    rows.push([p.code,p.name,q,p.L,p.W,p.T,res.matName[p.mat],...p.edges,p.cutL,p.cutW].map(v=>typeof v==='number'?fmt(v):v));
  });
  return rows.map(r=>r.join(';')).join('\n');
}

root.KC={defaults,compute,pack,fmt,csv,dimsOf,hingeCount,buildCab,resolveMod};
if(typeof module!=='undefined')module.exports=root.KC;
})(typeof window!=='undefined'?window:globalThis);
