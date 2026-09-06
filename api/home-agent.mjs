import {agentMiddleware} from '../server/home-agent.mjs';

export default async function handler(req,res) {
 const input=req.body===undefined?req:{
  url:req.url,
  method:req.method,
  async *[Symbol.asyncIterator]() {
   yield typeof req.body==='string'?req.body:JSON.stringify(req.body);
  },
 };
 return agentMiddleware(process.env)(input,res,()=>{
  res.statusCode=404;
  res.end(JSON.stringify({error:'接口不存在'}));
 });
}
