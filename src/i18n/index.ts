import {RU,RU_LEVELS} from './ru';
import {LEVELS} from '../game/config/levels';
export type Language='ru'|'en';
let language:Language='ru';
export function setLanguage(value:Language):void {language=value;if(typeof document!=='undefined')document.documentElement.lang=value;}
export const getLanguage=():Language=>language;
LEVELS.forEach((level,i)=>{RU[level.name]=RU_LEVELS[i][0];RU[level.description]=RU_LEVELS[i][1];});
Object.assign(RU,{
 'Tap the pasture to plant grass. Tap eggs to collect them. Your geese do the rest!':'Нажмите на землю, чтобы посадить траву. Нажимайте на яйца, чтобы собрать их. Гуси позаботятся об остальном!',
 'Buy a goose with the + button. Refill the well before it runs dry.':'Купите гуся кнопкой «+». Не забывайте пополнять колодец.',
 'Open the warehouse, select eggs, and send the truck. Coins arrive when it returns.':'Откройте склад, выберите яйца и отправьте машину. Монеты поступят после её возвращения.',
 'Collect eggs, then tap the egg mill. Finished powder waits beside the workshop.':'Соберите яйца и нажмите на яичную мельницу. Готовый порошок появится рядом с ней.',
 'Egg → egg powder → cake. Collect each workshop’s output before the next step.':'Яйцо → яичный порошок → торт. Подбирайте готовые продукты перед следующим этапом.',
 'Dogs hold bears briefly. Tap a bear repeatedly, then collect its cage and sell it.':'Собаки ненадолго задерживают медведей. Нажимайте на медведя, заберите клетку и продайте её.',
 'Storage is tighter today. Ship partial loads and process raw goods to free space.':'Сегодня склад меньше. Отправляйте небольшие партии и перерабатывайте сырьё, чтобы освободить место.',
 'Keep grass growing, collect your harvest, and keep the truck busy. Tap a workshop to process its input.':'Сажайте траву, собирайте урожай и отправляйте товары на рынок. Нажмите на мастерскую, чтобы начать переработку.',
 'A new day on your little farm.':'Новый день на вашей уютной ферме.',
 'Invalid save JSON.':'Не удалось прочитать JSON. Проверьте файл сохранения.',
});
const forms:Record<string,readonly [string,string,string]>={
 eggs:['яйцо','яйца','яиц'],egg:['яйцо','яйца','яиц'],'egg powder':['пакет порошка','пакета порошка','пакетов порошка'],powder:['пакет порошка','пакета порошка','пакетов порошка'],cakes:['торт','торта','тортов'],cake:['торт','торта','тортов'],wool:['моток шерсти','мотка шерсти','мотков шерсти'],thread:['катушку нитей','катушки нитей','катушек нитей'],cloth:['рулон ткани','рулона ткани','рулонов ткани'],milk:['бутылку молока','бутылки молока','бутылок молока'],butter:['пачку масла','пачки масла','пачек масла'],cheese:['головку сыра','головки сыра','головок сыра'],'caged bears':['медведя в клетке','медведя в клетках','медведей в клетках'],'caged bear':['медведя в клетке','медведя в клетках','медведей в клетках'],coins:['монету','монеты','монет'],geese:['гуся','гуся','гусей'],goose:['гуся','гуся','гусей'],sheep:['овцу','овцы','овец'],cows:['корову','коровы','коров'],cow:['корову','коровы','коров'],cats:['кошку','кошки','кошек'],cat:['кошку','кошки','кошек'],dogs:['собаку','собаки','собак'],dog:['собаку','собаки','собак'],
};
export function plural(n:number,words:readonly [string,string,string]):string {const tail=n%100;return words[tail>=11&&tail<=14?2:n%10===1?0:n%10>=2&&n%10<=4?1:2];}
const productName=(key:string)=>({powder:'Яичный порошок',bear:'Медведь в клетке'}[key]??RU[key[0]?.toUpperCase()+key.slice(1)]??key);
const patterns:Array<[RegExp,(m:RegExpMatchArray)=>string]>=[
 [/^(Collect|Make|Deliver|Store|Own|Have|Earn) (\d+) (.+)$/,m=>`${({Collect:'Собрать',Make:'Произвести',Deliver:'Доставить',Store:'Хранить',Own:'Иметь',Have:'Иметь',Earn:'Заработать'})[m[1]]} ${m[2]} ${forms[m[3]]?plural(Number(m[2]),forms[m[3]]):productName(m[3])}`],
 [/^DAY (\d+) · (.+)$/,m=>`ДЕНЬ ${m[1]} · ${t(m[2])}`], [/^CHAPTER (\d+)$/,m=>`ГЛАВА ${m[1]}`], [/^0[123] · (.+)$/,m=>`${m[0].slice(0,5)}${t(m[1])}`],
 [/^Level (\d+)$/,m=>`Уровень ${m[1]}`],[/^Lv\.(\d+)$/,m=>`Ур. ${m[1]}`],[/^Upgrade (\d+)c$/,m=>`Улучшить: ${m[1]}`],
 [/^Refill · (\d+) coins$/,m=>`Пополнить · ${m[1]} монет`],[/^Refilling · (\d+)s$/,m=>`Набираем · ${m[1]} с`],
 [/^(\d+\/\d+) slots$/,m=>`${m[1]} мест`],[/^(\d+) cargo slots$/,m=>`${m[1]} мест в кузове`],[/^Back in (\d+)s$/,m=>`Через ${m[1]} с`],
 [/^(\d+) coins on return$/,m=>`+${m[1]} монет по возвращении`],[/^(\d+) coins · (\d+) slots?$/,m=>`${m[1]} монет · ${m[2]} ${plural(Number(m[2]),['место','места','мест'])}`],
 [/^(\d+) coins$/,m=>`${m[1]} монет`],[/^(Remove|Load) (.+)$/,m=>`${m[1]==='Load'?'Погрузить':'Убрать'}: ${productName(m[2])}`],
 [/^Send delivery · (\d+)s trip$/,m=>`Отправить · ${m[1]} с в пути`],[/^Truck returns in (\d+)s$/,m=>`Машина вернётся через ${m[1]} с`],[/^On to day (\d+)$/,m=>`К следующему дню: ${m[1]}`],
 [/^Welcome, little (.+)!$/,m=>`На ферме новый друг: ${productName(m[1]).toLowerCase()}!`],[/^\+1 (.+)$/,m=>`+1 ${t(m[1])}`],
 [/^Collect (.+) first\.$/,m=>`Сначала соберите сырьё: ${productName(m[1]).toLowerCase()}.`],[/^Making (.+)…$/,m=>`Производим: ${productName(m[1]).toLowerCase()}…`],
 [/^Workshop upgrade costs (\d+) coins\.$/,m=>`Улучшение стоит ${m[1]} монет.`],[/^(.+) upgraded to level (\d+)$/,m=>`${t(m[1])}: уровень ${m[2]}`],
 [/^Off to market · (\d+) coins on return$/,m=>`На рынок! После возвращения: +${m[1]} монет`],[/^Market delivery · \+(\d+) coins$/,m=>`Доставка завершена · +${m[1]} монет`],
 [/^(.+) ready!$/,m=>`${t(m[1])}: готово!`],[/^A hungry (.+) left\. Keep grass growing!$/,m=>`Животное ушло из-за голода. Посадите траву! (${productName(m[1])})`],
 [/^COLLECT · (\d+)s$/,m=>`ЗАБРАТЬ · ${m[1]} с`],[/^! BEAR · (\d+)s$/,m=>`! МЕДВЕДЬ · ${m[1]} с`],[/^(\d+)s · (\d+) crafting$/,m=>`${m[1]} с · в работе: ${m[2]}`],[/^(\d+)s · ×(\d+)$/,m=>`${m[1]} с · ×${m[2]}`],[/^MARKET · (\d+)s$/,m=>`РЫНОК · ${m[1]} с`],
 [/^Buy (.+)$/,m=>`Купить: ${t(m[1])}`],
];
export function t(source:string):string {
 if(language==='en'||!source.trim())return source;
 const value=source.trim();let result=RU[value];
 if(result===undefined){for(const [pattern,format] of patterns){const match=value.match(pattern);if(match){result=format(match);break;}}}
 return result===undefined?source:source.replace(value,result);
}
// Translate text nodes and accessibility text, never markup, data attributes, IDs, or saved entity keys.
export function localizeTree(root:Element):void {
 if(language==='en')return;
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node:Node|null;
 while((node=walker.nextNode())){if(node.parentElement?.closest('script,style,svg'))continue;const value=node.nodeValue??'';const translated=t(value);if(value!==translated)node.nodeValue=translated;}
 for(const el of [root,...root.querySelectorAll('[aria-label],[title],[alt]')])for(const attribute of ['aria-label','title','alt']){const value=el.getAttribute(attribute);if(value)el.setAttribute(attribute,t(value));}
}
