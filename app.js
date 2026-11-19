(() => {
'use strict';
const canvas=document.getElementById('model-network'),ctx=canvas.getContext('2d'),root=document.querySelector('.signal-theater');
const button=document.getElementById('motion'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
let time=reduced.matches?16:0,last=0,paused=reduced.matches,visible=true,w=0,h=0,lastPhase=-1;
const nodes=[],links=[],random=n=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x);};
// A layered neural network whose distribution only hints at a standing figure.
// There is no anatomical outline or internal anatomy.
const coreBlocks=[{y:.255,width:.225},{y:.335,width:.19},{y:.415,width:.17},{y:.495,width:.185}];
const layers=[
 {y:.045,spread:.035,n:6},{y:.09,spread:.073,n:12},{y:.145,spread:.072,n:12},
 {y:.20,spread:.032,n:5},
 ...coreBlocks.flatMap(b=>[{y:b.y,spread:b.width/2,n:10},{y:b.y+.045,spread:b.width/2,n:10}]),
 {y:.59,spread:.096,n:12}
];
function add(x,y,layer,seed){nodes.push({x,y,layer,seed:random(seed),z:(random(seed+73)-.5)*.065});}
layers.forEach((layer,i)=>{for(let j=0;j<layer.n;j++){const f=j/(layer.n-1)*2-1;const jitter=i<4||i===layers.length-1?.012:.002;add(f*layer.spread+(random(i*103+j)-.5)*jitter,layer.y+(random(i*71+j+3)-.5)*jitter,i,i*47+j);}});
// Sparse branching continuations imply limbs without drawing a human diagram.
[-1,1].forEach((side,branch)=>{
 for(let i=0;i<7;i++){const y=.325+i*.035,x=side*(.155+i*.009);for(let j=0;j<3;j++)add(x+(j-1)*.012,y+(random(i*51+j)-.5)*.016,20+branch*10+i,900+branch*100+i*7+j);}
 for(let i=0;i<11;i++){const y=.62+i*.031,x=side*(.045+i*.003);for(let j=0;j<4;j++)add(x+(j-1.5)*.011,y+(random(i*25+j)-.5)*.018,50+branch*15+i,1300+branch*130+i*13+j);}
});
const seen=new Set();
function armBranch(p){return p.layer>=20&&p.layer<=26?20:p.layer>=30&&p.layer<=36?30:0;}
function connect(a,b){if(a===b)return;const pa=nodes[a],pb=nodes[b],aa=armBranch(pa),ab=armBranch(pb);
 // Keep an articulated arm attached at its shoulder rather than tied along the torso.
 if(aa!==ab&&((aa&&pa.layer!==aa)||(ab&&pb.layer!==ab)))return;const key=a<b?a+','+b:b+','+a;if(seen.has(key))return;seen.add(key);links.push({a,b,seed:random(a*97+b*13)});}
nodes.forEach((p,i)=>{
 const nearest=nodes.map((q,j)=>({j,d:Math.hypot((p.x-q.x)*1.25,p.y-q.y)})).filter(v=>v.j!==i).sort((a,b)=>a.d-b.d);
 nearest.slice(0,4).forEach(v=>connect(i,v.j));
 const next=nearest.find(v=>nodes[v.j].y>p.y+.018&&v.d<.11);if(next)connect(i,next.j);
 if(i%4===0){const cross=nearest.filter(v=>v.d>.04&&v.d<.12);if(cross.length)connect(i,cross[Math.floor(random(i)*cross.length)].j);}
});
let entry=0;nodes.forEach((p,i)=>{if(Math.hypot(p.x+.065,p.y-.42)<Math.hypot(nodes[entry].x+.065,nodes[entry].y-.42))entry=i;});
// Distance through the actual graph delays each light's response to incoming chunks.
const adjacency=nodes.map(()=>[]);links.forEach(e=>{const a=nodes[e.a],b=nodes[e.b],d=Math.hypot(a.x-b.x,a.y-b.y);adjacency[e.a].push([e.b,d]);adjacency[e.b].push([e.a,d]);});
const distances=nodes.map(()=>Infinity);distances[entry]=0;const visited=new Set();
for(let k=0;k<nodes.length;k++){let best=-1;distances.forEach((d,i)=>{if(!visited.has(i)&&(best<0||d<distances[best]))best=i;});if(best<0||!Number.isFinite(distances[best]))break;visited.add(best);adjacency[best].forEach(([j,d])=>{distances[j]=Math.min(distances[j],distances[best]+d);});}
const maxDistance=Math.max(...distances.filter(Number.isFinite));nodes.forEach((p,i)=>p.delay=(Number.isFinite(distances[i])?distances[i]/maxDistance:1)*1.15);
const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
function light(t,p){return 1-.66*smooth((t-2.4-p.delay)/1.1)+.66*smooth((t-8.4-p.delay)/1.2);}
function bezier(a,c1,c2,b,t){const u=1-t;return{x:u*u*u*a.x+3*u*u*t*c1.x+3*u*t*t*c2.x+t*t*t*b.x,y:u*u*u*a.y+3*u*u*t*c1.y+3*u*t*t*c2.y+t*t*t*b.y};}
function dot(x,y,r,color,glow=0){ctx.fillStyle=color;ctx.shadowColor=color;ctx.shadowBlur=glow;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;}
function rect(x,y,width,height,r=1.5){ctx.beginPath();ctx.roundRect(x,y,width,height,r);}
function chunk(x,y,size,good,seed=1,alpha=1){
 ctx.save();ctx.translate(x,y);if(!good)ctx.rotate((random(seed)-.5)*.3);ctx.globalAlpha=alpha;ctx.shadowColor=good?'#ff735a':'transparent';ctx.shadowBlur=good?9:0;
 rect(-size/2,-size*.65,size,size*1.3);ctx.fillStyle=good?'rgba(255,103,74,.18)':'rgba(156,168,159,.08)';ctx.fill();ctx.strokeStyle=good?'#ff8269':'#94a09d';ctx.lineWidth=good?1.05:.8;ctx.stroke();ctx.shadowBlur=0;
 const kind=Math.abs(seed)%3;ctx.strokeStyle=good?'#ff9278':'#a3aaa3';ctx.fillStyle=ctx.strokeStyle;ctx.lineWidth=.7;
 if(kind===0){for(let row=0;row<3;row++){const bar=(size-5)*(good?(row===2?.62:1):(.3+random(seed*9+row)*.7));ctx.fillRect(-size/2+2.5,-size*.65+3+row*(size*.26),Math.max(1.5,bar),1);}}
 else if(kind===1){ctx.beginPath();ctx.moveTo(-size*.3,size*.3);ctx.lineTo(-size*.06,-size*.04);ctx.lineTo(size*.12,size*.14);ctx.lineTo(size*.25,-size*.02);ctx.lineTo(size*.35,size*.3);ctx.stroke();dot(-size*.18,-size*.32,.9,good?'#ff8269':'#a3aaa3');}
 else {for(let i=0;i<4;i++){const bh=size*(i%2?.5:.25);ctx.fillRect(-size*.3+i*size*.18,-bh*.5,1,bh);}}
 ctx.restore();
}
function phaseText(t){
 const phase=t<2.4?0:t<3.8?1:t<5.2?2:t<6.2?3:t<8.4?4:t<10.3?5:t<12.1?6:t<15?7:8;if(lastPhase===phase)return;lastPhase=phase;
 const text=[
 'Chunks leave the uncurated corpus and enter the model.',
 'The uncurated corpus dims the blood-red network. Its connections remain visible.',
 'The dimmed neural figure falls onto the ground.',
 'The figure is lying on the ground, visibly dimmed, with a RIP sign above it.',
 'A mesh represents selection and curation for the training context; curated chunks emerge from the corpus.',
 'Filtered chunks reach the fallen network and light its connections again. The RIP sign fades.',
 'The illuminated neural figure rises back onto its shared neural-layer foundation.',
 'The recovered neural figure stands and moves its output blocks into a supported, relaxed pose.',
 'The healthy neural model rests one foot on the audio block, its elbow on the message block, and its tilted head beside the image block with its palm supporting its face. The automatic cycle repeats.'
 ][phase];document.getElementById('flow-description').textContent=text;
}
function outputIcon(x,y,size,type,alpha){
 ctx.save();ctx.translate(x,y);ctx.globalAlpha=alpha;ctx.strokeStyle='#f48e76';ctx.fillStyle='#f48e76';ctx.lineWidth=.8;
 if(type===0){ctx.strokeRect(-size/2,-size/2,size,size*.8);ctx.beginPath();ctx.moveTo(-size*.36,size*.12);ctx.lineTo(-size*.08,-size*.18);ctx.lineTo(size*.1,.02*size);ctx.lineTo(size*.25,-size*.13);ctx.lineTo(size*.4,size*.2);ctx.stroke();dot(-size*.25,-size*.3,1,'#f48e76');}
 else if(type===1){ctx.beginPath();ctx.moveTo(-size*.5,-size*.4);ctx.lineTo(size*.5,-size*.4);ctx.lineTo(size*.5,size*.25);ctx.lineTo(-size*.12,size*.25);ctx.lineTo(-size*.37,size*.5);ctx.lineTo(-size*.32,size*.25);ctx.lineTo(-size*.5,size*.25);ctx.closePath();ctx.stroke();for(let i=0;i<3;i++)dot((i-1)*size*.23,-size*.07,.9,'#f48e76');}
 else{for(let i=0;i<5;i++){const height=size*[.3,.65,1,.65,.3][i];ctx.beginPath();ctx.moveTo((i-2)*size*.2,-height/2);ctx.lineTo((i-2)*size*.2,height/2);ctx.stroke();}}
 ctx.restore();
}
function draw(){
 if(!w||!h)return;const t=time%24,mobile=w<650;
 ctx.clearRect(0,0,w,h);
 const scale=Math.min(h*.94,w*(mobile?1.15:1.5)),cx=w*(mobile?.63:.70),top=11,pivotY=top+.93*scale,groundY=top+.94*scale+9;
 const fall=smooth((t-3.8)/1.3)*(1-smooth((t-10.3)/1.8)),angle=-Math.PI*.5*fall,shrink=1-fall*(mobile?.56:0),vertical=1-.62*fall;
 const yaw=Math.sin(time*.12)*.10;
 const release=1-smooth((t-22.5)/1.5),settle=smooth((t-12.2)/2.6)*release;
 const legSettle=smooth((t-12.2)/1.8)*release,armSettle=smooth((t-12.7)/1.9)*release,headSettle=smooth((t-13)/1.8)*release;
 function morph(p){let x=p.x,y=p.y,f=settle;
  if(p.layer>=30&&p.layer<=36){
   const path=[[.19,.325],[.25,.375],[.30,.43],[.27,.37],[.24,.30],[.20,.235],[.16,.185]],i=p.layer-30;
   x=path[i][0]+(p.x-(.155+i*.009))*.8;y=path[i][1]+(p.y-(.325+i*.035))*.65;f=armSettle;
  }else if(p.layer>=20&&p.layer<=26){
   const path=[[-.115,.325],[-.13,.37],[-.145,.415],[-.15,.46],[-.14,.50],[-.12,.53],[-.10,.55]],i=p.layer-20;
   x=path[i][0]+(p.x+(.155+i*.009))*.85;y=path[i][1]+(p.y-(.325+i*.035))*.8;
  }else if(p.layer>=65&&p.layer<=75){
   const path=[[.045,.62],[.08,.63],[.12,.644],[.16,.657],[.20,.67],[.205,.70],[.21,.73],[.22,.76],[.235,.795],[.262,.795],[.291,.795]],i=p.layer-65;
   x=path[i][0]+(p.x-(.045+i*.003))*.7;y=path[i][1]+(p.y-(.62+i*.031))*.7;f=legSettle;
  }else if(p.layer!==undefined&&p.layer<=2){
   const angle=.24,dx=p.x,dy=p.y-.11;x=.12+dx*Math.cos(angle)-dy*Math.sin(angle);y=.14+dx*Math.sin(angle)+dy*Math.cos(angle);f=headSettle;
  }else if(p.layer===3){x=p.x+.075;y=p.y+.012;f=headSettle;
  }else{x=p.x+Math.max(0,.62-p.y)*.13;}
  return{...p,x:p.x+(x-p.x)*f,y:p.y+(y-p.y)*f};
 }
 function projectRaw(p){const dx=(p.x*Math.cos(yaw)+(p.z||0)*Math.sin(yaw))*scale*(mobile?.88:1),dy=top+p.y*scale-pivotY;
  return{x:cx+(dx*Math.cos(angle)-dy*Math.sin(angle))*shrink,y:pivotY+(dx*Math.sin(angle)+dy*Math.cos(angle))*vertical-scale*.042*fall};}
 function project(p){return projectRaw(morph(p));}
 const points=nodes.map(p=>({...project(p),brightness:light(t,p)}));
 const overall=points.reduce((sum,p)=>sum+p.brightness,0)/points.length,energy=(overall-.34)/.66,target=points[entry];
 const cy=top+.42*scale,poolX=w*.13,poolRX=Math.min(mobile?25:69,w*.11),poolRY=mobile?30:43;
 const filter=smooth((t-6.2)/.6),filterPoint={x:w*(mobile?.39:.425),y:cy},start={x:poolX+poolRX*.82,y:cy},filterT=.44;
 function streamAt(f){if(f<=filterT){const u=f/filterT;return{x:start.x+(filterPoint.x-start.x)*u,y:cy+Math.sin(u*Math.PI)*2};}const u=(f-filterT)/(1-filterT);return bezier(filterPoint,{x:filterPoint.x+w*.06,y:cy},{x:target.x-w*.075,y:target.y},target,u);}
 // Ground and shared neural layers identify an architecture rather than anatomy.
 ctx.strokeStyle='rgba(176,166,141,.25)';ctx.lineWidth=.65;ctx.beginPath();ctx.moveTo(Math.max(w*.30,cx-scale*.95*(mobile?.46:1)),groundY);ctx.lineTo(Math.min(w-5,cx+scale*.29),groundY);ctx.stroke();
 const plateW=mobile?56:108;
 for(let layer=2;layer>=0;layer--){const yy=groundY+2+layer*4;const grid=[];
  for(let row=0;row<3;row++)for(let col=0;col<4;col++)grid.push({x:cx+(col/3-.5)*plateW+(row-1)*plateW*.16,y:yy+(row-1)*2.8});
  ctx.strokeStyle=`rgba(235,112,78,${.16+energy*.2})`;ctx.lineWidth=.55;
  grid.forEach((p,i)=>{[i%4<3?i+1:-1,i<8?i+4:-1].forEach(j=>{if(j>=0){ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(grid[j].x,grid[j].y);ctx.stroke();}});dot(p.x,p.y,.75,`rgba(235,112,78,${.3+energy*.4})`);});
 }
 if(fall<.1){ctx.strokeStyle='rgba(235,132,97,.35)';ctx.lineWidth=.6;[-1,1].forEach(side=>{ctx.beginPath();ctx.moveTo(cx+side*scale*.066,pivotY-2);ctx.lineTo(cx+side*plateW*.3,groundY+1);ctx.stroke();});}
 // A visible pool of mixed records feeds both the unfiltered and filtered phases.
 ctx.beginPath();ctx.ellipse(poolX,cy+6,poolRX+9,poolRY+8,0,0,Math.PI*2);ctx.fillStyle='rgba(170,190,175,.025)';ctx.fill();ctx.strokeStyle='rgba(167,182,168,.33)';ctx.lineWidth=.75;ctx.stroke();
 for(let i=0;i<(mobile?13:24);i++){const a=random(i*3+1)*Math.PI*2,r=Math.sqrt(random(i*7+5));chunk(poolX+Math.cos(a)*r*poolRX*.8,cy+Math.sin(a)*r*poolRY*.75,mobile?8:11,false,400+i,.65+.3*random(i+6));}
 ctx.strokeStyle='rgba(175,155,138,.38)';ctx.lineWidth=.85;ctx.beginPath();for(let f=0;f<=1.001;f+=.025){const p=streamAt(f);if(f===0)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);}ctx.stroke();
 // Repeated attention planes and residual paths form the model's torso.
 // These are computational layers, all transformed with the falling neural figure.
 coreBlocks.forEach((block,index)=>{
  const level=light(t,{delay:.25+index*.14}),en=(level-.34)/.66;
  const x=block.width/2,yy=block.y-.009,depth=.019;
  const outline=[{x:-x,y:yy},{x:x,y:yy},{x:x+depth,y:yy-depth*.6},{x:-x+depth,y:yy-depth*.6}].map(project);
  ctx.beginPath();outline.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fillStyle=`rgba(251,93,66,${.025+en*.035})`;ctx.fill();ctx.strokeStyle=`rgba(233,117,88,${.30+en*.25})`;ctx.lineWidth=.65;ctx.stroke();
  // A small matrix of attention weights sits in each repeated layer.
  for(let row=0;row<3;row++)for(let col=0;col<8;col++){
   const cell=project({x:(col/7-.5)*block.width*.84,y:yy-.011+row*.007});
   const bright=random(index*41+row*9+col)>.5;
   dot(cell.x,cell.y,mobile?.8:1.1,`rgba(255,128,92,${.24+en*(bright?.65:.22)})`,bright&&en>.8?2:0);
  }
  if(index<coreBlocks.length-1){[-1,1].forEach(side=>{const a=project({x:side*(x+.008),y:block.y+.015}),b=project({x:side*(x+.033),y:block.y+.015}),c=project({x:side*(x+.033),y:block.y+.09}),d=project({x:side*coreBlocks[index+1].width*.42,y:block.y+.09});
    ctx.strokeStyle=`rgba(234,110,77,${.28+en*.4})`;ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.lineTo(c.x,c.y);ctx.lineTo(d.x,d.y);ctx.stroke();
   });}
 });
 // One long residual connection unifies the repeated blocks into a shared backbone.
 const residual=[{x:-.012,y:.57},{x:.025,y:.55},{x:.025,y:.22},{x:0,y:.20}].map(project);
 ctx.beginPath();residual.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.strokeStyle=`rgba(246,118,84,${.3+energy*.4})`;ctx.lineWidth=1.3;ctx.stroke();
 // Even the killed model retains a visible network; only its energy is lost.
 links.forEach(e=>{const a=points[e.a],b=points[e.b],en=((a.brightness+b.brightness)/2-.34)/.66;
  ctx.strokeStyle=`rgba(${Math.round(151+84*en)},${Math.round(123-39*en)},${Math.round(115-48*en)},${.48+.30*en})`;ctx.lineWidth=.65+.18*en;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.quadraticCurveTo((a.x+b.x)/2+(e.seed-.5)*3,(a.y+b.y)/2,b.x,b.y);ctx.stroke();});
 points.forEach((p,i)=>{const en=(p.brightness-.34)/.66;dot(p.x,p.y,(mobile?.85:1.05)+en*.45,`rgba(${Math.round(157+98*en)},${Math.round(129+15*en)},${Math.round(120-4*en)},${.72+.26*en})`,en>.7&&i%9===0?6*en:0);});
 links.forEach((e,i)=>{if(i%15!==0)return;const a=points[e.a],b=points[e.b],q=(a.brightness+b.brightness)/2;if(q<.65)return;const f=(time*.42+e.seed)%1;dot(a.x+(b.x-a.x)*f,a.y+(b.y-a.y)*f,mobile?1:1.5,'rgba(255,161,112,.96)',5);});
 // The same output heads become physical supports as the recovered model relaxes.
 const headAlpha=(1-fall)*(.30+.70*energy),box=mobile?26:43;
 const outputPositions=[.085,.31,.54].map((yy,i)=>{
  const original={x:mobile?w*.94:cx+scale*.44,y:top+scale*yy};
  const final=[{x:.25,y:.15},{x:.35,y:.49},{x:.29,y:.86}][i],f=i===2?legSettle:i===1?armSettle:headSettle;
  return{x:original.x+(cx+scale*final.x*(mobile?.88:1)-original.x)*f,y:original.y+(top+scale*final.y-original.y)*f};
 });
 if(headAlpha>.02){const a=project({x:.034,y:.20}),busX=mobile?w*.86:cx+scale*(.245+.11*settle),busY=top+scale*(.20+.035*settle);
  ctx.strokeStyle=`rgba(237,126,94,${headAlpha*.65*(1-settle*.5)})`;ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.bezierCurveTo(a.x+20,a.y,busX-18,busY,busX,busY);ctx.stroke();dot(busX,busY,mobile?2:3,`rgba(255,131,89,${headAlpha*(1-settle*.6)})`,energy*5);
  outputPositions.forEach(({x,y},i)=>{const size=mobile?15:24;
   ctx.strokeStyle=`rgba(237,126,94,${headAlpha*.58*(1-settle*.6)})`;ctx.lineWidth=.85;ctx.beginPath();ctx.moveTo(busX,busY);ctx.bezierCurveTo(busX+12,busY,busX+10,y,x-box*.6,y);ctx.stroke();
   if(energy>.5){const f=(time*.6+i*.3)%1,p=bezier({x:busX,y:busY},{x:busX+12,y:busY},{x:busX+10,y},{x:x-box*.6,y},f);dot(p.x,p.y,mobile?1.1:1.6,`rgba(255,174,115,${headAlpha*(1-settle*.5)})`,4);}
   ctx.save();ctx.globalAlpha=headAlpha;ctx.shadowColor='#f37a59';ctx.shadowBlur=settle*6;rect(x-box/2,y-box/2,box,box,mobile?4:7);ctx.fillStyle='#242d2e';ctx.fill();ctx.strokeStyle=settle>.5?'#da9175':'#a36655';ctx.lineWidth=.8;ctx.stroke();ctx.restore();outputIcon(x,y,size,i,headAlpha);
  });}
 // A small fan of connected neurons turns the wrist into an open palm beside the face.
 if(armSettle>.05){const hand=[{x:.16,y:.197},{x:.164,y:.182},{x:.151,y:.169},{x:.143,y:.158},{x:.157,y:.155},{x:.17,y:.159},{x:.18,y:.171}].map(projectRaw);
  ctx.strokeStyle=`rgba(250,139,103,${armSettle*.9})`;ctx.lineWidth=.9;[[0,1],[1,2],[2,3],[2,4],[1,4],[1,5],[1,6],[4,5],[5,6]].forEach(([i,j])=>{ctx.beginPath();ctx.moveTo(hand[i].x,hand[i].y);ctx.lineTo(hand[j].x,hand[j].y);ctx.stroke();});hand.forEach(p=>dot(p.x,p.y,mobile?1:1.4,`rgba(255,162,117,${armSettle})`,3));
 }
 if(settle>.2){
  // Physical contact points stay connected to the common neural computation.
  [{p:{x:.181,y:.145},block:0,f:headSettle,side:'left'},{p:{x:.30,y:.43},block:1,f:armSettle,side:'top'},{p:{x:.282,y:.795},block:2,f:legSettle,side:'top'}].forEach(({p,block,f,side})=>{
   const a=projectRaw(p),b=outputPositions[block],end=side==='left'?{x:b.x-box/2,y:b.y}:{x:a.x,y:b.y-box/2};
   ctx.strokeStyle=`rgba(255,151,106,${f*.65})`;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(end.x,end.y);ctx.stroke();dot(end.x,end.y,mobile?1.5:2,`rgba(255,174,119,${f*.9})`,f*7);
  });
 }
 // The filter is fixed in the stream while the figure falls and gets back up.
 if(filter>.01){const x=filterPoint.x,y=filterPoint.y,hh=mobile?27:39,wide=mobile?12:20,out=mobile?13:22;
  ctx.save();ctx.globalAlpha=filter;ctx.translate(x,y);ctx.beginPath();ctx.moveTo(-wide,-hh);ctx.lineTo(out,-8);ctx.lineTo(out+8,-8);ctx.lineTo(out+8,8);ctx.lineTo(out,8);ctx.lineTo(-wide,hh);ctx.closePath();ctx.fillStyle='#2e3331';ctx.fill();ctx.strokeStyle='#b3927e';ctx.lineWidth=1;ctx.stroke();ctx.beginPath();ctx.ellipse(-wide,0,mobile?6:9,hh,0,0,Math.PI*2);ctx.fillStyle='#181d20';ctx.fill();ctx.stroke();
  ctx.save();ctx.beginPath();ctx.ellipse(-wide,0,mobile?6:9,hh,0,0,Math.PI*2);ctx.clip();ctx.strokeStyle='rgba(192,154,128,.68)';ctx.lineWidth=.6;
  for(let yy=-hh;yy<=hh;yy+=6){ctx.beginPath();ctx.moveTo(-wide-10,yy);ctx.lineTo(-wide+10,yy);ctx.stroke();}for(let xx=-wide-9;xx<=-wide+9;xx+=4){ctx.beginPath();ctx.moveTo(xx,-hh);ctx.lineTo(xx,hh);ctx.stroke();}ctx.restore();ctx.restore();}
 const spacing=.4,travel=2.4,latest=Math.floor(time/spacing),passAge=travel*filterT;
 for(let k=Math.max(0,latest-6);k<=latest;k++){const born=k*spacing,age=time-born;if(age<0||age>travel)continue;const f=age/travel,pos=streamAt(f),passPhase=(born+passAge)%24,filtered=passPhase>=6.8&&age>=passAge,size=mobile?8:13,gap=mobile?2:4;
  for(let tile=0;tile<3;tile++)chunk(pos.x+(tile-1)*(size+gap),pos.y+(filtered?0:Math.sin(k*3+tile)*3),size,filtered,k*5+tile);
  if(filtered&&age-passAge<.5){const drop=(age-passAge)/.5;for(let j=0;j<3;j++)dot(filterPoint.x+(j-1)*6,filterPoint.y+13+drop*(mobile?30:45),1.1,`rgba(168,165,144,${(1-drop)*.6})`);}}
 // The RIP marker appears only after the graph has landed, above its fallen form.
 const rip=smooth((t-5.2)/.4)*(1-smooth((t-8.8)/1));
 if(rip>.01){ctx.save();ctx.globalAlpha=rip;const x=cx-scale*.43*(mobile?.44:1),ww=mobile?27:35,hh=mobile?33:42,y=groundY-(mobile?55:62)-hh;
  ctx.beginPath();ctx.moveTo(x-ww/2,y+hh);ctx.lineTo(x-ww/2,y+ww/2);ctx.arc(x,y+ww/2,ww/2,Math.PI,0);ctx.lineTo(x+ww/2,y+hh);ctx.closePath();ctx.fillStyle='#303633';ctx.fill();ctx.strokeStyle='#b9a08c';ctx.lineWidth=.9;ctx.stroke();ctx.font=`500 ${mobile?9:11}px "DM Mono",monospace`;ctx.fillStyle='#d9b49a';ctx.textAlign='center';ctx.fillText('RIP',x,y+hh*.72);ctx.restore();}
 document.querySelector('.uncurated-label').style.left=(Math.max(poolX,mobile?51:poolX)/w*100)+'%';document.querySelector('.uncurated-label').style.top=(cy+poolRY+25)+'px';
 const goodLabel=document.querySelector('.curated-label');goodLabel.style.left=((filterPoint.x+cx-scale*.12)*.5/w*100)+'%';goodLabel.style.top=(mobile?cy-49:cy+32)+'px';goodLabel.style.opacity=String(smooth((t-7.05)/.35));goodLabel.setAttribute('aria-hidden',t<7.05?'true':'false');phaseText(t);
}
function resize(){const r=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);w=r.width;h=r.height;canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);draw();}
function label(){button.querySelector('span').textContent=paused?'▷':'Ⅱ';button.setAttribute('aria-label',paused?'Play animation':'Pause animation');button.setAttribute('aria-pressed',String(paused));}
button.addEventListener('click',()=>{paused=!paused;label();draw();});reduced.addEventListener('change',()=>{paused=reduced.matches;if(paused)time=16;label();draw();});document.addEventListener('visibilitychange',()=>{last=0;});
new ResizeObserver(resize).observe(canvas);new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;last=0;},{rootMargin:'100px'}).observe(root);
document.querySelectorAll('.mobile-menu a').forEach(a=>a.addEventListener('click',()=>{document.querySelector('.mobile-menu').open=false;}));
function frame(now){const dt=last?(now-last)/1000:0;last=now;if(!paused&&visible&&!document.hidden){time+=dt;draw();}requestAnimationFrame(frame);}label();resize();requestAnimationFrame(frame);
})();
