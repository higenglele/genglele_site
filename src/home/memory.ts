import type {Msg} from './conversation';
export const DAY=86400000;
export type Preference={id:string;text:string};
export function recentMessages(messages:Msg[],now=Date.now()):Msg[]{
 let keep=false;
 return messages.filter(m=>{if(m.role==='user')keep=typeof m.at==='number'&&Number.isFinite(m.at)&&m.at<=now&&now-m.at<DAY;return keep;});
}
export function savePreference(items:Preference[],text:string,id?:string):Preference[]{
 if(typeof text!=='string'||!text.trim()||text.length>300)throw Error('偏好需为 1–300 字');
 if(id&&!items.some(p=>p.id===id))throw Error('偏好不存在');
 if(id)return items.map(p=>p.id===id?{...p,text:text.trim()}:p);
 if(items.some(p=>p.text===text.trim()))return items;
 if(items.length>=30)throw Error('最多保存30条偏好，请先整理');
 return [...items,{id:crypto.randomUUID(),text:text.trim()}];
}
