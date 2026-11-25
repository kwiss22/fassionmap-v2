export const exchangeRate=1480;
export const routes=[{id:'direct',name:'해외 직접 구매',sub:'브랜드 공식몰 · 예시',item:850*exchangeRate,shipping:35*exchangeRate,tax:84000,fee:0},{id:'domestic',name:'국내 구매',sub:'국내 편집숍 · 예시',item:1550000,shipping:0,tax:0,fee:0},{id:'agent',name:'구매대행',sub:'구매대행 서비스 · 예시',item:850*exchangeRate,shipping:45000,tax:84000,fee:65000}];
export const total=r=>r.item+r.shipping+r.tax+r.fee;
export const won=n=>new Intl.NumberFormat('ko-KR').format(n)+'원';
export function validProductUrl(value){try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)&&u.hostname.includes('.')&&!u.username&&!u.password}catch{return false}}

// Illustrative sneaker quotes only; never seller-verified prices.
export const sneakerRoutes=[
{id:'direct',name:'해외 직접 구매',sub:'Cettire · 더미 견적',item:485000,shipping:30000,tax:65000,fee:0,delivery:'5–10영업일 · 더미 예상'},
{id:'domestic',name:'국내 구매',sub:'국내 편집숍 · 더미 견적',item:729000,shipping:0,tax:0,fee:0,delivery:'2–3영업일 · 더미 예상'},
{id:'agent',name:'구매대행',sub:'구매대행 서비스 · 더미 견적',item:485000,shipping:25000,tax:65000,fee:45000,delivery:'7–14영업일 · 더미 예상'}];
