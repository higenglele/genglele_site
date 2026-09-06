// Run against a disposable Chrome profile with --remote-debugging-port=9454.
// INBOX_TEST_URL optionally targets a production preview or the case page.
import assert from 'node:assert/strict';
const pages=await(await fetch('http://127.0.0.1:9454/json')).json();
const ws=new WebSocket(pages.find(p=>p.type==='page').webSocketDebuggerUrl);
await new Promise(r=>ws.onopen=r);
let seq=0;const pending=new Map();
ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}};
const call=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
const ev=async expression=>{const r=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true,userGesture:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
const wait=async expression=>{for(let i=0;i<60;i++){if(await ev(expression))return;await new Promise(r=>setTimeout(r,100));}throw Error('Timeout '+expression);};
const url=process.env.PROJECT_TEST_URL||'http://127.0.0.1:5187/#works';
try {
  await call('Page.navigate',{url:'about:blank'});
  await wait(`location.href==='about:blank'`);
  await call('Page.navigate',{url});
  await wait(`document.querySelectorAll('.project-hover-card a').length===3`);
  const links=await ev(`Array.from(document.querySelectorAll('.project-hover-card a'),a=>({href:a.href,target:a.target,rel:a.rel}))`);
  const failures=[];
  for(const [i,link] of links.entries()){
    if(link.target!=='_blank') failures.push(`Project ${i+1} should open a new tab`);
    assert(link.rel.includes('noopener'));
  }
  assert(links[1].href.endsWith('/#home-product'));
  await ev(`document.querySelector('.project-hover-card a').focus({preventScroll:true})`);
  await new Promise(r=>setTimeout(r,350));
  const shadow=await ev(`getComputedStyle(document.querySelector('.project-hover-card')).boxShadow`);
  if(shadow.includes('232, 154, 98')) failures.push('Focused card should not have the yellow ring');
  assert.deepEqual(failures,[]);
  const originalURL=await ev('location.href');
  const existing=new Set((await call('Target.getTargets')).targetInfos.map(t=>t.targetId));
  await ev(`document.querySelectorAll('.project-hover-card a')[1].click()`);
  let opened;
  for(let i=0;i<30;i++){
    opened=(await call('Target.getTargets')).targetInfos.find(t=>!existing.has(t.targetId)&&t.url===links[1].href);
    if(opened)break;
    await new Promise(r=>setTimeout(r,100));
  }
  assert(opened,'Project 2 must actually open its product page in another tab');
  assert.equal(await ev('location.href'),originalURL,'Original homepage must remain unchanged');
  await call('Target.closeTarget',{targetId:opened.targetId});
  console.log('PASS: all three project links open new tabs; focused project card has no yellow ring.');
} finally {ws.close();}
