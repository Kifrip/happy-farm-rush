import type {Species,Product} from './types';
export const ANIMALS:Record<Species,{name:string;price:number;speed:number;interval:number;hunger:number;product:Product|null;description:string}> = {
 goose:{name:'Goose',price:90,speed:36,interval:30,hunger:1.35,product:'egg',description:'A happy goose lays eggs.'},
 sheep:{name:'Sheep',price:260,speed:28,interval:42,hunger:1.2,product:'wool',description:'Soft wool, a warm little heart.'},
 cow:{name:'Cow',price:540,speed:23,interval:50,hunger:1.55,product:'milk',description:'Fresh milk for the dairy chain.'},
 cat:{name:'Cat',price:180,speed:68,interval:0,hunger:0,product:null,description:'Collects nearby goods for you.'},
 dog:{name:'Dog',price:210,speed:55,interval:0,hunger:0,product:null,description:'Barks to hold bears in place.'}
};
