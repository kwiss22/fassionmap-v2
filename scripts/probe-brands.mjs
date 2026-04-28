/**
 * 후보 브랜드를 한국어/영문 표기로 순차 프로브하고 품질 리포트를 찍는다.
 * Naver Shop API 초당 제한을 피하기 위해 요청 사이에 지연을 둔다.
 */

const BASE = "http://localhost:3000/api/diag/brand-probe";
const DELAY_MS = 250; // ~4 req/sec

// [category, [ko, en, primaryQuery, fallbackQuery?]]
const CANDIDATES = [
  ["Luxury Maison", [
    ["셀린느", "CELINE", "셀린느"],
    ["디올", "DIOR", "디올"],
    ["샤넬", "CHANEL", "샤넬"],
    ["루이비통", "LOUIS VUITTON", "루이비통"],
    ["에르메스", "HERMES", "에르메스"],
    ["프라다", "PRADA", "프라다"],
    ["구찌", "GUCCI", "구찌"],
    ["보테가 베네타", "BOTTEGA VENETA", "보테가베네타"],
    ["발렌시아가", "BALENCIAGA", "발렌시아가"],
    ["생로랑", "SAINT LAURENT", "생로랑"],
    ["발렌티노", "VALENTINO", "발렌티노"],
    ["페라가모", "FERRAGAMO", "페라가모"],
    ["버버리", "BURBERRY", "버버리"],
    ["펜디", "FENDI", "펜디"],
    ["몽클레어", "MONCLER", "몽클레어"],
    ["디오르 옴므", "DIOR HOMME", "디올 옴므"],
    ["알렉산더 맥퀸", "Alexander McQueen", "알렉산더 맥퀸"],
    ["톰 포드", "Tom Ford", "톰포드"],
    ["톰 브라운", "Thom Browne", "톰브라운"],
  ]],
  ["Contemporary Luxury / Editorial", [
    ["아크네 스튜디오", "Acne Studios", "아크네 스튜디오"],
    ["르메르", "LEMAIRE", "르메르"],
    ["메종 마르지엘라", "Maison Margiela", "메종마르지엘라"],
    ["토템", "TOTEME", "토템"],
    ["더 로우", "The Row", "더 로우"],
    ["로에베", "LOEWE", "LOEWE"],
    ["질샌더", "JIL SANDER", "질샌더"],
    ["자크뮈스", "JACQUEMUS", "자크뮈스"],
    ["가니", "GANNI", "가니"],
    ["아미 파리", "AMI PARIS", "아미 파리"],
    ["이자벨 마랑", "Isabel Marant", "이자벨 마랑"],
    ["마르니", "MARNI", "마르니"],
    ["드리스 반 노튼", "Dries Van Noten", "드리스 반 노튼"],
    ["클로에", "CHLOE", "클로에"],
    ["띠어리", "Theory", "띠어리"],
  ]],
  ["Italian Heritage / Knitwear", [
    ["로로피아나", "Loro Piana", "로로피아나"],
    ["브루넬로 쿠치넬리", "Brunello Cucinelli", "브루넬로 쿠치넬리"],
    ["막스마라", "Max Mara", "막스마라"],
    ["에트로", "ETRO", "에트로"],
    ["조르지오 아르마니", "Giorgio Armani", "아르마니"],
    ["제냐", "Zegna", "제냐"],
    ["토즈", "TOD'S", "토즈"],
    ["미우미우", "MIU MIU", "미우미우"],
  ]],
  ["Japanese Avant-garde / Contemporary", [
    ["꼼데가르송", "COMME des GARÇONS", "꼼데가르송"],
    ["이세이 미야케", "ISSEY MIYAKE", "이세이미야케"],
    ["사카이", "sacai", "사카이"],
    ["준야 와타나베", "JUNYA WATANABE", "준야 와타나베"],
    ["요지 야마모토", "Yohji Yamamoto", "요지 야마모토"],
    ["비즈빔", "visvim", "visvim"],
    ["오어슬로우", "orSlow", "오어슬로우"],
    ["카피탈", "KAPITAL", "카피탈"],
  ]],
  ["American Heritage / Accessories", [
    ["폴로 랄프로렌", "Polo Ralph Lauren", "폴로 랄프로렌"],
    ["타미힐피거", "Tommy Hilfiger", "타미힐피거"],
    ["캘빈클라인", "Calvin Klein", "캘빈클라인"],
    ["코치", "COACH", "COACH"],
    ["토리버치", "Tory Burch", "토리버치"],
    ["라코스테", "LACOSTE", "라코스테"],
    ["마크 제이콥스", "Marc Jacobs", "마크 제이콥스"],
  ]],
  ["Denim / Casual", [
    ["리바이스", "Levi's", "리바이스"],
    ["아페쎄", "A.P.C.", "APC"],
    ["디젤", "DIESEL", "디젤"],
    ["트루 릴리전", "True Religion", "트루릴리전"],
    ["리", "Lee", "리 데님"],
  ]],
  ["Streetwear / Sneakers", [
    ["나이키", "NIKE", "나이키"],
    ["아디다스", "adidas", "아디다스"],
    ["뉴발란스", "New Balance", "뉴발란스"],
    ["컨버스", "Converse", "컨버스"],
    ["반스", "Vans", "반스"],
    ["스투시", "Stüssy", "Stussy"],
    ["오프화이트", "Off-White", "Off-White"],
    ["팔라스", "PALACE", "팔라스"],
    ["슈프림", "Supreme", "슈프림"],
  ]],
  ["Korean Premium / Contemporary", [
    ["우영미", "Wooyoungmi", "우영미"],
    ["준지", "JUUN.J", "JUUN.J"],
    ["아더에러", "ADER error", "아더에러"],
    ["시스템", "SYSTEM", "시스템 브랜드"],
    ["송지오", "SONGZIO", "송지오"],
    ["렉토", "RECTO", "렉토 브랜드"],
    ["디앤티도트", "d-antidote", "디앤티도트"],
    ["우알롱", "WOALON", "우알롱"],
    ["르마드", "LMD", "르마드"],
    ["마뗑킴", "MATIN KIM", "마뗑킴"],
  ]],
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function probe(query) {
  const url = `${BASE}?brands=${encodeURIComponent(query)}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const data = await resp.json();
  return data.report[0];
}

function scoreLabel(r) {
  if (!r || r.itemCount === 0) return "NONE";
  if (r.uniqueMalls >= 10) return "EXCELLENT";
  if (r.uniqueMalls >= 5) return "GOOD";
  if (r.uniqueMalls >= 2) return "OK";
  return "SINGLE_MALL"; // likely all under "네이버" aggregator
}

async function main() {
  const findings = [];

  for (const [category, brands] of CANDIDATES) {
    console.log(`\n━━━━ ${category} ━━━━`);
    for (const [ko, en, query] of brands) {
      try {
        const r = await probe(query);
        const score = scoreLabel(r);
        const marker = r.itemCount === 0 ? "✗" : "✓";
        const line =
          `${marker} ${score.padEnd(11)} ` +
          `${ko.padEnd(15)} (${en.padEnd(22)}) ` +
          `→ q="${query}" ` +
          `${r.itemCount}it / ${r.uniqueMalls}malls / ₩${r.avgPrice.toLocaleString()}`;
        console.log(line);
        if (r.sampleTitles?.length) {
          console.log(`   sample: ${r.sampleTitles[0].slice(0, 80)}`);
        }
        findings.push({ category, ko, en, query, ...r, score });
      } catch (e) {
        console.log(`✗ ERROR      ${ko} (${en}) → ${e.message}`);
      }
      await sleep(DELAY_MS);
    }
  }

  console.log(`\n=== SUMMARY ===`);
  const grouped = {};
  for (const f of findings) {
    grouped[f.score] = (grouped[f.score] || 0) + 1;
  }
  for (const [k, v] of Object.entries(grouped).sort()) {
    console.log(`  ${k}: ${v}`);
  }
  console.log(`  total: ${findings.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
