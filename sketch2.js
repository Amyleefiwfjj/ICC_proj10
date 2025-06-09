// sketch2.js
import { preloadWebGL, setupWebGL, drawWebGL, worldToScreen } from './webglRenderer.js';

let headerImg, tempTable, rainTable, font;
let cities = [];
let currentIdx = 0;
const planeSize = 800;
let lang = 'ko', unit = 'C';
function preload() {
  // 3D 텍스처
  preloadWebGL();
  // 폰트·CSV
  font       = loadFont('./data/Title.ttf');
  tempTable  = loadTable('./data/temp.csv','csv','header');
  rainTable  = loadTable('./data/rain.csv','csv','header');
}
// 1) 초단기 실황조회 엔드포인트
const urlBase = 'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst';

const serviceKey = 'g3VCISjBuFhV9qzkIbePvL/7msDm8LHzAXBiZbWjVl6hDpZr4UwxMVP+WBrE9r7NAXtgWlsOP1HpspngAFo+jw==';
// ───── 도별 격자(nx, ny) 좌표 ─────
const regionCoords  = {
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

function setup() {
  // WebGL 캔버스
  setupWebGL();

  // Header 이미지 → 캔버스·툴팁 위치 보정
  headerImg = select('#headerImg');
  headerImg.elt.onload = () => canvasPosition(headerImg.elt.naturalHeight);

  // CSV → cities 배열 초기화
  const monthsCount = tempTable.getRowCount();
  const regions = tempTable.columns.filter(c => c !== '일시');
  for (let region of regions) {
    if (!(region in regionCoords)) continue;
    const { x, z } = regionCoords[region];
    const temps = [], rains = [];
    for (let i = 0; i < monthsCount; i++) {
      const t = parseFloat(tempTable.getString(i, region));
      const r = parseFloat(rainTable.getString(i, region));
      temps.push(isNaN(t)?0:t);
      rains.push(isNaN(r)?0:r);
    }
    const avgT = temps.reduce((a,b)=>a+b,0)/monthsCount;
    const avgR = rains.reduce((a,b)=>a+b,0)/monthsCount;
    cities.push({ x, z, region, temps, rains, avgT, avgR,
                  currentTempH:0, targetTempH:0,
                  currentRainH:0, targetRainH:0 });
  }
function draw() {
  // 3D 장면 렌더링 + 툴팁
  drawWebGL(cities);
}
  // 툴팁 스타일링 (이전과 동일)
  // 언어·단위 드롭다운 바인딩 (이전과 동일)
  // 월별 버튼 생성 (이전과 동일)

  selectMonth(0);
  updateInfo();

  // → 실시간 API 최초 호출 및 주기 갱신
  fetchNow();
  setInterval(fetchNow, 10*60*1000);
}
// 3) 호출 함수
async function fetchNow() {
  const now = new Date();
  const pad = n => String(n).padStart(2,'0');
  const base_date = `${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}`;
  const base_time = pad(now.getHours()-1) + '00';

  for (let [region, {nx, ny}] of Object.entries(regionCoords)) {
    const url = new URL(urlBase);
    url.searchParams.set('serviceKey', serviceKey);
    url.searchParams.set('pageNo',    '1');         // ← 필수
    url.searchParams.set('numOfRows', '1000');      // ← 필수
    url.searchParams.set('dataType',   'JSON');
    url.searchParams.set('base_date',  base_date);
    url.searchParams.set('base_time',  base_time);
    url.searchParams.set('nx',         nx);
    url.searchParams.set('ny',         ny);

    try {
      const res  = await fetch(url);
      const data = await res.json();

      const header = data.response.header;
      if (header.resultCode !== '00') {
        console.error(`${region} 조회 실패: ${header.resultMsg}`);
        continue;
      }

      const items = data.response.body.items.item;
      const t1h   = items.find(i => i.category==='T1H')?.obsrValue;
      const rn1   = items.find(i => i.category==='RN1')?.obsrValue || 0;
      console.log(region, '기온:', t1h+'℃', '강수:', rn1+'mm');

      // → cities 배열에 반영: ...
    }
    catch (e) {
      console.error(`${region} 예외 발생:`, e);
    }
  }
}

// 4) 실행
fetchNow();
setInterval(fetchNow, 10*60*1000);
