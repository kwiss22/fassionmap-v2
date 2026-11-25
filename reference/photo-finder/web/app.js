import {startStylist,cancelStylist,restoreStylist} from './stylist-ui.js';
import {total,won,validProductUrl} from './costs.js';
import {demoQuotes,emptyConditions,understand,recommend,nextQuestion} from './conversation.js';
const $=s=>document.querySelector(s);
const sampleUrl='https://www.cettire.com/kr/products/alexander-mcqueen-oversized-lace-up-sneakers-952201512';
const sampleImage='https://d3vfig6e0r0snz.cloudfront.net/rcYjnYuenaTH5vyDF/images/products/b6b9c4f8d71760b188d1c9e80205bc7a.jpg';
let session=null,selected='direct',ready=false,lookupVersion=0;
const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n};
function external(url,text){const a=el('a','text-link',text);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a}
function readSaved(){try{const s=JSON.parse(localStorage.getItem('fashionmap-plan-v2'));if(s?.version===2&&validProductUrl(s.url)&&Array.isArray(s.messages)&&s.conditions&&s.messages.every(m=>['agent','user'].includes(m.role)&&typeof m.text==='string'))return s}catch{}return null}
function syncSaved(){const s=readSaved();$('#save-count').textContent=s?'1':'0';try{if(localStorage.getItem('fashionmap-ai-result'))$('#save-count').textContent='1'}catch{}$('#save').textContent='구매 플랜 저장';}
syncSaved();
function showHome(){cancelStylist();lookupVersion++;$('#results').hidden=true;$('#home').hidden=false;$('.intro-strip').hidden=false;$('#guide').hidden=true;window.scrollTo({top:0,behavior:'smooth'})}
$('#back').onclick=showHome;
document.querySelectorAll('.logo').forEach(a=>a.onclick=e=>{e.preventDefault();showHome()});
function start(url,restored=null){
 cancelStylist();lookupVersion++;const known=['www.cettire.com','cettire.com'].includes(new URL(url).hostname)&&new URL(url).pathname.includes('alexander-mcqueen-oversized-lace-up-sneakers-952201512');
 session=restored||{version:2,url,known,conditions:emptyConditions(),messages:[]};ready=restored?!!restored.ready:false;selected=restored?.selected||'direct';
 $('#results').hidden=false;$('#home').hidden=true;$('.intro-strip').hidden=true;$('#guide').hidden=true;
 $('.demo-note').textContent='DEMO · 상품 가격·배송비·세금·배송 기간·추천은 가상 시나리오입니다. 실제 판매 견적·재고·도착일을 보장하지 않습니다.';
 $('.comparison').className='workspace comparison';$('.comparison').innerHTML=`<div class="shopping-board"><article class="product"></article><section class="candidate-section" aria-labelledby="candidates-title"><div class="section-heading"><div><p class="eyebrow">YOUR SHORTLIST</p><h2 id="candidates-title">구매 후보</h2></div><span>더미 견적 3개</span></div><div id="conditions"></div><p id="candidate-status" class="muted" role="status"></p><fieldset><legend class="sr-only">구매 경로 선택</legend><div id="route-list"></div></fieldset><p class="source-disclosure">견적 출처: FashionMap 데모 시나리오. 가격과 배송 기간은 실제 판매처에서 수집한 정보가 아닙니다.</p></section></div><section class="conversation" aria-labelledby="conversation-title"><div class="conversation-heading"><span class="agent-orb" aria-hidden="true">✳</span><div><h2 id="conversation-title">함께 고르는 구매 경로</h2><p>FashionMap Agent <span>· DEMO</span></p></div><button id="reset-chat" aria-label="현재 상품으로 대화 새로 시작">↻</button></div><div id="chat-log" role="log" aria-live="polite" aria-relevant="additions" tabindex="0" aria-label="구매 상담 대화"></div><div id="conversation-suggestions" aria-label="추천 질문"></div><form id="chat-form"><label class="sr-only" for="chat-input">에이전트에게 구매 조건 말하기</label><div class="composer"><textarea id="chat-input" rows="2" maxlength="500" placeholder="예: 270mm, 70만 원 이내로 7일 안에 받고 싶어"></textarea><button type="submit" aria-label="메시지 보내기">↑</button></div><p id="chat-error" role="status"></p></form><p class="conversation-disclosure">규칙 기반 대화 데모 · 지원: 사이즈, 색상, 원화 예산, 일수, 우선순위. 실제 AI 검색·알림·자동 구매는 미연결입니다.</p></section>`;
 $('.sticky').innerHTML='<div><small id="selected-label">조건을 알려주세요</small><strong id="selected-total">구매 플랜 준비 중</strong></div><button class="primary" id="plan-action">조건 입력하기 →</button>';
 renderProduct();
 if(!restored){addMessage('agent',known?'알렉산더 맥퀸 Oversized 스니커즈를 함께 살펴볼게요. 상품명·이미지는 이전 Cettire 조회 자료이고, 견적은 더미 데이터로 비교합니다.\n\n'+nextQuestion(session.conditions):'입력하신 링크로 구매 상담 데모를 시작할게요. 이 상품은 아직 식별하지 못해 이미지와 견적을 예시로 보여드립니다.\n\n'+nextQuestion(session.conditions));}else renderMessages();
 renderCandidates();renderSuggestions();renderRecommendation(false);
 $('#chat-form').onsubmit=e=>{e.preventDefault();send($('#chat-input').value)};
 $('#chat-input').onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();send(e.currentTarget.value)}};
 $('#reset-chat').onclick=()=>start(session.url);
 $('#route-list').onchange=e=>{if(e.target.name!=='route')return;selected=e.target.value;renderCandidates();renderSticky();$('#candidate-status').textContent='직접 선택한 경로입니다. 추천과 다른 후보도 살펴볼 수 있어요.'};
 $('#plan-action').onclick=()=>{if(ready)savePlan();else{$('#chat-input').focus();$('.conversation').scrollIntoView({behavior:'smooth',block:'start'})}};
 $('#save').disabled=false;$('#save').onclick=savePlan;
 $('#results').scrollIntoView({behavior:'smooth',block:'start'});
}
function renderProduct(){
 const p=$('.product');p.replaceChildren();
 const box=el('div','product-image');const img=el('img');img.src=session.known?sampleImage:'assets/coat.jpg';img.alt=session.known?'Alexander McQueen Oversized Lace-Up Sneakers':'시연용 패션 이미지 · 실제 입력 상품과 다름';img.referrerPolicy='no-referrer';img.onerror=()=>{box.replaceChildren(el('p','muted','상품 이미지 로드 실패 · 원본 페이지를 확인해 주세요.'))};box.append(img,el('span','',session.known?'PREVIOUSLY IDENTIFIED':'ILLUSTRATIVE IMAGE'));
 const info=el('div','product-information');info.append(el('p','eyebrow',session.known?'ALEXANDER MCQUEEN':'YOUR PRODUCT / DEMO'),el('h2','',session.known?'Oversized Lace-Up Sneakers':'입력하신 상품 · 상담 데모'),el('p','muted',session.known?'Cettire · 이전 조회 상품 정보 / 현재 옵션·재고 미확인':'실제 상품명·이미지는 추출되지 않았습니다.'));
 info.append(external(session.url,'원본 상품 페이지 ↗'));
 const refresh=el('button','refresh-source','판매처 정보 다시 확인 ↻');refresh.onclick=refreshSource;info.append(refresh,el('p','muted source-status','실시간 확인 전 · 가격 비교는 더미 견적입니다.'));p.append(box,info);
}
async function refreshSource(){const version=++lookupVersion,url=session.url;const b=$('.refresh-source'),status=$('.source-status');b.disabled=true;status.textContent='판매처에 상품 정보를 요청하고 있습니다…';try{const response=await fetch('/api/extract',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url}),signal:AbortSignal.timeout(20000)});const data=await response.json();if(version!==lookupVersion)return;if(!response.ok){status.textContent=data.error==='unsupported_source'?'실시간 조회는 현재 Cettire 상품 링크만 지원합니다.':'조회 실패 · 판매처 응답 지연 또는 접근 제한입니다. 다시 시도할 수 있습니다.';return}if(data.name)$('.product h2').textContent=data.name;status.textContent=(data.cached?'실시간 접근 제한 · 이전 조회 자료':'판매처 상품 정보 확인')+' / '+new Date(data.checkedAt).toLocaleString('ko-KR')+' · 비교 금액은 계속 더미 데이터입니다.';}catch{if(version===lookupVersion)status.textContent='조회하지 못했습니다. 판매처에서 직접 확인하거나 다시 시도해 주세요.'}finally{if(version===lookupVersion)b.disabled=false}}
function addMessage(role,text){session.messages.push({role,text});if(session.messages.length>80)session.messages=session.messages.slice(-80);renderMessages()}
function renderMessages(){const log=$('#chat-log');log.replaceChildren();for(const m of session.messages){const bubble=el('div','message '+m.role);bubble.append(el('span','message-author',m.role==='agent'?'FASHIONMAP':'YOU'),el('p','',m.text));log.append(bubble)}log.scrollTop=log.scrollHeight;}
function renderSuggestions(){const c=session.conditions;const suggestions=!ready?[!c.size?'270mm':'블랙으로',!c.budget?'70만 원 이내로':'예산 75만 원으로',!c.days?'7일 이내로':'급하지 않아요','조건 없이 먼저 비교해줘']:['가장 저렴하게','가장 빠르게','번거로움 없이','반품이 걱정돼요','이 조건으로 저장해줘'];const target=$('#conversation-suggestions');target.replaceChildren();for(const text of suggestions){const b=el('button','',text);b.type='button';b.onclick=()=>send(text);target.append(b)}}
function conditionLabels(c){return[...(c.size?[['size',c.size]]:[]),...(c.color?[['color',c.color]]:[]),...(c.budget?[['budget',won(c.budget)+' 이내']]:[]),...(c.days?[['days',c.days+'일 이내 · 데모']]:[]),...(c.returns?[['returns','반품 조건 중요']]:[])];}
function renderCandidates(){
 const result=recommend(session.conditions);const conditions=$('#conditions');conditions.replaceChildren();for(const[key,label]of conditionLabels(session.conditions)){const b=el('button','condition-chip',label+' ×');b.setAttribute('aria-label',label+' 조건 해제');b.onclick=()=>{session.conditions[key]=key==='returns'?false:null;ready=true;const r=recommend(session.conditions);selected=r.route.id;addMessage('agent',label+' 조건을 해제했어요.\n'+r.reason);renderCandidates();renderRecommendation();renderSuggestions()};conditions.append(b)}
 $('#candidate-status').textContent=!ready?'아직 조건을 확인 중입니다. 예시 후보를 먼저 살펴보셔도 좋아요.':result.feasible?'입력 조건을 더미 견적에 적용했습니다. 옵션·재고는 별도 확인이 필요합니다.':'조건에 맞는 더미 후보가 없습니다. 예산이나 기한을 조정해 주세요.';
 const list=$('#route-list');list.replaceChildren();const sorted=[...result.ranked].sort((a,b)=>Number(b.id===result.route.id)-Number(a.id===result.route.id));
 for(const r of sorted){const article=el('article','route '+(r.id===selected?'selected':''));const label=el('label');const radio=el('input');radio.type='radio';radio.name='route';radio.value=r.id;radio.checked=r.id===selected;const names=el('span','route-title',r.name);names.append(el('span','route-sub',r.sub));label.append(radio,names,el('span','route-price',won(total(r))));article.append(label);
 if(ready&&result.feasible&&r.id===result.route.id)article.append(el('span','agent-recommended','현재 조건에 맞는 추천 · DEMO'));
 if(ready&&(r.overBudget||r.tooSlow))article.append(el('p','constraint-warning',[r.overBudget?'예산 초과':null,r.tooSlow?'요청 기한 초과':null].filter(Boolean).join(' · ')));
 article.append(el('p','delivery','더미 예상 기간: '+r.days+'일 이내 · 실제 도착일 미확인'));
 const details=el('details');details.append(el('summary','','더미 비용 상세'));const costs=el('div','costs');for(const[name,amount]of [['상품가',r.item],['배송비',r.shipping],['예시 세금',r.tax],['대행 수수료',r.fee],['더미 총비용',total(r)]])costs.append(el('span','',name),el('span','',won(amount)));details.append(costs);article.append(details);list.append(article)}renderSticky();
}
function renderRecommendation(scroll=true){
 $('#plan-recommendation')?.remove();if(!ready){renderSticky();return}const r=recommend(session.conditions),card=el('article','plan-recommendation');card.id='plan-recommendation';card.setAttribute('aria-label','현재 구매 추천');card.append(el('p','eyebrow',(!session.conditions.size||session.conditions.budget===null&&!session.conditions.flexibleBudget?'PROVISIONAL PLAN · 임시 추천':'YOUR BUYING PLAN')+' · DEMO'),el('h3','',r.feasible?r.route.name+'를 먼저 살펴보세요':'지금 조건으로는 구매를 권하지 않아요'),el('strong','recommendation-total',r.feasible?won(total(r.route)):'조건 조정 필요'),el('p','',r.reason));if(r.feasible)card.append(el('p','tradeoff',r.tradeoff));const warnings=el('ul','recommendation-warnings');for(const warning of r.warnings)warnings.append(el('li','',warning));card.append(warnings);const label=el('small','','견적 출처: FashionMap 가상 시나리오 · 실시간 검색 결과 아님');card.append(label);$('#chat-log').append(card);if(scroll)$('#chat-log').scrollTop=$('#chat-log').scrollHeight;renderSticky();
}
function renderSticky(){if(!$('#selected-total'))return;const r=demoQuotes.find(r=>r.id===selected)||demoQuotes[0];$('#selected-label').textContent=ready?'선택: '+r.name+' · 더미 총비용':'내 조건에 맞는 구매 경로 찾기';$('#selected-total').textContent=ready?won(total(r)):'에이전트와 조건을 맞춰보세요';$('#plan-action').textContent=ready?'구매 플랜 저장 ♡':'조건 입력하기 →';}
function send(raw){
 const text=raw.trim();if(!text){$('#chat-error').textContent='구매 조건이나 질문을 입력해 주세요.';return}if(text.length>500){$('#chat-error').textContent='메시지는 500자 이내로 입력해 주세요.';return}$('#chat-error').textContent='';$('#chat-input').value='';addMessage('user',text);
 const urlMatch=text.match(/https?:\/\/\S+/);if(urlMatch){if(validProductUrl(urlMatch[0])){start(urlMatch[0]);return}}
 const parsed=understand(text,session.conditions);session.conditions=parsed.conditions;
 if(parsed.intent==='save'){savePlan();renderRecommendation();return}
 const hasCondition=parsed.changes.length>0,skip=/먼저\s*비교|조건\s*없이|모르겠|건너/.test(text);
 if(hasCondition||skip)ready=true;
 const result=recommend(session.conditions);if(hasCondition||skip)selected=result.route.id;
 let response;
 if(parsed.intent==='why')response=result.reason+'\n'+result.tradeoff;
 else if(parsed.intent==='search')response='다른 판매처·색상·유사 상품을 실제로 검색하는 기능은 아직 연결되지 않았어요. 현재는 세 가지 더미 견적만 비교할 수 있습니다. 색상을 말씀해 주시면 요청 조건으로 기록하되 재고를 찾았다고 표시하지 않겠습니다.';
 else if(parsed.intent==='sizing')response='이 상품의 공식 실측과 사이즈별 재고는 확인하지 못했습니다. 평소 착용 사이즈는 조건으로 기록할 수 있지만, 맞는 사이즈를 확정 추천할 수는 없어요. 원본 판매처의 사이즈표와 반품 조건을 함께 확인해 주세요.';
 else if(session.conditions.returns&&parsed.changes.includes('returns'))response='반품을 중요한 조건으로 기록했어요. 다만 실제 반품 기한·국가·반송 운임이 확인되지 않아 “반품이 쉬운 판매처”로 확정 추천할 수 없습니다. 현재 비용 추천은 참고로만 봐주세요.';
 else if(hasCondition){response='기록한 조건: '+conditionLabels(session.conditions).map(x=>x[1]).join(' · ')+'.\n'+result.reason+'\n\n'+nextQuestion(session.conditions);}
 else if(skip)response='좋아요. 조건을 확정하지 않은 기본 비교입니다. 더미 총비용이 가장 낮은 경로부터 보여드릴게요. 나중에 사이즈·예산·기한을 바꾸실 수 있어요.';
 else response='이 데모는 아직 자유로운 AI 대화를 지원하지 않아요. 사이즈(270mm), 색상(블랙), 예산(70만 원), 기한(7일 이내), 구매 우선순위를 이해할 수 있습니다. 이 중 어떤 조건을 바꿔볼까요?';
 addMessage('agent',response);renderCandidates();renderRecommendation();renderSuggestions();
}
function savePlan(){if(!session)return;session.ready=ready;session.selected=selected;try{localStorage.setItem('fashionmap-plan-v2',JSON.stringify(session));syncSaved();$('#save').textContent='플랜 저장됨 ♥';addMessage('agent','상품 링크, 구매 조건과 대화를 이 브라우저에 저장했어요. 상단 “저장한 상품”에서 이어갈 수 있습니다. 가격 모니터링이나 알림은 설정되지 않았습니다.')}catch{addMessage('agent','브라우저 저장소를 사용할 수 없어 저장하지 못했습니다. 저장 허용 설정을 확인해 주세요.')}}
$('#saved').onclick=()=>{if(restoreStylist())return;const s=readSaved();if(s)start(s.url,s);else{showHome();$('#form-status').textContent='저장된 구매 플랜이 없습니다. 링크를 넣고 대화를 시작해 보세요.';$('#product-url').focus()}};
$('#demo').onclick=()=>start(sampleUrl);
$('#compare-form').onsubmit=e=>{e.preventDefault();const input=$('#product-url'),value=input.value.trim();if(value.length<2||value.length>1200||/^(?:javascript|data|file):/i.test(value)){$('#form-status').textContent='스타일 설명이나 상품 링크를 2~1200자로 입력해 주세요.';input.setAttribute('aria-invalid','true');input.focus();return}input.removeAttribute('aria-invalid');startStylist(value)};

document.querySelectorAll('[data-guide]').forEach(b=>b.onclick=()=>{$('#guide').hidden=false;$('#guide').scrollIntoView({behavior:'smooth'})});$('#close-guide').onclick=()=>{$('#guide').hidden=true;window.scrollTo({top:0,behavior:'smooth'})};
