import assert from 'node:assert/strict';
import handler from '../api/home-agent.mjs';
const oldKey=process.env.DEEPSEEK_API_KEY;
const oldFetch=globalThis.fetch;
try {
 delete process.env.DEEPSEEK_API_KEY;
 let status,body;
 const res={setHeader(){},set statusCode(v){status=v;},end(v){body=JSON.parse(v);}};
 await handler({url:'/api/home-agent',method:'POST',body:{messages:[]}},res);
 assert.equal(status,503);
 process.env.DEEPSEEK_API_KEY='test-only';
 globalThis.fetch=async (_url,options)=>{
  assert.equal(JSON.parse(options.body).messages.at(-1).content,'你好');
  return new Response(JSON.stringify({choices:[{message:{role:'assistant',content:'你好'}}]}));
 };
 await handler({url:'/api/home-agent',method:'POST',body:{messages:[{role:'user',content:'你好'}]}},res);
 assert.equal(status,200);assert.equal(body.message.content,'你好');
 await handler({url:'/api/home-agent',method:'POST',async *[Symbol.asyncIterator](){yield JSON.stringify({messages:[{role:'user',content:'你好'}]});}},res);
 assert.equal(status,200);
 console.log('通过：线上接口支持已解析请求与原始请求，未配置密钥返回明确错误。');
} finally {
 if(oldKey===undefined)delete process.env.DEEPSEEK_API_KEY;else process.env.DEEPSEEK_API_KEY=oldKey;
 globalThis.fetch=oldFetch;
}
