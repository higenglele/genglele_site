// Run against a disposable Chrome profile with --remote-debugging-port=9454.
// INBOX_TEST_URL optionally targets a production preview or the case page.
import assert from 'node:assert/strict';
const pages=await(await fetch('http://127.0.0.1:9454/json')).json();
const ws=new WebSocket(pages.find(p=>p.type==='page').webSocketDebuggerUrl);
await new Promise(r=>ws.onopen=r);
let seq=0;const pending=new Map();
ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}};
const call=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
const ev=async expression=>{const r=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
const wait=async expression=>{for(let i=0;i<60;i++){if(await ev(expression))return;await new Promise(r=>setTimeout(r,100));}throw Error('Timeout '+expression);};
const url=process.env.INBOX_TEST_URL||'http://127.0.0.1:5187/assets/demos/social-hub/dashboard-demo.html#inbox';
const results=[];
const check=(name,fn)=>{try{fn();results.push({name,passed:true});}catch(e){results.push({name,passed:false,error:e.message});}};
try{
await call('Emulation.setDeviceMetricsOverride',{width:1280,height:800,deviceScaleFactor:1,mobile:false});
await call('Page.navigate',{url:'about:blank'});await wait(`location.href==='about:blank'`);
await call('Page.navigate',{url});
if(new URL(url).pathname.endsWith('/index.html')){await wait(`!!document.querySelector('#demo-frame')?.contentDocument.querySelector('[data-view="inbox"]')`);await ev(`document.querySelector('#demo-frame').contentDocument.querySelector('[data-view="inbox"]').click()`);}
await wait(`!!(document.querySelector('#demo-frame')?.contentDocument||document).querySelector('[data-conversation]')`);
await ev(`window.testDoc=document.querySelector('#demo-frame')?.contentDocument||document;window.testWin=testDoc.defaultView;void 0`);
const before=await ev(`(()=>{const list=testDoc.querySelector('.conversation-list');list.scrollTop=360;testWin.scrollTo(0,130);return {list:list.scrollTop,page:testWin.scrollY,unread:parseInt(testDoc.querySelector('.unread-pill').textContent)};})()`);
assert(before.list>0,'test must start below first screen');
await ev(`testDoc.querySelector('[data-conversation="conversation-5"]').click()`);
const after=await ev(`({list:testDoc.querySelector('.conversation-list').scrollTop,page:testWin.scrollY,toast:testDoc.querySelector('#account-toast').textContent,focus:testDoc.activeElement.id,selected:testDoc.querySelector('.conversation.active').dataset.conversation,unread:parseInt(testDoc.querySelector('.unread-pill').textContent)})`);
check('Opening a conversation is silent',()=>assert.equal(after.toast,''));
check('Conversation list retains scroll offset',()=>assert.equal(after.list,before.list));
check('Opening does not move the page',()=>assert.equal(after.page,before.page));
check('Opening does not focus the reply editor',()=>assert.notEqual(after.focus,'reply-body'));
check('Correct conversation selected',()=>assert.equal(after.selected,'conversation-5'));
await ev(`testDoc.querySelector('[data-conversation="conversation-6"]').click()`);
const repeated=await ev(`({list:testDoc.querySelector('.conversation-list').scrollTop,toast:testDoc.querySelector('#account-toast').textContent})`);
check('Switching again preserves position and stays silent',()=>assert.deepEqual(repeated,{list:before.list,toast:''}));
// Desktop reply must preserve the list as well as opening a conversation.
await ev(`(()=>{const input=testDoc.querySelector('#reply-body');input.value='滚动回归验证';input.dispatchEvent(new Event('input',{bubbles:true}));testDoc.querySelector('#reply-form').requestSubmit();})()`);
const replied=await ev(`({list:testDoc.querySelector('.conversation-list').scrollTop,body:testDoc.querySelector('.messages').textContent})`);
check('Reply remains in current thread without list jumping',()=>{assert.equal(replied.list,before.list);assert(replied.body.includes('滚动回归验证'));});
const readBefore=await ev(`(()=>{const target=testDoc.querySelector('.conversation .unread-dot')?.closest('button')||testDoc.querySelector('[data-conversation]');return {id:target.dataset.conversation,unread:!!target.querySelector('.unread-dot'),count:parseInt(testDoc.querySelector('.unread-pill').textContent)};})()`);
await ev(`testDoc.querySelector('[data-conversation="${readBefore.id}"]').click()`);
const readAfter=await ev(`parseInt(testDoc.querySelector('.unread-pill').textContent)`);
check('Opening updates unread count correctly',()=>assert.equal(readAfter,readBefore.count-Number(readBefore.unread)));
await ev(`testDoc.querySelector('[data-conversation="${readBefore.id}"]').click()`);
const readAgain=await ev(`parseInt(testDoc.querySelector('.unread-pill').textContent)`);
check('Reopening does not decrement unread count again',()=>assert.equal(readAgain,readAfter));
// A fresh navigation returns to the list; no storage reset or deletion is needed.
await call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:false});
await call('Page.navigate',{url:'about:blank'});await wait(`location.href==='about:blank'`);
await call('Page.navigate',{url:new URL('dashboard-demo.html#inbox',url).href});
await wait(`!!document.querySelector('[data-conversation]')`);
await ev(`document.querySelector('[data-conversation="conversation-9"]').scrollIntoView({block:'center'})`);
const mobileY=await ev('scrollY');
await ev(`document.querySelector('[data-conversation="conversation-9"]').click()`);
const mobileFocus=await ev('document.activeElement.id');
check('Mobile opens without focusing keyboard',()=>assert.notEqual(mobileFocus,'reply-body'));
await ev(`document.querySelector('#back-conversations').click()`);
const returnedY=await ev('scrollY');
check('Mobile back returns to original list position',()=>assert.equal(returnedY,mobileY));
console.log(JSON.stringify(results,null,2));if(results.some(r=>!r.passed))process.exitCode=1;
}finally{ws.close();}
