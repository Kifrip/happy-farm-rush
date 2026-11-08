export type Species = 'goose'|'sheep'|'cow'|'cat'|'dog';
export type Product = 'egg'|'powder'|'cake'|'wool'|'thread'|'cloth'|'milk'|'butter'|'cheese'|'bear';
export type Building = 'powder'|'bakery'|'spinning'|'weaving'|'churn'|'cheese';
export type Upgrade = 'well'|'refill'|'warehouse'|'cargo'|'truck'|'cage'|'factory'|'batch';
export type Inventory = Record<Product,number>;
export type Upgrades = Record<Upgrade,number>;
export interface Point {x:number;y:number}
export interface Animal extends Point {id:number; species:Species; target:Point; hunger:number; cooldown:number; state:'idle'|'wandering'|'seeking'|'eating'|'producing'|'fleeing'|'stunned'; warning:number; bark:number}
export interface Drop extends Point {id:number;kind:Product;age:number}
export interface Grass extends Point {id:number;food:number;age:number}
export interface Bear extends Point {id:number;hits:number;warning:number;stun:number;caged:boolean;cageTime:number;attack:number}
export interface Machine {kind:Building;level:number;remaining:number;duration:number;batch:number}
export interface Objective {type:'collect'|'produce'|'balance'|'revenue'|'own'|'deliver'|'stock';key:Product|Species|'coins';amount:number}
export interface Level {id:number;name:string;chapter:string;description:string;tip:string;coins:number;animals:Partial<Record<Species,number>>;water:number;buildings:Building[];unlocked:Species[];objectives:Objective[];bears:number[];gold:number;silver:number;bronze:number;reward:number;inventory:Partial<Inventory>;capacity?:number;activeUpgrades:Partial<Upgrades>}
export interface FarmState {level:number;seed:number;nextId:number;time:number;coins:number;water:number;refill:number;animals:Animal[];grass:Grass[];drops:Drop[];bears:Bear[];machines:Machine[];inventory:Inventory;collected:Inventory;produced:Inventory;delivered:Inventory;revenue:number;truck:{remaining:number;duration:number;cargo:Inventory;value:number};spawned:number;complete:boolean;lost:number;upgrades:Upgrades}
export type EventKind = 'plant'|'water'|'product'|'collect'|'factory'|'dispatch'|'return'|'bear'|'capture'|'complete'|'buy'|'error';
export interface GameEvent {kind:EventKind;text:string;x?:number;y?:number;asset?:string}
export interface Settings {language:'ru'|'en';sound:number;music:number;muted:boolean;effects:boolean;reducedMotion:boolean}
export interface Progress {version:1;unlocked:number;stars:number;spent:number;totalEarned:number;best:Record<string,{time:number;medal:number}>;upgrades:Upgrades;settings:Settings;achievements:string[];active:FarmState|null}
