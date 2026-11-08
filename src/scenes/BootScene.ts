import Phaser from 'phaser';
import {animalArt,buildingArt,productArt,farmArt,openFarmArt,treeArt,wellArt,warehouseArt,truckArt,grassArt,cageArt,cloudArt,dataUri} from '../assets/art';
import {ANIMALS} from '../game/config/animals';
import {PRODUCTS} from '../game/config/products';
import {BUILDINGS} from '../game/config/buildings';
import type {Building,Product,Species} from '../game/config/types';
export class BootScene extends Phaser.Scene {
 constructor(){super('Boot');}
 preload():void {
  for(const s of [...Object.keys(ANIMALS),'bear'] as (Species|'bear')[])for(let f=0;f<4;f++)this.load.svg(`${s}-${f}`,dataUri(animalArt(s,f)));
  for(const p of Object.keys(PRODUCTS) as Product[])this.load.svg(`product-${p}`,dataUri(productArt(p)));
  for(const b of Object.keys(BUILDINGS) as Building[])for(let l=1;l<=3;l++)this.load.svg(`building-${b}-${l}`,dataUri(buildingArt(b,l)));
  for(const [key,art] of Object.entries({farm:farmArt(),'farm-open':openFarmArt(),tree:treeArt,well:wellArt,warehouse:warehouseArt,truck:truckArt,grass:grassArt,cage:cageArt,cloud:cloudArt}))this.load.svg(key,dataUri(art));
 }
 create():void {this.scene.start('Farm');}
}
