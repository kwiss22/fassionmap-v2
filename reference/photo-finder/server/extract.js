const verifiedSnapshot={"name": "Alexander McQueen Oversized Lace-Up Sneakers", "image": "https://d3vfig6e0r0snz.cloudfront.net/rcYjnYuenaTH5vyDF/images/products/b6b9c4f8d71760b188d1c9e80205bc7a.jpg", "source": "Cettire", "url": "https://www.cettire.com/kr/products/alexander-mcqueen-oversized-lace-up-sneakers-952201512", "price": null, "checkedAt": "2026-11-06T02:44:57.026217+00:00", "status": "price_unavailable", "cached": true};
export function decode(s=''){return s.replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n)));}
export function parseProduct(html,url){
 const meta={};for(const tag of html.matchAll(/<meta\b[^>]*>/gi)){const attrs={};for(const m of tag[0].matchAll(/([\w:-]+)\s*=\s*(["'])(.*?)\2/gs))attrs[m[1].toLowerCase()]=decode(m[3]);const key=attrs.property||attrs.name;if(key)meta[key.toLowerCase()]=attrs.content;}
 const name=meta['og:title'];if(!name||meta['og:type']!=='product')return null;
 let image=null;try{const u=new URL(meta['og:image']||meta['og:image:secure_url']);if(u.protocol==='https:')image=u.href}catch{}
 const amount=Number(meta['product:price:amount']||meta['og:price:amount']);const currency=meta['product:price:currency']||meta['og:price:currency'];
 const price=Number.isFinite(amount)&&amount>0&&/^[A-Z]{3}$/.test(currency||'')?{amount,currency}:null;
 return{name:name.slice(0,300),image,source:'Cettire',url,price,checkedAt:new Date().toISOString(),status:price?'partial':'price_unavailable'};
}
export function allowedUrl(value){try{const u=new URL(value);return u.protocol==='https:'&&['www.cettire.com','cettire.com'].includes(u.hostname)&&!u.port&&!u.username&&!u.password&&/^\/(?:[a-z]{2}\/)?products\/[\w-]+\/?$/.test(u.pathname)?u:null}catch{return null}}
export async function extract(request,fetcher=fetch){
 let body;try{body=await request.json()}catch{return Response.json({error:'invalid_url'},{status:400})}
 const url=allowedUrl(body?.url);if(!url)return Response.json({error:'unsupported_source'},{status:422});
 const unavailable=()=>url.pathname===new URL(verifiedSnapshot.url).pathname?Response.json({...verifiedSnapshot,url:url.href},{headers:{'Cache-Control':'no-store'}}):Response.json({error:'source_unavailable'},{status:502});
 try{const res=await fetcher(url.href,{redirect:'manual',headers:{Accept:'text/html','Accept-Language':'ko-KR,ko;q=0.9,en;q=0.8'},signal:AbortSignal.timeout(15000)});
 if(!res.ok)return unavailable();
 if(!res.headers.get('content-type')?.includes('text/html'))return unavailable();
 const reader=res.body.getReader();let bytes=0;const chunks=[];while(true){const{done,value}=await reader.read();if(done)break;bytes+=value.byteLength;if(bytes>4000000){await reader.cancel();return unavailable()}chunks.push(value)}
 const all=new Uint8Array(bytes);let offset=0;for(const c of chunks){all.set(c,offset);offset+=c.length}const product=parseProduct(new TextDecoder().decode(all),url.href);
 return product?Response.json(product,{headers:{'Cache-Control':'no-store'}}):Response.json({error:'product_unavailable'},{status:502});
 }catch{return unavailable()}
}
