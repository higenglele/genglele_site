import {useEffect,useState,useRef} from 'react';
import {Device} from './state';
import {executeDeviceTool} from './tools';
import {createPlan,settlePlan} from './plans';
import type {Plan} from './plans';
import {visibleMessages,formatOutcome,restoreConversation} from './conversation';
import type {Msg} from './conversation';
import {recentMessages,savePreference,DAY} from './memory';
import type {Preference} from './memory';
import {eventAllowed,eventLabels} from './events';
import type {HomeEvent} from './events';
import {deviceSignal,signalLabels} from './signals';
import type {Signal} from './signals';
const EVENT_KEY='gengle-home-event-cooldown-v1';
const CHAT_KEY='gengle-home-chat-24h-v1';
const PREF_KEY='gengle-home-preferences-v1';
export function AgentChat({devices,onDevices}:{devices:Device[];onDevices:(devices:Device[])=>void}){
 const [messages,setMessages]=useState<Msg[]>(()=>{try{return recentMessages(restoreConversation(localStorage.getItem(CHAT_KEY)));}catch{return [];}});const history=useRef<Msg[]>(messages);
 const [preferences,setPreferences]=useState<Preference[]>(()=>{try{const p=JSON.parse(localStorage.getItem(PREF_KEY)||'[]');return Array.isArray(p)?p.filter(v=>typeof v?.id==='string'&&typeof v?.text==='string'&&v.text.length<=300).slice(0,30):[];}catch{return [];}});
 const prefs=useRef(preferences);prefs.current=preferences;
 const [pendingMemory,setPendingMemory]=useState<string|null>(null);
 function storePrefs(next:Preference[]){localStorage.setItem(PREF_KEY,JSON.stringify(next));prefs.current=next;setPreferences(next);}
 const [input,setInput]=useState('');const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [configured,setConfigured]=useState<boolean|null>(null);
 function complete(work:Msg[]){const current=recentMessages(work);history.current=current;setMessages([...current]);try{localStorage.setItem(CHAT_KEY,JSON.stringify(current));}catch{setError('当前浏览器无法保存对话，关闭后可能丢失。');}}
 const state=useRef(devices);state.current=devices;
 const running=useRef(false);
 const lastEvents=useRef<Partial<Record<HomeEvent,number>>>((()=>{try{const value=JSON.parse(sessionStorage.getItem(EVENT_KEY)||'{}');return value&&typeof value==='object'?value:{};}catch{return {};}})());
 const [eventNotice,setEventNotice]=useState('');
 const [activeEvent,setActiveEvent]=useState<HomeEvent|null>(null);
 function persistEvents(){try{sessionStorage.setItem(EVENT_KEY,JSON.stringify(lastEvents.current));}catch{}}
 function triggerEvent(event:HomeEvent){
  if(!configured||running.current)return;
  if(!eventAllowed(lastEvents.current,event,Date.now(),false)){setEventNotice('刚刚已提醒过，同一事件5分钟内不再重复。');return;}
  lastEvents.current[event]=Date.now();persistEvents();setEventNotice('');send(eventLabels[event],event);
 }
 useEffect(()=>{
  const clean=()=>{if(!running.current)complete(history.current);};
  clean();const timer=setInterval(clean,30000);window.addEventListener('focus',clean);
  try{sessionStorage.removeItem('gengle-home-chat-session-v1');}catch{}
  return()=>{clearInterval(timer);window.removeEventListener('focus',clean);};
 },[]);
 const [pending,setPending]=useState<Plan|null>(null);
 const approval=useRef<((approved:boolean)=>void)|null>(null);
 const mounted=useRef(true);
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;approval.current?.(false);approval.current=null;};},[]);
 function decide(approved:boolean){const resolve=approval.current;approval.current=null;setPending(null);setPendingMemory(null);resolve?.(approved);}
 useEffect(()=>{fetch('/api/home-agent').then(r=>r.json()).then(r=>setConfigured(r.configured)).catch(()=>setConfigured(false));},[]);
 async function send(text:string,event?:HomeEvent){
  if(running.current||!text.trim())return;running.current=true;setBusy(true);setError('');setInput('');
  const started=Date.now();setActiveEvent(event||null);
  let resultSignals:Signal[]=[];
  let devicesRead=false;let preferencesRead=false;
  let work:Msg[]=[...recentMessages(history.current),{role:'user',content:text,at:started,...(event?{source:'event' as const}:{})}];setMessages(work);let written=false;let proposed=false;let outcome='';
  try {
   for(let step=0;step<8;step++){
    work=recentMessages(work);
    if(Date.now()-started>=DAY)throw Error('本轮对话已超过24小时，请重新发出指令。');
    const response=await fetch('/api/home-agent',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:work,event}),signal:AbortSignal.timeout(50000)});
    const data=await response.json();if(!response.ok)throw Error(data.error||'模型调用失败');
    if(!mounted.current)return;
    const m=data.message as Msg;work.push(m);
    if(!m.tool_calls?.length){complete(work);return;}
    for(const call of m.tool_calls){
     let result;try{
      const args=JSON.parse(call.function.arguments);
      if(call.function.name==='list_preferences'){preferencesRead=true;result={ok:true,message:'已读取偏好',changed:false,devices:state.current,data:prefs.current};}
      else if(call.function.name==='remember_preference'){
       if(event)throw Error('环境事件不能保存偏好');
       if(proposed)throw Error('本轮已提出操作，请下一轮再保存偏好');
       savePreference(prefs.current,args.text);proposed=true;setPendingMemory(args.text);
       const approved=await new Promise<boolean>(resolve=>{approval.current=resolve;});
       if(!mounted.current)return;
       if(Date.now()-started>=DAY)throw Error('保存请求已过期，请重新发出指令');
       if(approved)storePrefs(savePreference(prefs.current,args.text));
       outcome=approved?`已记住：${args.text}`:'已取消，不保存偏好。';
       result={ok:approved,message:outcome,changed:false,devices:state.current};
      }else if(call.function.name==='set_device'||call.function.name==='propose_scene'){
       if(event&&(!devicesRead||!preferencesRead))throw Error('提出建议前先用list_devices和list_preferences读取最新状态与偏好');
       if(proposed)result={ok:false,message:'本轮计划已处理，请等待用户的新指令',changed:false,devices:state.current};
       else {
        const plan=createPlan(state.current,call.function.name==='set_device'?{title:'设备调整',reason:'根据你的指令调整设备，请核对以下操作。',actions:[args]}:args);
        proposed=true;
        setPending(plan);
        const approved=await new Promise<boolean>(resolve=>{approval.current=resolve;});
        if(!mounted.current)return;
        if(Date.now()-started>=DAY)throw Error('计划已过期，请重新发出指令');
        const execution=settlePlan(plan,state.current,approved);
        resultSignals=execution.results.map(r=>deviceSignal(state.current.find(d=>d.id===r.device_id),execution.devices.find(d=>d.id===r.device_id),r.ok));
        result={...execution,data:{results:execution.results,status:plan.status}};
        outcome=execution.results.length?formatOutcome(execution.results,execution.devices):approved?execution.message:'已取消，设备未变动。';
       }
      }else {result=executeDeviceTool(state.current,call.function.name,args);if(call.function.name==='list_devices'&&result.ok)devicesRead=true;}
     }catch(e){result={ok:false,message:e instanceof Error?e.message:'工具参数无效，未执行',changed:false,devices:state.current};}
     if(result.changed){written=true;state.current=result.devices;onDevices(result.devices);}
     work.push({role:'tool',tool_call_id:call.id,content:JSON.stringify({ok:result.ok,message:result.message,data:'data' in result?result.data:undefined})});
    }
    if(outcome){work.push({role:'assistant',content:outcome,signals:resultSignals});complete(work);return;}
    setMessages([...work]);
   }
   throw Error('已达到本轮执行次数上限，停止继续调用。');
  }catch(e){if(event&&!proposed){delete lastEvents.current[event];persistEvents();}setError(`${e instanceof Error?e.message:'对话失败'}${written?' 已执行的设备设置已保留，请在设备页核对。':''}`);history.current=[];}
  finally{running.current=false;setBusy(false);setActiveEvent(null);}
 }
 return <section className="ha-chat" aria-label="Agent 对话"><div className="ha-chat-scroll"><div className="ha-chat-intro"><span>栖居 Agent</span><h2>今天，想让家做些什么？</h2><p>调整设备、安排场景，或告诉我你的偏好。</p></div>
 {configured===false&&<p className="ha-chat-notice">模型尚未连接：需要在本机配置 DeepSeek API Key。设备手动控制仍可使用。</p>}
 <details className="ha-memory ha-events"><summary>体验主动建议</summary><p>模拟环境事件，管家会结合当前设备和偏好提出建议。没有接入真实位置或定时触发。</p><div>{(['arrival','bedtime'] as HomeEvent[]).map(event=><button key={event} disabled={busy||!configured} onClick={()=>triggerEvent(event)}>{eventLabels[event]}</button>)}</div>{eventNotice&&<p role="status">{eventNotice}</p>}</details>
 <details className="ha-memory"><summary>记忆 · 对话保留24小时 · {preferences.length}条偏好</summary><p>对话从每轮开始起保留24小时；明确保存的偏好保留到你修改或删除。偏好用于建议，执行仍需确认。</p>{preferences.length===0&&<p>暂无偏好。可以对我说“记住：睡觉时空调设为26度”。</p>}{preferences.map(p=><form key={p.id+p.text} onSubmit={e=>{e.preventDefault();try{const text=new FormData(e.currentTarget).get('text') as string;storePrefs(savePreference(prefs.current,text,p.id));}catch(e){setError(e instanceof Error?e.message:'保存失败');}}}><input aria-label="偏好内容" name="text" defaultValue={p.text} maxLength={300} disabled={busy}/><button disabled={busy}>保存修改</button><button type="button" disabled={busy} onClick={()=>{try{storePrefs(prefs.current.filter(v=>v.id!==p.id));}catch{setError('删除未保存，请重试');}}}>删除</button></form>)}</details>
 <div className="ha-chat-messages" aria-live="polite">{visibleMessages(messages).map((m,i)=><p key={i} className={`ha-bubble ${m.source==='event'?'event':m.role}`}><small>{m.source==='event'?'环境事件':m.role==='user'?'你':'栖居'}</small>{m.signals?.length?m.content?.split('\n').map((line,j)=><span className="ha-result-line" key={j}><i className={`ha-signal ${m.signals?.[j]||'unchanged'}`} role="img" aria-label={signalLabels[m.signals?.[j]||'unchanged']}/><span>{line}</span></span>):m.content}</p>)}</div>
 {pending&&<section className="ha-plan ha-plan-compact" aria-label="待确认的设备调整计划"><span className="ha-kicker">确认以下调整</span><ul>{pending.actions.map(a=>{const d=pending.before.find(d=>d.id===a.device_id)!;const label=d.kind==='ac'?'温度':d.kind==='curtain'?'开合度':d.kind==='speaker'?'音量':'亮度';return <li key={a.device_id}><strong>{d.name}</strong><span>{a.on!==undefined?(a.on?'打开':'关闭'):''}{a.on!==undefined&&a.value!==undefined?' · ':''}{a.value!==undefined?`${label} ${a.value}${d.kind==='ac'?'°C':'%'}`:''}{!d.online?' · 离线':''}</span></li>;})}</ul><div><button onClick={()=>decide(true)}>确认</button><button onClick={()=>decide(false)}>取消</button></div></section>}
 {activeEvent&&pending&&<p className="ha-event-hint">{activeEvent==='arrival'?'回家建议':'睡眠建议'} · 不确认就不会调整设备</p>}
 {pendingMemory&&<section className="ha-plan ha-plan-compact" aria-label="确认保存偏好"><span className="ha-kicker">记住这个偏好？</span><p>{pendingMemory}</p><div><button onClick={()=>decide(true)}>记住</button><button onClick={()=>decide(false)}>取消</button></div></section>}
 {busy&&!pending&&!pendingMemory&&<p role="status">处理中…</p>}{error&&<p className="ha-chat-notice" role="alert">{error}</p>}
 </div><div className="ha-composer">
 {messages.length===0&&<div className="ha-chat-suggestions">{['准备睡觉','回家了','查看空调'].map(t=><button key={t} disabled={busy||!configured} onClick={()=>send(t)}>{t}</button>)}</div>}
 <form onSubmit={e=>{e.preventDefault();send(input);}}><input aria-label="对管家说的话" value={input} maxLength={2000} disabled={busy} onChange={e=>setInput(e.target.value)} placeholder="例如：把卧室空调调到 25 度"/><button disabled={busy||!configured||!input.trim()} type="submit">{busy?'处理中':'发送'}</button></form>
 <button className="ha-chat-clear" disabled={busy} onClick={()=>{complete([]);setError('');}}>清空对话</button></div>
 </section>;
}
