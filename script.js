(() => {
"use strict";

const $ = id => document.getElementById(id);
const stage1=$("stage1"),stage2=$("stage2"),stage3=$("stage3");
const transition=$("transition"),continueBtn=$("continueBtn");
const musicClick=$("musicClick"),wishBtn=$("wishBtn"),finalMessage=$("finalMessage");
let currentStage=1;

function goToStage(nextStage){
  if(nextStage===currentStage)return;
  transition.classList.add("on");
  setTimeout(()=>{
    stage1.classList.toggle("stage-active",nextStage===1);
    stage2.classList.toggle("stage-active",nextStage===2);
    stage3.classList.toggle("stage-active",nextStage===3);
    currentStage=nextStage;
    if(nextStage===2)resizeMusicCanvas();
    transition.classList.remove("on");
  },450);
}
continueBtn.addEventListener("click",()=>goToStage(2));

/* FIREWORKS + BALLOONS */
const fireCanvas=$("fireworksCanvas"),fctx=fireCanvas.getContext("2d");
let fw=0,fh=0,fhw=0,fhh=0,letters=[];
const fopts={
strings:["HAPPY","BIRTHDAY!","ABIDA"],charSize:30,charSpacing:35,lineHeight:40,
fireworkPrevPoints:10,fireworkBaseLineWidth:5,fireworkAddedLineWidth:8,
fireworkSpawnTime:200,fireworkBaseReachTime:30,fireworkAddedReachTime:30,
fireworkCircleBaseSize:20,fireworkCircleAddedSize:10,fireworkCircleBaseTime:30,
fireworkCircleAddedTime:30,fireworkCircleFadeBaseTime:10,fireworkCircleFadeAddedTime:5,
fireworkBaseShards:5,fireworkAddedShards:5,fireworkShardPrevPoints:3,
fireworkShardBaseVel:4,fireworkShardAddedVel:2,fireworkShardBaseSize:3,
fireworkShardAddedSize:3,gravity:.1,upFlow:-.1,letterContemplatingWaitTime:300,
balloonSpawnTime:20,balloonBaseInflateTime:10,balloonAddedInflateTime:10,
balloonBaseSize:20,balloonAddedSize:20,balloonBaseVel:.4,balloonAddedVel:.4,
balloonBaseRadian:-(Math.PI/2-.5),balloonAddedRadian:-1};
const fTau=Math.PI*2,fTauQuarter=fTau/4;

function resizeFireworks(){
 fw=fireCanvas.width=innerWidth;fh=fireCanvas.height=innerHeight;fhw=fw/2;fhh=fh/2;
 fctx.font=fopts.charSize+"px Verdana";buildLetters();
}
function buildLetters(){
 letters=[];
 const totalWidth=fopts.charSpacing*Math.max(...fopts.strings.map(s=>s.length));
 fopts.strings.forEach((str,line)=>{
  for(let j=0;j<str.length;j++){
   const x=j*fopts.charSpacing+fopts.charSpacing/2-(str.length*fopts.charSize)/2;
   const y=line*fopts.lineHeight+fopts.lineHeight/2-(fopts.strings.length*fopts.lineHeight)/2;
   letters.push(new Letter(str[j],x,y,totalWidth));
  }
 });
}
class Letter{
 constructor(char,x,y,totalWidth){
  this.char=char;this.x=x;this.y=y;this.dx=-fctx.measureText(char).width/2;this.dy=fopts.charSize/2;
  const hue=totalWidth?(x/totalWidth)*360:Math.random()*360;
  this.color=`hsl(${hue},80%,50%)`;this.lightAlphaColor=`hsla(${hue},80%,light%,alp)`;
  this.lightColor=`hsl(${hue},80%,light%)`;this.alphaColor=`hsla(${hue},80%,50%,alp)`;this.reset();
 }
 reset(){this.phase="firework";this.tick=0;this.spawned=false;this.spawningTime=(fopts.fireworkSpawnTime*Math.random())|0;
  this.reachTime=(fopts.fireworkBaseReachTime+fopts.fireworkAddedReachTime*Math.random())|0;
  this.lineWidth=fopts.fireworkBaseLineWidth+fopts.fireworkAddedLineWidth*Math.random();this.prevPoints=[[0,fhh,0]];
 }
 step(){
  if(this.phase==="firework"){
   if(!this.spawned){if(++this.tick>=this.spawningTime){this.tick=0;this.spawned=true}}
   else{
    ++this.tick;const linear=this.tick/this.reachTime,harmonic=Math.sin(linear*fTauQuarter);
    const x=linear*this.x,y=fhh+harmonic*(this.y-fhh);
    if(this.prevPoints.length>fopts.fireworkPrevPoints)this.prevPoints.shift();
    this.prevPoints.push([x,y,linear*this.lineWidth]);
    const lw=1/Math.max(1,this.prevPoints.length-1);
    for(let i=1;i<this.prevPoints.length;i++){const p=this.prevPoints[i],p2=this.prevPoints[i-1];
     fctx.strokeStyle=this.alphaColor.replace("alp",i/this.prevPoints.length);fctx.lineWidth=p[2]*lw*i;
     fctx.beginPath();fctx.moveTo(p[0],p[1]);fctx.lineTo(p2[0],p2[1]);fctx.stroke();
    }
    if(this.tick>=this.reachTime){
     this.phase="contemplate";this.circleFinalSize=fopts.fireworkCircleBaseSize+fopts.fireworkCircleAddedSize*Math.random();
     this.circleCompleteTime=(fopts.fireworkCircleBaseTime+fopts.fireworkCircleAddedTime*Math.random())|0;
     this.circleCreating=true;this.circleFading=false;this.circleFadeTime=(fopts.fireworkCircleFadeBaseTime+fopts.fireworkCircleFadeAddedTime*Math.random())|0;
     this.tick=0;this.tick2=0;this.shards=[];
     const count=(fopts.fireworkBaseShards+fopts.fireworkAddedShards*Math.random())|0,angle=fTau/Math.max(1,count),cos=Math.cos(angle),sin=Math.sin(angle);
     let sx=1,sy=0;
     for(let i=0;i<count;i++){const x1=sx;sx=sx*cos-sy*sin;sy=sy*cos+x1*sin;this.shards.push(new Shard(this.x,this.y,sx,sy,this.alphaColor))}
    }
   }
  }else if(this.phase==="contemplate"){
   ++this.tick;
   if(this.circleCreating){
    ++this.tick2;const p=this.tick2/this.circleCompleteTime,h=-Math.cos(p*Math.PI)/2+.5;
    fctx.beginPath();fctx.fillStyle=this.lightAlphaColor.replace("light",50+50*p).replace("alp",p);
    fctx.arc(this.x,this.y,h*this.circleFinalSize,0,fTau);fctx.fill();
    if(this.tick2>this.circleCompleteTime){this.tick2=0;this.circleCreating=false;this.circleFading=true}
   }else if(this.circleFading){
    fctx.fillStyle=this.lightColor.replace("light",70);fctx.fillText(this.char,this.x+this.dx,this.y+this.dy);
    ++this.tick2;const p=this.tick2/this.circleFadeTime,h=-Math.cos(p*Math.PI)/2+.5;
    fctx.beginPath();fctx.fillStyle=this.lightAlphaColor.replace("light",100).replace("alp",1-h);
    fctx.arc(this.x,this.y,this.circleFinalSize,0,fTau);fctx.fill();if(this.tick2>=this.circleFadeTime)this.circleFading=false;
   }else{fctx.fillStyle=this.lightColor.replace("light",70);fctx.fillText(this.char,this.x+this.dx,this.y+this.dy)}
   for(let i=0;i<this.shards.length;i++){this.shards[i].step();if(!this.shards[i].alive){this.shards.splice(i,1);i--}}
   if(this.tick>fopts.letterContemplatingWaitTime){
    this.phase="balloon";this.tick=0;this.spawning=true;this.spawnTime=(fopts.balloonSpawnTime*Math.random())|0;this.inflating=false;
    this.inflateTime=(fopts.balloonBaseInflateTime+fopts.balloonAddedInflateTime*Math.random())|0;
    this.size=(fopts.balloonBaseSize+fopts.balloonAddedSize*Math.random())|0;
    const rad=fopts.balloonBaseRadian+fopts.balloonAddedRadian*Math.random(),vel=fopts.balloonBaseVel+fopts.balloonAddedVel*Math.random();
    this.vx=Math.cos(rad)*vel;this.vy=Math.sin(rad)*vel;
   }
  }else if(this.phase==="balloon"){
   fctx.strokeStyle=this.lightColor.replace("light",80);
   if(this.spawning){++this.tick;fctx.fillStyle=this.lightColor.replace("light",70);fctx.fillText(this.char,this.x+this.dx,this.y+this.dy);
    if(this.tick>=this.spawnTime){this.tick=0;this.spawning=false;this.inflating=true}
   }else if(this.inflating){
    ++this.tick;const p=this.tick/this.inflateTime,x=this.cx=this.x,y=this.cy=this.y-this.size*p;
    fctx.fillStyle=this.alphaColor.replace("alp",p);fctx.beginPath();generateBalloonPath(x,y,this.size*p);fctx.fill();
    fctx.beginPath();fctx.moveTo(x,y);fctx.lineTo(x,this.y);fctx.stroke();fctx.fillStyle=this.lightColor.replace("light",70);
    fctx.fillText(this.char,this.x+this.dx,this.y+this.dy);if(this.tick>=this.inflateTime){this.tick=0;this.inflating=false}
   }else{
    this.cx+=this.vx;this.cy+=this.vy+=fopts.upFlow;fctx.fillStyle=this.color;fctx.beginPath();generateBalloonPath(this.cx,this.cy,this.size);fctx.fill();
    fctx.beginPath();fctx.moveTo(this.cx,this.cy);fctx.lineTo(this.cx,this.cy+this.size);fctx.stroke();fctx.fillStyle=this.lightColor.replace("light",70);
    fctx.fillText(this.char,this.cx+this.dx,this.cy+this.dy+this.size);
    if(this.cy+this.size<-fhh||this.cx<-fhw||this.cy>fhw)this.phase="done";
   }
  }
 }
}
class Shard{
 constructor(x,y,vx,vy,color){const vel=fopts.fireworkShardBaseVel+fopts.fireworkShardAddedVel*Math.random();this.vx=vx*vel;this.vy=vy*vel;this.x=x;this.y=y;this.prevPoints=[[x,y]];this.color=color;this.alive=true;this.size=fopts.fireworkShardBaseSize+fopts.fireworkShardAddedSize*Math.random()}
 step(){this.x+=this.vx;this.y+=this.vy+=fopts.gravity;if(this.prevPoints.length>fopts.fireworkShardPrevPoints)this.prevPoints.shift();this.prevPoints.push([this.x,this.y]);
  const lw=this.size/this.prevPoints.length;for(let k=0;k<this.prevPoints.length-1;k++){const p=this.prevPoints[k],p2=this.prevPoints[k+1];fctx.strokeStyle=this.color.replace("alp",k/this.prevPoints.length);fctx.lineWidth=k*lw;fctx.beginPath();fctx.moveTo(p[0],p[1]);fctx.lineTo(p2[0],p2[1]);fctx.stroke()}if(this.prevPoints[0][1]>fhh)this.alive=false}
}
function generateBalloonPath(x,y,size){fctx.moveTo(x,y);fctx.bezierCurveTo(x-size/2,y-size/2,x-size/4,y-size,x,y-size);fctx.bezierCurveTo(x+size/4,y-size,x+size/2,y-size/2,x,y)}
function fireworkAnim(){requestAnimationFrame(fireworkAnim);fctx.fillStyle="#090611";fctx.fillRect(0,0,fw,fh);fctx.save();fctx.translate(fhw, fhh * 0.40);fctx.scale(0.90, 0.90);let done = true;for(const l of letters){l.step();if(l.phase!=="done")done=false}fctx.restore();if(done)letters.forEach(l=>l.reset())}
resizeFireworks();fireworkAnim();

/* MUSIC */
const musicCanvas=$("musicCanvas"),mctx=musicCanvas.getContext("2d");let mcw=0,mch=0,audioCtx=null,playing=false,sounds=[],notes=[];
function resizeMusicCanvas(){mcw=musicCanvas.width=innerWidth;mch=musicCanvas.height=innerHeight}
resizeMusicCanvas();
const p1=$("p1"),p2=$("p2"),p3=$("p3"),p4=$("p4");
notes=[
{f:262,d:.5,t:"Hap",p:p1},{f:262,d:.5,t:"py ",p:p1},{f:294,d:1,t:"Birth",p:p1},{f:262,d:1,t:"day ",p:p1},{f:349,d:1,t:"To ",p:p1},{f:330,d:2,t:"You",p:p1},
{f:262,d:.5,t:"Hap",p:p2},{f:262,d:.5,t:"py ",p:p2},{f:294,d:1,t:"Birth",p:p2},{f:262,d:1,t:"day ",p:p2},{f:392,d:1,t:"To ",p:p2},{f:349,d:2,t:"You",p:p2},
{f:262,d:.5,t:"Hap",p:p3},{f:262,d:.5,t:"py ",p:p3},{f:523,d:1,t:"Birth",p:p3},{f:440,d:1,t:"day ",p:p3},{f:349,d:1,t:"Dear ",p:p3},{f:330,d:1,t:"Zi",p:p3},{f:294,d:3,t:"san",p:p3},
{f:466,d:.5,t:"Hap",p:p4},{f:466,d:.5,t:"py ",p:p4},{f:440,d:1,t:"Birth",p:p4},{f:349,d:1,t:"day ",p:p4},{f:392,d:1,t:"To ",p:p4},{f:349,d:2,t:"You",p:p4}
];
notes.forEach(n=>{n.sp=document.createElement("span");n.sp.textContent=n.t;n.p.appendChild(n.sp)});
class Sound{
 constructor(freq,dur,index){this.frequency=freq;this.dur=dur;this.speed=dur*.5;this.index=index;this.sp=notes[index].sp}
 play(){const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type="triangle";o.frequency.value=this.frequency;g.gain.setValueAtTime(.15,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(.01,audioCtx.currentTime+this.speed);o.connect(g);g.connect(audioCtx.destination);this.sp.classList.add("jump");o.onended=()=>{this.sp.classList.remove("jump");if(this.index<sounds.length-1)sounds[this.index+1].play();else{playing=false;setTimeout(()=>goToStage(3),900)}};o.start();o.stop(audioCtx.currentTime+this.speed)}
}
function startMusic(){if(playing)return;if(!audioCtx)audioCtx=new(window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==="suspended")audioCtx.resume();sounds=notes.map((n,i)=>new Sound(n.f,n.d,i));playing=true;musicClick.style.display="none";sounds[0].play()}
musicClick.addEventListener("click",startMusic);

class Particle{
 constructor(){this.x=Math.random()*mcw;this.y=Math.random()*mch;this.r=15+Math.floor(Math.random()*20);this.l=3+Math.floor(Math.random()*2);this.a=2*Math.PI/this.l;this.rot=Math.random()*Math.PI;this.speed=.05+Math.random()/2;this.rotSpeed=.005+Math.random()*.005;this.color=["#93DFB8","#FFC8BA","#E3AAD6","#B5D8EB","#FFBDD8"][Math.floor(Math.random()*5)]}
 update(){if(this.y<-this.r){this.y=mch+this.r;this.x=Math.random()*mcw}this.y-=this.speed}
 draw(){mctx.save();mctx.translate(this.x,this.y);mctx.rotate(this.rot);mctx.beginPath();for(let i=0;i<this.l;i++)mctx.lineTo(this.r*Math.cos(this.a*i),this.r*Math.sin(this.a*i));mctx.closePath();mctx.lineWidth=4;mctx.strokeStyle=this.color;mctx.stroke();mctx.restore()}
}
const particles=Array.from({length:20},()=>new Particle());
function musicParticles(){requestAnimationFrame(musicParticles);mctx.clearRect(0,0,mcw,mch);particles.forEach(p=>{p.rot+=p.rotSpeed;p.update();p.draw()})}
musicParticles();

/* CAKE */
wishBtn.addEventListener("click",()=>{wishBtn.style.opacity="0";wishBtn.style.pointerEvents="none";finalMessage.setAttribute("aria-hidden","false");finalMessage.classList.add("show");burstConfetti()});
function burstConfetti(){
 const layer=document.createElement("div");layer.style.cssText="position:fixed;inset:0;pointer-events:none;z-index:50";document.body.appendChild(layer);
 const chars=["✦","✧","♥","•","✺"];
 for(let i=0;i<55;i++){const item=document.createElement("span");item.textContent=chars[Math.floor(Math.random()*chars.length)];item.style.position="absolute";item.style.left="50%";item.style.top="55%";item.style.fontSize=`${10+Math.random()*18}px`;item.style.opacity=".9";item.style.transform="translate(-50%,-50%)";item.style.transition=`transform ${1.1+Math.random()*.9}s cubic-bezier(.2,.8,.2,1),opacity 1.8s ease`;layer.appendChild(item);requestAnimationFrame(()=>{const a=Math.random()*Math.PI*2,d=100+Math.random()*Math.min(innerWidth,innerHeight)*.55,x=Math.cos(a)*d,y=Math.sin(a)*d+120;item.style.transform=`translate(calc(-50% + ${x}px),calc(-50% + ${y}px)) rotate(${Math.random()*720-360}deg)`;item.style.opacity="0"})}
 setTimeout(()=>layer.remove(),2400)
}
addEventListener("resize",()=>{resizeFireworks();resizeMusicCanvas()});
})();
