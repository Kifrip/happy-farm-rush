import {describe,it,expect,afterEach} from 'vitest';
import {setLanguage,t,plural} from '../src/i18n';
import {LEVELS} from '../src/game/config/levels';
import {ANIMALS} from '../src/game/config/animals';
import {BUILDINGS} from '../src/game/config/buildings';
import {PRODUCTS} from '../src/game/config/products';
import {UPGRADES} from '../src/game/config/upgrades';
import {newProgress,parseSave} from '../src/game/persistence/SaveManager';
import {GameSimulation} from '../src/game/engine/GameSimulation';
afterEach(()=>setLanguage('ru'));
describe('Russian localization',()=>{
 it('translates every campaign title, description and field note',()=>{setLanguage('ru');for(const l of LEVELS)for(const text of [l.name,l.description,l.tip])expect(t(text),text).not.toMatch(/[a-z]/i);});
 it('translates every animal, product, building and permanent upgrade',()=>{setLanguage('ru');const texts=[...Object.values(ANIMALS).flatMap(a=>[a.name,a.description]),...Object.values(PRODUCTS).map(p=>p.name),...Object.values(BUILDINGS).flatMap(b=>[b.name,b.short]),...Object.values(UPGRADES).flatMap(u=>[u.name,u.description,u.unit])];for(const text of texts)expect(t(text),text).not.toMatch(/[a-z]/i);});
 it('handles objective grammar, live timers and production messages',()=>{setLanguage('ru');expect(t('Collect 4 eggs')).toBe('Собрать 4 яйца');expect(t('Collect 11 eggs')).toBe('Собрать 11 яиц');expect(t('Own 3 geese')).toBe('Иметь 3 гуся');expect(t('18s · ×2')).toBe('18 с · ×2');expect(t('Refilling · 3s')).toBe('Набираем · 3 с');expect(t('Making egg powder…')).toBe('Производим: яичный порошок…');expect(t('Market delivery · +553 coins')).toBe('Доставка завершена · +553 монет');expect(t('DAY 01 · THE LITTLE HOMESTEAD')).toBe('ДЕНЬ 01 · УЮТНАЯ ФЕРМА');});
 it('preserves English and supports repeated Russian translation',()=>{setLanguage('en');expect(t('Collect 4 eggs')).toBe('Collect 4 eggs');setLanguage('ru');expect(t(t('Warehouse'))).toBe('Склад');});
 it('uses Russian counting rules for teens and compound numbers',()=>{const words=['яйцо','яйца','яиц'] as const;expect([1,2,5,11,14,21,24,111].map(n=>plural(n,words))).toEqual(['яйцо','яйца','яиц','яиц','яиц','яйцо','яйца','яиц']);});
});
describe('language save compatibility',()=>{
 it('migrates an older save without changing its farm or earned rewards',()=>{const progress=newProgress();progress.unlocked=20;progress.totalEarned=3;progress.stars=1;progress.spent=2;progress.best['1']={time:65,medal:3};progress.upgrades.well=1;progress.active=new GameSimulation(LEVELS[19]).s;const old=JSON.parse(JSON.stringify(progress));delete old.settings.language;const restored=parseSave(JSON.stringify(old));expect(restored.settings.language).toBe('ru');expect(restored.active).toEqual(progress.active);expect(restored.upgrades.well).toBe(1);expect(restored.best).toEqual(progress.best);expect(restored.stars).toBe(1);});
 it('persists the selected English locale and rejects invalid locale data',()=>{const p=newProgress();p.settings.language='en';expect(parseSave(JSON.stringify(p)).settings.language).toBe('en');const invalid=JSON.parse(JSON.stringify(p));invalid.settings.language='xx';expect(()=>parseSave(JSON.stringify(invalid))).toThrow();});
});
