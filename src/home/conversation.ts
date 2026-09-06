import type {Device} from './state';
import type {Signal} from './signals';
export type Msg={role:'user'|'assistant'|'tool';content:string|null;at?:number;source?:'event';signals?:Signal[];tool_calls?:{id:string;type:string;function:{name:string;arguments:string}}[];tool_call_id?:string;reasoning_content?:string};
export function visibleMessages(messages:Msg[]):Msg[]{return messages.filter(m=>m.content&&(m.role==='user'||(m.role==='assistant'&&!m.tool_calls?.length)));}
export function formatOutcome(results:{device_id:string;ok:boolean;message?:string}[],devices:Device[]):string{
 return results.map(r=>{
  const d=devices.find(d=>d.id===r.device_id);
  const name=d?.name||'设备';
  if(!r.ok)return `${name}未调整：${r.message||'执行失败'}。`;
  if(!d)return `${name}结果待核对。`;
  if(!d.on)return `${name}${d.kind==='vacuum'?'已暂停':'已关闭'}。`;
  const value=d.kind==='light'?`，亮度 ${d.value}%`:d.kind==='ac'?`，温度 ${d.value}°C`:d.kind==='curtain'?`，开合度 ${d.value}%`:d.kind==='speaker'?`，音量 ${d.value}%`:'';
  return `${name}${d.kind==='vacuum'?'已开始清扫':'已打开'}${value}。`;
 }).join('\n');
}
export function restoreConversation(raw:string|null):Msg[]{
 try{const messages=JSON.parse(raw||'[]');
  if(!Array.isArray(messages)||messages.some(m=>!m||!['user','assistant','tool'].includes(m.role)||(m.content!==null&&typeof m.content!=='string')))return [];
  return messages;
 }catch{return [];}
}
