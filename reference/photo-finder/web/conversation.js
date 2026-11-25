import {total,won,sneakerRoutes} from './costs.js';
export const demoQuotes=sneakerRoutes.map(r=>({...r,days:{direct:10,domestic:3,agent:14}[r.id]}));
export const emptyConditions=()=>({budget:null,size:null,color:null,days:null,priority:'cost',returns:false});
export function understand(text,previous=emptyConditions()){
 const c={...previous},changes=[];const t=text.replace(/,/g,'').trim();
 if(/예산\s*(해제|없|제한\s*없)|가격\s*상관없/.test(t)){c.budget=null;c.flexibleBudget=true;changes.push('budget')}
 else{const m=t.match(/(\d+(?:\.\d+)?)\s*만\s*원?|(\d{4,9})\s*원/);if(m){const n=m[1]?Number(m[1])*10000:Number(m[2]);if(n>0&&n<=100000000){c.budget=n;delete c.flexibleBudget;changes.push('budget')}}}
 if(/기한\s*(없|해제)|급하지\s*않|천천히/.test(t)){c.days=null;c.flexibleDeadline=true;changes.push('days')}
 else{const m=t.match(/(\d{1,2})\s*(일|주)\s*(이내|안|내|뒤|후)?/);if(m){c.days=Number(m[1])*(m[2]==='주'?7:1);delete c.flexibleDeadline;changes.push('days')}else if(/다음\s*주|일주일/.test(t)){c.days=7;delete c.flexibleDeadline;changes.push('days')}else if(/내일/.test(t)){c.days=1;delete c.flexibleDeadline;changes.push('days')}}
 const mm=t.match(/(?<!\d)(?:사이즈\s*)?(2\d{2}|3[0-2]\d)(?!\d)\s*(?:mm|밀리|사이즈)?/i);const eu=t.match(/(?:EU\s*|사이즈\s*)([3-4]\d(?:\.5)?)/i);if(mm){c.size=mm[1]+'mm';changes.push('size')}else if(eu){c.size='EU '+eu[1];changes.push('size')}
 for(const[color,re]of [['블랙',/검정|검은|블랙|black/i],['화이트',/흰색|흰\s*|화이트|white/i],['베이지',/베이지|beige/i],['브라운',/브라운|갈색|brown/i]])if(re.test(t)){c.color=color;changes.push('color');break}
 if(/가장\s*빠|빨리|빠르게|속도\s*우선/.test(t)){c.priority='speed';changes.push('priority')}
 if(/저렴|최저|싼|가격\s*우선|싸게/.test(t)){c.priority='cost';changes.push('priority')}
 if(/번거로움\s*없이|대행|편하게|편의\s*우선/.test(t)){c.priority='ease';changes.push('priority')}
 if(/반품/.test(t)){c.returns=true;changes.push('returns')}
 const intent=/저장|기억/.test(t)?'save':/왜|이유|근거/.test(t)?'why':/다른\s*색|다른\s*판매|더\s*찾|재고|검색|비슷/.test(t)?'search':/사이즈.*(추천|골라|어떻게)|발볼/.test(t)?'sizing':changes.length?'update':'unknown';
 return{conditions:c,changes:[...new Set(changes)],intent};
}
export function recommend(c,quotes=demoQuotes){
 const ranked=quotes.map(r=>({...r,overBudget:c.budget!==null&&total(r)>c.budget,tooSlow:c.days!==null&&r.days>c.days}));
 const eligible=ranked.filter(r=>!r.overBudget&&!r.tooSlow&&!c.returns);
 const pool=eligible.length?eligible:ranked;
 const preferred=c.priority==='ease'?'agent':null;
 const sorted=[...pool].sort((a,b)=>c.priority==='speed'?a.days-b.days:preferred?(Number(b.id===preferred)-Number(a.id===preferred)||total(a)-total(b)):total(a)-total(b));
 const route=sorted[0],cheapest=Math.min(...quotes.map(total));
 const reason=!eligible.length?(c.returns?'실제 반품 정책을 확인하지 못해 반품 조건에 맞는 경로를 추천할 수 없습니다.':'입력 조건을 모두 만족하는 더미 견적이 없습니다.')+' 구매를 권하지 않고, 아래 경로는 조건 조정을 위한 참고로만 보여드립니다.':c.priority==='speed'?`조건을 만족하는 후보 중 더미 예상 기간이 가장 짧은 ${route.name}를 골랐습니다.`:c.priority==='ease'?`${route.id==='agent'?'주문·통관 절차를 대행하는 시나리오':'구매대행이 입력 조건을 충족하지 못해 가능한 대안'}를 기준으로 골랐습니다.`:`배송비·예시 세금·수수료를 모두 더한 뒤, 조건을 만족하는 후보 중 ${route.name}가 가장 저렴합니다.`;
 const extra=total(route)-cheapest;
 return{route,ranked,eligible,feasible:eligible.length>0,reason,tradeoff:extra?`더미 최저가보다 ${won(extra)} 높습니다. ${route.id==='domestic'?'빠른 수령': '구매 편의'}를 위한 차이입니다.`:'더미 최저 총비용입니다. 대신 해외 배송·통관·반송 비용을 확인해야 합니다.',warnings:[...(c.size?[`${c.size} 옵션과 재고는 미확인입니다.`]:['사이즈와 옵션별 재고가 미확인입니다.']),...(c.color?[`${c.color} 요청은 기록했지만 해당 색상 판매 여부는 미확인입니다.`]:[]),'반품 조건·정품 여부·실제 도착일은 검증하지 않았습니다.']};
}
export function nextQuestion(c){if(!c.size)return'먼저 원하시는 사이즈가 있나요? 예를 들어 “270mm”라고 알려주세요. 아직 모르시면 예산부터 알려주셔도 좋아요.';if(c.budget===null&&!c.flexibleBudget)return'사이즈를 기록했어요. 한국 도착 총비용 기준으로 예산은 얼마인가요? “70만 원 이내”처럼 알려주세요.';if(c.days===null&&!c.flexibleDeadline)return'언제까지 받으셔야 하나요? “7일 이내” 또는 “급하지 않아요”라고 알려주세요. 데모에서는 입력 일수를 가상의 비교 기한으로 사용합니다.';return'조건을 반영했어요. 예산·배송 기한·색상을 바꾸거나, 다른 구매 우선순위를 말씀해 주세요.'}
