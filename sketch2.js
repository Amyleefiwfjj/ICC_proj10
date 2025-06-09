// sketch2.js  (module)

import { preloadWebGL, setupWebGL, drawWebGL, worldToScreen } from './webglRenderer.js';

/* ---------- 전역 변수 ---------- */
let font, tempTable, rainTable;
let cities = [];
let currentIdx = 0;
let lang = 'ko', unit = 'C';


const api        = 'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst';
const serviceKey = 'g3VCISjBuFhV9qz…Fo%2Bjw%3D%3D';  // **포털에서 받은 “Encoding” 키**
const proxy      = 'https://late-dust-3081.amylee2804.workers.dev/?url=';
function makeKmaUrl({ base_date, base_time, nx, ny }) {
  // serviceKey는 이미 인코딩된 상태이므로 그대로 넣습니다
  const qs = new URLSearchParams({
    serviceKey,
    pageNo: 1, numOfRows: 1000, dataType: 'JSON',
    base_date, base_time, nx, ny
  }).toString();
  return `${api}?${qs}`;    // <-- “?...” 형태의 완전한 URL
}

// 도별 격자
const regionGrids = {
  '경기도':       { nx: 60, ny:122 },
  '강원도':       { nx: 73, ny:134 },
  '충청북도':     { nx: 69, ny:107 },
  '충청남도':     { nx: 66, ny:100 },
  '전라북도':     { nx: 63, ny: 89 },
  '전라남도':     { nx: 58, ny: 76 },
  '경상북도':     { nx: 89, ny: 90 },
  '경상남도':     { nx: 90, ny: 77 },
  '제주특별자치도': { nx: 52, ny: 38 }
};

function preload() {
  preloadWebGL();                                     // 지도 텍스처
  font      = loadFont('./data/Title.ttf');
  tempTable = loadTable('./data/temp.csv','csv','header');
  rainTable = loadTable('./data/rain.csv','csv','header');
}

function setup() { setupWebGL(); /* + UI 준비 */ }
function draw()  { drawWebGL(cities); handleTooltip(); }

/* ---------- API 호출 ---------- */
function buildUrl(paramsObj) {
  const qs = new URLSearchParams(paramsObj).toString();
  return `${cors}${api}?serviceKey=${serviceKey}&${qs}`;
}

function yyyymmddhh() {
  const now = new Date();
  if (now.getMinutes() < 40) now.setHours(now.getHours() - 1);    // 40분 보정
  const pad = n => String(n).padStart(2,'0');
  return {
    base_date: `${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}`,
    base_time: `${pad(now.getHours())}00`
  };
}

async function fetchNow() {
  const { base_date, base_time } = yyyymmddhh();

  for (const [region, { nx, ny }] of Object.entries(regionGrids)) {
    // 1) build the original KMA endpoint URL
    const rawUrl = makeKmaUrl({ base_date, base_time, nx, ny });

    // 2) wrap it in your Cloudflare Worker proxy
    const fetchUrl = proxy + encodeURIComponent(rawUrl);

    // 3) hit the proxy
    const responseText = await (await fetch(fetchUrl)).text();

    // 4) if it starts with “<”, it’s XML (an error from KMA), so skip
    if (responseText.trim().startsWith('<')) {
      console.error(region, 'XML error:', responseText.slice(0,120));
      continue;
    }

    // 5) parse the JSON and check resultCode
    const data = JSON.parse(responseText);
    const header = data.response.header;
    if (header.resultCode !== '00') {
      console.error(region, 'KMA error:', header.resultMsg);
      continue;
    }

    // 6) extract and apply to your cities[]
    const items = data.response.body.items.item;
    const T1H = +items.find(i => i.category==='T1H')?.obsrValue || NaN;
    const RN1 = +items.find(i => i.category==='RN1')?.obsrValue || 0;
    const city = cities.find(c => c.region === region);
    if (city && !isNaN(T1H)) {
      city.targetTempH = T1H * 5;
      city.targetRainH = RN1 * 0.3;
    }
  }
}

// initial load + repeat
fetchNow();
setInterval(fetchNow, 10 * 60 * 1000);