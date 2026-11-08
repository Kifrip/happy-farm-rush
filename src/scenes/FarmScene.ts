import Phaser from 'phaser';
import type {GameSimulation} from '../game/engine/GameSimulation';
import {GameClock} from '../game/engine/GameClock';
import {ECONOMY as E} from '../game/config/economy';
import {ANIMALS} from '../game/config/animals';
import {BUILDINGS} from '../game/config/buildings';
import type {GameEvent} from '../game/config/types';
export interface FarmBridge {simulation:()=>GameSimulation|null;paused:()=>boolean;tick:()=>void;events:(events:GameEvent[])=>void;market:()=>void;well:()=>void;action:()=>void;reduced:()=>boolean;effects:()=>boolean}
export class FarmScene extends Phaser.Scene {
 private bridge:FarmBridge;private clock=new GameClock();private entities=new Map<string,Phaser.GameObjects.Image>();private labels=new Map<string,Phaser.GameObjects.Text>();private bars!:Phaser.GameObjects.Graphics;private truck!:Phaser.GameObjects.Image;private well!:Phaser.GameObjects.Image;private clouds:Phaser.GameObjects.Image[]=[];private model:GameSimulation|null=null;private ready=false;
 constructor(bridge:FarmBridge){super('Farm');this.bridge=bridge;}
 create():void {
  this.add.image(500,325,'farm').setDepth(-1000);
  for(let i=0;i<3;i++)this.clouds.push(this.add.image(130+i*370,42+i%2*20,'cloud').setScale(.7+i*.13).setDepth(-900).setAlpha(.65));
  this.well=this.add.image(500,85,'well').setScale(.82).setDepth(83).setInteractive({useHandCursor:true}).on('pointerdown',()=>{this.bridge.action();this.bridge.well();});
  this.add.image(499,582,'warehouse').setScale(.85).setDepth(582).setInteractive({useHandCursor:true}).on('pointerdown',()=>{this.bridge.action();this.bridge.market();});
  this.truck=this.add.image(726,583,'truck').setDepth(585).setScale(.88).setInteractive({useHandCursor:true}).on('pointerdown',()=>{this.bridge.action();this.bridge.market();});
  this.add.text(500,136,'THE WELL',{fontFamily:'Georgia',fontSize:'11px',fontStyle:'bold',color:'#586447',letterSpacing:2}).setOrigin(.5).setDepth(100);
  this.add.text(498,642,'WAREHOUSE & MARKET',{fontFamily:'Georgia',fontSize:'10px',fontStyle:'bold',color:'#586447',letterSpacing:1.5}).setOrigin(.5).setDepth(700);
  this.bars=this.add.graphics().setDepth(1000);
  this.input.on('pointerdown',(pointer:Phaser.Input.Pointer,objects:Phaser.GameObjects.GameObject[])=>{if(objects.length||this.bridge.paused())return;this.bridge.action();this.bridge.simulation()?.plant(pointer.x,pointer.y);});
  this.ready=true;this.game.canvas.dataset.ready='true';
 }
 private image(key:string,texture:string,x:number,y:number):Phaser.GameObjects.Image {
  let image=this.entities.get(key);if(!image){image=this.add.image(x,y,texture);this.entities.set(key,image);}else{image.setTexture(texture);image.setPosition(x,y);}return image;
 }
 private label(key:string,text:string,x:number,y:number,color='#3c543e',size=12):void {
  let label=this.labels.get(key);if(!label){label=this.add.text(x,y,text,{fontFamily:'Verdana, sans-serif',fontSize:`${size}px`,fontStyle:'bold',color,backgroundColor:'#fff5d6',padding:{x:7,y:4}}).setOrigin(.5).setDepth(2000);this.labels.set(key,label);}label.setText(text).setPosition(x,y).setVisible(true);
 }
 feedback(e:GameEvent):void {
  if(!this.ready||e.x===undefined||e.y===undefined||!this.bridge.effects())return;
  if(e.kind==='plant'&&!this.bridge.reduced()){for(let i=0;i<4;i++){const dust=this.add.circle(e.x+(i-1.5)*6,e.y+6,2+i%2,0xd8c28a,.75).setDepth(e.y+2);this.tweens.add({targets:dust,x:dust.x+(i-1.5)*10,y:e.y-8-i*3,alpha:0,scale:.3,duration:650,onComplete:()=>dust.destroy()});}}
  if(e.kind==='collect'&&e.asset&&!this.bridge.reduced()){
   const p=this.add.image(e.x,e.y,`product-${e.asset}`).setDepth(3000);this.tweens.add({targets:p,x:500,y:565,scale:.3,alpha:0,duration:520,ease:'Cubic.In',onComplete:()=>p.destroy()});
  }
  const label=this.add.text(e.x,e.y-35,e.kind==='collect'?e.text:e.kind==='plant'?'+ grass':e.kind==='product'?'Ready!':e.text,{fontFamily:'Verdana',fontSize:'12px',fontStyle:'bold',color:e.kind==='error'?'#b34839':'#3e6247',backgroundColor:'#fff9e4',padding:{x:7,y:5}}).setOrigin(.5).setDepth(3001);
  this.tweens.add({targets:label,y:e.y-65,alpha:0,duration:this.bridge.reduced()?500:1300,ease:'Sine.Out',onComplete:()=>label.destroy()});
 }
 update(_now:number,delta:number):void {
  if(!this.ready)return;const sim=this.bridge.simulation();if(!sim)return;
  if(this.model!==sim){this.model=sim;this.clock.reset();for(const v of this.entities.values())v.destroy();this.entities.clear();for(const v of this.labels.values())v.destroy();this.labels.clear();}
  this.clock.advance(delta/1000,()=>sim.step(),this.bridge.paused());
  if(sim.events.length)this.bridge.events(sim.events.splice(0));this.bridge.tick();
  const s=sim.s,t=s.time,motion=!this.bridge.reduced();
  if(!this.bridge.paused()&&motion)for(let i=0;i<this.clouds.length;i++)this.clouds[i].x=(130+i*370+t*(1+i*.4))%1180-90;
  this.well.setAngle(motion&&s.refill>0?Math.sin(t*9)*2:0);
  this.bars.clear();const alive=new Set<string>();const visibleLabels=new Set<string>();
  const bar=(x:number,y:number,w:number,p:number,color:number)=>{this.bars.fillStyle(0x5c6c4d,.25).fillRoundedRect(x-w/2,y,w,5,2);this.bars.fillStyle(color).fillRoundedRect(x-w/2,y,w*Math.max(0,Math.min(1,p)),5,2);};
  for(const g of s.grass){const key=`g${g.id}`;alive.add(key);const sprite=this.image(key,'grass',g.x,g.y);sprite.setScale(Math.min(1,g.age*4)*(.6+g.food/E.grassFood*.4)).setDepth(g.y-40).setAlpha(.9);}
  for(const a of s.animals){const key=`a${a.id}`;alive.add(key);const moving=['wandering','seeking','fleeing'].includes(a.state);const f=motion&&moving?Math.floor(t*(a.state==='fleeing'?10:6)+a.id)%4:0;const sprite=this.image(key,`${a.species}-${f}`,a.x,a.y-16);const eating=a.state==='eating';sprite.setScale(a.species==='cow'?.85:a.species==='goose'?.69:.72).setFlipX(a.target.x<a.x).setDepth(a.y).setRotation(motion&&eating?Math.sin(t*8)*.1:0).setTint(a.hunger>E.hungerWarning?0xffe0b7:0xffffff);
   if(a.hunger>E.hungerWarning){const k=`h${a.id}`;visibleLabels.add(k);this.label(k,'! HUNGRY',a.x,a.y-62,'#a94b36',9);}if(a.species==='dog'&&a.bark>7.5){const k=`d${a.id}`;visibleLabels.add(k);this.label(k,'WOOF!',a.x,a.y-63,'#567f7a',10);}if(ANIMALS[a.species].product)bar(a.x,a.y+19,32,1-a.cooldown/ANIMALS[a.species].interval,0xe9c165);
  }
  for(const p of s.drops){const key=`p${p.id}`;alive.add(key);const scale=p.age<.4&&motion?.75+Math.sin(p.age/.4*Math.PI)*.3:1;const sprite=this.image(key,`product-${p.kind}`,p.x,p.y);sprite.setScale(scale).setDepth(p.y+30).setAlpha(p.age>E.expiration-E.expirationWarning?.5+Math.sin(t*7)*.3:1);if(!sprite.input)sprite.setInteractive({useHandCursor:true,hitArea:new Phaser.Geom.Circle(23,23,this.game.device.input.touch?62:25),hitAreaCallback:Phaser.Geom.Circle.Contains}).on('pointerdown',()=>{this.bridge.action();if(!this.bridge.paused())sim.collect(p.id);});}
  for(const b of s.bears){const key=`b${b.id}`;alive.add(key);const sprite=this.image(key,`bear-${motion&&!b.caged&&b.warning<=0?Math.floor(t*5)%4:0}`,b.x,b.y-16);sprite.setScale(.92).setDepth(b.y).setTint(b.warning>0?0xefbb86:0xffffff);if(!sprite.input)sprite.setInteractive({useHandCursor:true}).on('pointerdown',()=>{this.bridge.action();if(!this.bridge.paused())sim.capture(b.id);});
   const k=`bt${b.id}`;visibleLabels.add(k);this.label(k,b.caged?`COLLECT · ${Math.ceil(b.cageTime)}s`:b.warning>0?`! BEAR · ${Math.ceil(b.warning)}s`:b.stun>0?'TAP TO CAPTURE!':'! TAP THE BEAR',b.x,b.y-67,'#a84d3c',10);
   if(b.caged){const ck=`c${b.id}`;alive.add(ck);this.image(ck,'cage',b.x,b.y-20).setScale(.95).setDepth(b.y+1);}
  }
  for(const m of s.machines){const b=BUILDINGS[m.kind],key=`m${m.kind}`;alive.add(key);const sprite=this.image(key,`building-${m.kind}-${m.level}`,b.x,b.y-25);sprite.setDepth(b.y).setScale(.94).setAngle(motion&&m.remaining>0?Math.sin(t*7)*.7:0);if(!sprite.input)sprite.setInteractive({useHandCursor:true}).on('pointerdown',()=>{this.bridge.action();if(!this.bridge.paused())sim.process(m.kind);});
   const k=`ml${m.kind}`;visibleLabels.add(k);this.label(k,m.remaining>0?`${Math.ceil(m.remaining)}s · ${m.batch} crafting`:b.short,b.x,b.y+45,'#4b5f49',10);
   if(m.remaining>0){const gx=b.x-47,gy=b.y+4;this.bars.fillStyle(0x728c7c).beginPath();for(let n=0;n<32;n++){const angle=(motion?t*2:0)+n*Math.PI/16,r=n%4<2?11:8;const x=gx+Math.cos(angle)*r,y=gy+Math.sin(angle)*r;if(n===0)this.bars.moveTo(x,y);else this.bars.lineTo(x,y);}this.bars.closePath().fillPath();this.bars.fillStyle(0xe8dab1).fillCircle(gx,gy,3);bar(b.x,b.y+65,85,1-m.remaining/m.duration,0xdea84d);if(motion&&this.bridge.effects()){const smokeKey=`sm${m.kind}`;visibleLabels.add(smokeKey);this.label(smokeKey,'· ·',b.x+30+Math.sin(t)*5,b.y-95-(t*9%20),'#a7aaa0',15);}}
  }
  for(const [key,obj] of this.entities)if(!alive.has(key)){obj.destroy();this.entities.delete(key);}
  for(const [key,label] of this.labels)if(!visibleLabels.has(key))label.setVisible(false);
  bar(500,151,90,s.water/sim.waterCapacity(),0x75a9a8);
  if(s.truck.remaining>0){const progress=1-s.truck.remaining/s.truck.duration;const x=progress<.2?726+progress*1700:progress>.8?1066-(progress-.8)*1700:1100;this.truck.setX(x).setFlipX(progress>.8);this.label('truck',`MARKET · ${Math.ceil(s.truck.remaining)}s`,720,622,'#546f62',10);}else{this.truck.setX(726).setFlipX(false);this.labels.get('truck')?.setVisible(false);}
 }
}
