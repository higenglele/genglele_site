import assert from 'node:assert/strict';
import {agentMiddleware} from '../server/home-agent.mjs';
const originalFetch=globalThis.fetch;
async function invoke(messages,config={}){
 let result,status;
 const req={url:'/api/home-agent',method:'POST',async *[Symbol.asyncIterator](){yield JSON.stringify({messages});}};
 const res={setHeader(){},set statusCode(v){status=v},end(v){result=JSON.parse(v);}};
 await agentMiddleware({DEEPSEEK_API_KEY:'test-only',...config})(req,res,()=>{});
 return {status,...result};
}
try {
 let sent;
 globalThis.fetch=async(url,options)=>{assert.equal(url,'https://api.deepseek.com/chat/completions');sent=JSON.parse(options.body);return new Response(JSON.stringify({choices:[{message:{role:'assistant',content:'已读取'}}]}));};
 await invoke([{role:'user',content:'查询空调'},{role:'assistant',content:null,reasoning_content:'',tool_calls:[{id:'call_1',type:'function',function:{name:'list_devices',arguments:'{}'}}]},{role:'tool',tool_call_id:'call_1',content:'[]'}]);
 assert.equal(sent.messages[2].reasoning_content,'','必须保留空 reasoning_content');
 assert.equal(sent.thinking.type,'disabled','单设备模式显式关闭思考');
 assert.equal(sent.model,'deepseek-v4-flash');
 assert.ok(sent.tools.some(t=>t.function.name==='propose_scene'),'必须提供场景提案工具');
 assert.ok(sent.messages[0].content.includes('确认'),'必须告知模型确认执行约束');
 assert.equal(sent.messages[3].tool_call_id,'call_1');
 await invoke([{role:'user',content:'查询'}],{DEEPSEEK_THINKING:'enabled'});
 assert.equal(sent.thinking.type,'enabled');
 globalThis.fetch=async()=>new Response(JSON.stringify({error:{code:'invalid_request_error',message:'test'}}),{status:400});
 const bad=await invoke([{role:'user',content:'x'}]);assert.equal(bad.upstream_status,400);assert.equal(bad.code,'invalid_request_error');
 globalThis.fetch=async()=>{throw new TypeError('fetch failed',{cause:{code:'ECONNRESET'}})};
 const failed=await invoke([{role:'user',content:'x'}]);assert.equal(failed.code,'ECONNRESET');assert.ok(!failed.error.includes('本机网络'));
 console.log('通过：DeepSeek 请求格式、思考开关、工具历史、API 与传输错误区分。');
}finally{globalThis.fetch=originalFetch;}
