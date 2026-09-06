import { updateDevice } from './state';
import type { Device } from './state';
export type ToolResult = {ok:boolean; message:string; devices:Device[]; changed:boolean; data?:unknown};
export function executeDeviceTool(devices:Device[],name:string,args:unknown):ToolResult {
 const fail=(message:string):ToolResult=>({ok:false,message,devices,changed:false});
 if(!args||typeof args!=='object'||Array.isArray(args)) return fail('参数必须是对象');
 const a=args as Record<string,unknown>;
 if(name==='list_devices') return {ok:true,message:'已读取设备列表',devices,changed:false,data:devices};
 if(name!=='get_device'&&name!=='set_device') return fail('不支持的工具');
 const d=devices.find(d=>d.id===a.device_id);
 if(!d) return fail('设备不存在，请核对设备列表');
 if(name==='get_device') return {ok:true,message:'已读取最新设备状态',devices,changed:false,data:d};
 if(Object.keys(a).some(k=>!['device_id','on','value'].includes(k))) return fail('包含不允许修改的字段');
 if(!d.online) return fail(`${d.name}离线，操作未执行`);
 if(a.on===undefined&&a.value===undefined) return fail('未指定操作');
 if(a.on!==undefined&&typeof a.on!=='boolean') return fail('开关必须为布尔值');
 if(a.value!==undefined&&(typeof a.value!=='number'||!Number.isFinite(a.value)||a.value<(d.kind==='ac'?16:0)||a.value>(d.kind==='ac'?30:100)||d.kind==='vacuum')) return fail('设备参数不受支持或超出允许范围');
 const next=updateDevice(devices,d.id,{...(a.on!==undefined?{on:a.on as boolean}:{}),...(a.value!==undefined?{value:a.value as number}:{})});
 return {ok:true,message:`${d.name}模拟设备已执行`,devices:next,changed:true,data:next.find(v=>v.id===d.id)};
}
