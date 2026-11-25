// Local-only adapter. Build first; credentials stay in process.env.
import {createServer} from 'node:http';
import {Readable} from 'node:stream';
import worker from '../dist/server/index.js';
const port=Number(process.env.PHOTO_FINDER_PORT||4173);
createServer(async(req,res)=>{try{const request=new Request('http://localhost:'+port+req.url,{method:req.method,headers:req.headers,...(!['GET','HEAD'].includes(req.method)?{body:Readable.toWeb(req),duplex:'half'}:{})});const response=await worker.fetch(request,process.env);res.writeHead(response.status,Object.fromEntries(response.headers));if(response.body)Readable.fromWeb(response.body).pipe(res);else res.end()}catch{res.writeHead(500);res.end('Local server error')}}).listen(port,'127.0.0.1',()=>console.log('Photo Finder reference: http://localhost:'+port));
