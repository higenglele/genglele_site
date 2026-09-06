import {AgentChat} from "./AgentChat";
import {useEffect,useState} from 'react';
import {Lightbulb, Wind, PanelLeftClose, Music2, Bot, Home, SlidersHorizontal, ArrowUpRight, Power, Wifi, WifiOff} from 'lucide-react';
import {Device,initialDevices,restoreDevices,updateDevice} from './state';
import './home.css';
import './mobile.css';
import {deviceSignal,signalLabels} from './signals';
import type {Signal} from './signals';
const KEY='gengle-home-devices-v1';
const icons={light:Lightbulb,ac:Wind,curtain:PanelLeftClose,speaker:Music2,vacuum:Bot};
function describe(d:Device) { if(!d.online) return '设备离线'; if(!d.on) return d.kind==='curtain'?'已关闭':d.kind==='vacuum'?'待机':'已关闭'; return d.kind==='light'?`亮度 ${d.value}%`:d.kind==='ac'?`${d.value}°C · 制冷`:d.kind==='curtain'?`已打开 ${d.value}%`:d.kind==='speaker'?`音量 ${d.value}% · 模拟播放`:'正在清扫'; }
export function HomeApp(){
 const [devices,setDevices]=useState<Device[]>(()=>{try{return restoreDevices(localStorage.getItem(KEY));}catch{return restoreDevices(null);}});
 const [tab,setTab]=useState<'home'|'devices'|'chat'>('home');
 const [room,setRoom]=useState('全部');
 const [message,setMessage]=useState('设备已就绪');
 const [saved,setSaved]=useState(true);
 const [signals,setSignals]=useState<Record<string,Signal>>({});
 function applyDevices(next:Device[]){setSignals(current=>{const updated={...current};for(const d of next){const old=devices.find(v=>v.id===d.id);if(old&&(old.on!==d.on||old.value!==d.value))updated[d.id]=deviceSignal(old,d);}return updated;});setDevices(next);}
 useEffect(()=>{const title=document.title;document.title='栖居 · 家庭控制中心';window.scrollTo(0,0);return()=>{document.title=title;};},[]);
 useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify(devices));setSaved(true);}catch{setSaved(false);}},[devices]);
 function change(id:string,patch:Partial<Pick<Device,'on'|'online'|'value'>>) {
  applyDevices(updateDevice(devices,id,patch));
  const d=devices.find(d=>d.id===id)!;
  setMessage(`${d.name} · ${patch.online!==undefined?(patch.online?'已恢复在线':'已模拟离线'):'设置已更新'}`);
 }
 const online=devices.filter(d=>d.online).length;
 const active=devices.filter(d=>d.online&&d.on).length;
 const visible=devices.filter(d=>room==='全部'||d.room===room);
 return <main className={`ha-app ha-screen-${tab}`}><div className="ha-shell">
  <header className="ha-header"><a href="#home-product" className="ha-brand"><span>栖</span><div>栖居<small>HOME COMPANION</small></div></a><a href="#home-product" className="ha-return" aria-label="返回产品介绍" title="返回产品介绍">返回产品介绍 <ArrowUpRight size={16}/></a></header>
  <div className="ha-page-heading"><div><p className="ha-kicker">YOUR SPACE, IN BALANCE</p><h1>{tab==='home'?'让家，回到舒适的状态。':tab==='chat'?'一句话，调整你的家。':'每一台设备，都在这里。'}</h1><p className="ha-sub">客厅与卧室 · 手动控制你的模拟家庭</p></div><span className="ha-demo"><i/>模拟家庭 · 第二步</span></div>
  <nav className="ha-tabs" aria-label="家庭管家导航"><button aria-current={tab==='home'?'page':undefined} onClick={()=>setTab('home')}><Home size={18}/>家庭概览</button><button aria-current={tab==='devices'?'page':undefined} onClick={()=>setTab('devices')}><SlidersHorizontal size={18}/>设备管理</button><button aria-current={tab==='chat'?'page':undefined} onClick={()=>setTab('chat')}><Bot size={18}/>Agent 对话</button></nav>
  {tab==='home'&&<section className="ha-overview" aria-label="家庭概况"><div className="ha-overview-main"><p>HOME STATUS</p><h2>你的家，状态一目了然。</h2><span>灯光、温度与窗帘，按自己的节奏调整。</span><div className="ha-room-summary"><span>客厅 <b>{devices.filter(d=>d.room==='客厅'&&d.on&&d.online).length} 台运行</b></span><span>卧室 <b>{devices.filter(d=>d.room==='卧室'&&d.on&&d.online).length} 台运行</b></span></div></div><div className="ha-stats"><div><strong>{online}<small>/ {devices.length}</small></strong><span>设备在线</span></div><div><strong>{active}<small> 台</small></strong><span>正在运行</span></div><div><strong>2<small> 个</small></strong><span>家庭空间</span></div></div></section>}
  <div className="ha-chat-page" hidden={tab!=='chat'}><AgentChat devices={devices} onDevices={next=>{applyDevices(next);setMessage('Agent 已更新模拟设备');}}/></div>
  {tab!=='chat'&&<section aria-labelledby="ha-devices-title"><div className="ha-section-heading"><h2 id="ha-devices-title">{tab==='home'?'常用设备':'全部设备'}</h2><div className="ha-filters" aria-label="按房间筛选">{['全部','客厅','卧室'].map(r=><button key={r} aria-pressed={room===r} onClick={()=>setRoom(r)}>{r}</button>)}</div></div>
  <div className="ha-device-grid">{visible.map(d=>{const Icon=icons[d.kind];return <article key={d.id} className={`ha-device ${d.on&&d.online?'is-on':''} ${!d.online?'is-offline':''}`}>
   <div className="ha-device-top"><span className="ha-device-icon"><Icon size={23}/></span><button className="ha-power" aria-label={`${d.name}开关`} role="switch" aria-checked={d.on} disabled={!d.online} onClick={()=>change(d.id,{on:!d.on})}><Power size={18}/></button></div>
   <p className="ha-room">{d.room}</p><h3>{d.name}</h3><p className="ha-device-status"><i className={`ha-signal ${!d.online?'failed':signals[d.id]||(d.on?'on':'off')}`} role="img" aria-label={!d.online?'离线':signalLabels[signals[d.id]||(d.on?'on':'off')]}/>{describe(d)}</p>
   {d.kind!=='vacuum'?<label className="ha-slider"><span>{d.kind==='ac'?'设定温度':d.kind==='curtain'?'开合度':d.kind==='speaker'?'音量':'亮度'}<b>{d.value}{d.kind==='ac'?'°C':'%'}</b></span><input aria-label={`${d.name}${d.kind==='ac'?'温度':d.kind==='curtain'?'开合度':d.kind==='speaker'?'音量':'亮度'}`} type="range" min={d.kind==='ac'?16:0} max={d.kind==='ac'?30:100} value={d.value} disabled={!d.online} onChange={e=>change(d.id,{value:Number(e.target.value)})}/></label>:<div className="ha-vacuum"><button disabled={!d.online} onClick={()=>change(d.id,{on:!d.on})}>{d.on?'暂停清扫':'开始清扫'}</button><span>模拟执行，不控制真实设备</span></div>}
   <div className="ha-online"><span>{d.online?<Wifi size={13}/>:<WifiOff size={13}/>} {d.online?'在线':'离线'}</span>{tab==='devices'&&<button onClick={()=>change(d.id,{online:!d.online})}>{d.online?'模拟离线':'恢复在线'}</button>}</div>
  </article>})}</div></section>}
  <footer className="ha-footer"><div><p role="status" aria-live="polite">{message}</p><span>{saved?'设置保存在当前浏览器，刷新后保留。':'当前浏览器无法保存，关闭页面后设置将丢失。'}同一浏览器配置共享这套模拟家庭。</span></div><span className="ha-stage">场景计划 · 确认后执行模拟设备</span></footer>
 </div></main>;
}
