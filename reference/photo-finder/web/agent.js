import{total,won}from'./costs.js';
export const priorities={cost:'가장 저렴하게',speed:'가장 빠르게',ease:'번거로움 없이'};
export function advise(routes,priority='cost',budget=null){
 const cheapest=[...routes].sort((a,b)=>total(a)-total(b))[0];
 const id=priority==='speed'?'domestic':priority==='ease'?'agent':cheapest.id;
 const route=routes.find(r=>r.id===id)||cheapest;
 const delta=total(route)-total(cheapest);
 const reason=priority==='speed'?'더미 배송 시나리오에서 국내 구매가 가장 빠릅니다. 해외 배송과 통관 대기 대신 빠른 수령을 우선했습니다.':priority==='ease'?'더미 시나리오에서 주문·통관 절차를 대행 업체에 맡기는 경로를 골랐습니다. 업체별 업무 범위와 반품 조건은 별도 확인이 필요합니다.':'상품가만 보지 않고 배송비·세금·수수료를 합산했습니다. 더미 견적 세 개 중 최종 부담이 가장 낮은 경로입니다.';
 return{route,reason,tradeoff:delta?`최저 경로보다 ${won(delta)} 더 들지만, ${priority==='speed'?'수령 속도':'구매 편의'}를 우선한 선택입니다.`:'더미 국내 구매 대비 '+won(total(routes.find(r=>r.id==='domestic')||route)-total(route))+' 낮습니다. 대신 해외 배송·통관과 반품 조건을 확인해야 합니다.',budgetNote:budget?(total(route)>budget?`입력 예산 ${won(budget)}보다 ${won(total(route)-budget)} 높습니다. 구매를 서두르기보다 예산 또는 우선순위를 조정해 보세요.`:`입력 예산 ${won(budget)} 안에 들어옵니다. 실제 견적 확인 전에는 구매 가능 금액으로 확정할 수 없습니다.`):null};
}
