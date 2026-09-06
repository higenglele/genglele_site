import type {Device} from './state';
import {executeDeviceTool} from './tools';
export type Action={device_id:string;on?:boolean;value?:number};
export type Plan={title:string;reason:string;actions:Action[];before:Device[];status:'pending'|'cancelled'|'executed'|'stale'};
export function createPlan(devices:Device[],args:unknown):Plan {
 if(!args||typeof args!=='object')throw Error('计划格式无效');
 const a=args as Record<string,unknown>;
 if(typeof a.title!=='string'||!a.title.trim()||a.title.length>80||typeof a.reason!=='string'||a.reason.length>500||!Array.isArray(a.actions)||!a.actions.length||a.actions.length>6)throw Error('计划需要标题、理由及 1–6 项设备操作');
 const ids=new Set<string>();
 const actions=a.actions.map((action:Action)=>{
  const check=executeDeviceTool(devices.map(d=>({...d,online:true})),'set_device',action);
  if(!check.ok)throw Error(check.message);
  if(ids.has(action.device_id))throw Error('同一设备只能出现一次');
  ids.add(action.device_id);
  return {...action};
 });
 return {title:a.title,reason:a.reason,actions,before:devices.filter(d=>ids.has(d.id)).map(d=>({...d})),status:'pending'};
}
export function settlePlan(plan:Plan,devices:Device[],approved:boolean){
 const fail=(message:string)=>({ok:false,message,devices,changed:false,results:[] as {ok:boolean;message:string;device_id:string}[]});
 if(plan.status!=='pending')return fail('计划已经处理，不会重复执行');
 plan.status=approved?'executed':'cancelled';
 if(!approved)return fail('用户已取消计划，没有执行任何操作');
 if(plan.before.some(old=>{const now=devices.find(d=>d.id===old.id);return !now||now.on!==old.on||now.value!==old.value;})){
  plan.status='stale';return fail('设备状态已经变化，请重新生成计划并确认');
 }
 let next=devices;let changed=false;
 const results=plan.actions.map(action=>{
  const result=executeDeviceTool(next,'set_device',action);
  next=result.devices;changed ||= result.changed;
  return {device_id:action.device_id,ok:result.ok,message:result.message};
 });
 const ok=results.every(r=>r.ok);
 return {ok,message:ok?'已按确认计划执行全部操作':'部分操作失败，请查看逐项结果',devices:next,changed,results};
}
