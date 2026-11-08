import type {Product} from './types';
export const PRODUCTS:Record<Product,{name:string;price:number;slots:number;color:string}> = {
 egg:{name:'Egg',price:18,slots:1,color:'#ffe9b2'},powder:{name:'Egg powder',price:48,slots:1,color:'#edb841'},cake:{name:'Cake',price:108,slots:2,color:'#eab0a1'},
 wool:{name:'Wool',price:38,slots:2,color:'#fff8e3'},thread:{name:'Thread',price:86,slots:2,color:'#c88268'},cloth:{name:'Cloth',price:175,slots:3,color:'#86b5b3'},
 milk:{name:'Milk',price:62,slots:2,color:'#c1dbe1'},butter:{name:'Butter',price:138,slots:2,color:'#f3cd5b'},cheese:{name:'Cheese',price:270,slots:3,color:'#edaa48'},
 bear:{name:'Caged bear',price:90,slots:5,color:'#907254'}
};
