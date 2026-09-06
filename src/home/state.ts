export type Device = { id: string; name: string; room: string; kind: 'light' | 'ac' | 'curtain' | 'speaker' | 'vacuum'; online: boolean; on: boolean; value: number };
export const initialDevices: Device[] = [
 {id:'living-light',name:'客厅灯',room:'客厅',kind:'light',online:true,on:true,value:60},
 {id:'bed-light',name:'床头灯',room:'卧室',kind:'light',online:true,on:false,value:30},
 {id:'ac',name:'卧室空调',room:'卧室',kind:'ac',online:true,on:true,value:26},
 {id:'curtain',name:'卧室窗帘',room:'卧室',kind:'curtain',online:true,on:true,value:80},
 {id:'speaker',name:'客厅音箱',room:'客厅',kind:'speaker',online:true,on:false,value:35},
 {id:'vacuum',name:'扫地机器人',room:'客厅',kind:'vacuum',online:true,on:false,value:0},
];
export function updateDevice(devices: Device[], id: string, patch: Partial<Pick<Device,'on'|'value'|'online'>>): Device[] {
 return devices.map(d => {
  if(d.id !== id) return d;
  if(patch.online !== undefined) return {...d, online:patch.online};
  if(!d.online) return d;
  const next={...d,...patch};
  if(patch.value !== undefined) next.value=Number.isFinite(patch.value) ? Math.min(d.kind==='ac'?30:100,Math.max(d.kind==='ac'?16:0,patch.value)) : d.value;
  if(d.kind==='curtain') {
   if(patch.value !== undefined) next.on=next.value>0;
   else if(patch.on !== undefined) next.value=patch.on?100:0;
  }
  return next;
 });
}
export function restoreDevices(raw: string | null): Device[] {
 const defaults=()=>initialDevices.map(d=>({...d}));
 try {
  const saved=JSON.parse(raw || 'null');
  if(!Array.isArray(saved) || saved.length!==initialDevices.length) return defaults();
  return initialDevices.map(base=>{
   const d=saved.find(v=>v?.id===base.id);
   if(!d || typeof d.on!=='boolean' || typeof d.online!=='boolean' || typeof d.value!=='number' || !Number.isFinite(d.value)) throw Error('Invalid device');
   let next=updateDevice([base],base.id,{on:d.on,value:d.value})[0];
   return {...next,online:d.online};
  });
 } catch { return defaults(); }
}
