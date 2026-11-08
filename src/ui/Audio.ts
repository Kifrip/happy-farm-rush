import type {EventKind,Settings} from '../game/config/types';
export class AudioSystem {
 private context:AudioContext|null=null;private ambient:OscillatorNode|null=null;private ambientGain:GainNode|null=null;
 constructor(private settings:()=>Settings){}
 unlock():void {try{this.context??=new AudioContext();void this.context.resume();}catch{/* Browser without Web Audio: gameplay remains available. */}}
 play(kind:EventKind|'click'):void {
  const s=this.settings(),c=this.context;if(!c||s.muted||s.sound===0)return;
  const pitch:Record<string,number>={click:440,plant:620,water:380,product:740,collect:880,factory:270,dispatch:220,return:660,bear:120,capture:330,complete:1047,buy:520,error:150};
  const o=c.createOscillator(),g=c.createGain();o.type=kind==='bear'?'triangle':'sine';o.frequency.setValueAtTime(pitch[kind],c.currentTime);o.frequency.exponentialRampToValueAtTime(pitch[kind]*(kind==='error'?0.65:1.4),c.currentTime+0.13);g.gain.setValueAtTime(s.sound*0.09,c.currentTime);g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+0.22);o.connect(g).connect(c.destination);o.start();o.stop(c.currentTime+0.23);
 }
 ambientUpdate(playing:boolean):void {
  const c=this.context;if(!c)return;if(!this.ambient){this.ambient=c.createOscillator();this.ambient.type='sine';this.ambient.frequency.value=130.81;this.ambientGain=c.createGain();this.ambientGain.gain.value=0;this.ambient.connect(this.ambientGain).connect(c.destination);this.ambient.start();}
  this.ambientGain?.gain.setTargetAtTime(playing&&!this.settings().muted?this.settings().music*0.025:0,c.currentTime,0.1);
 }
}
