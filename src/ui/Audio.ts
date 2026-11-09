import type {EventKind,Settings} from '../game/config/types';
export class AudioSystem {
 private context:AudioContext|null=null;private music:HTMLAudioElement|null=null;private unlocked=false;private musicPlaying=false;
 constructor(private settings:()=>Settings){}
 unlock():void {this.unlocked=true;this.musicUpdate(this.musicPlaying);try{this.context??=new AudioContext();void this.context.resume();}catch{/* Browser without Web Audio: gameplay remains available. */}}
 play(kind:EventKind|'click'):void {
  const s=this.settings(),c=this.context;if(!c||s.muted||s.sound===0)return;
  const pitch:Record<string,number>={click:440,plant:620,water:380,product:740,collect:880,factory:270,dispatch:220,return:660,bear:120,capture:330,complete:1047,buy:520,error:150};
  const o=c.createOscillator(),g=c.createGain();o.type=kind==='bear'?'triangle':'sine';o.frequency.setValueAtTime(pitch[kind],c.currentTime);o.frequency.exponentialRampToValueAtTime(pitch[kind]*(kind==='error'?0.65:1.4),c.currentTime+0.13);g.gain.setValueAtTime(s.sound*0.09,c.currentTime);g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+0.22);o.connect(g).connect(c.destination);o.start();o.stop(c.currentTime+0.23);
 }
 musicUpdate(playing:boolean):void {
  this.musicPlaying=playing;
  const settings=this.settings();
  if(!this.unlocked)return;
  const audible=playing&&!document.hidden&&!settings.muted&&settings.music>0;
  if(!this.music&&!audible)return;
  if(!this.music){
   this.music=document.createElement('audio');
   this.music.src=`${import.meta.env.BASE_URL}audio/breakfast-in-the-orchard.mp3`;
   this.music.loop=true;this.music.preload='metadata';this.music.hidden=true;
   this.music.dataset.farmMusic='true';document.body.append(this.music);
  }
  this.music.volume=Math.max(0,Math.min(1,settings.music));
  if(audible){if(this.music.paused)void this.music.play().catch(()=>{/* Retry on the next user interaction if playback was blocked. */});}
  else this.music.pause();
 }
}
