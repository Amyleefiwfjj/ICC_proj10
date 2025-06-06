let dataLines;            // preload()에서 불러온 CSV의 각 줄
let thisYearTemps = [];
let lastYearTemps = [];
let bars = [];

let numDays = 365;
let barWidth = 3;
let speed = 1;

let globalMinTemp, globalMaxTemp;

// 월 표시를 위한 배열 (6월~5월 기준)
const monthNames = [
  '6월', '7월', '8월', '9월', '10월', '11월',
  '12월', '1월', '2월', '3월', '4월', '5월'
];
// 6월 1일(2023-06-01)이 day 0 기준으로 계산한 월별 시작 인덱스
const monthStartIndices = [
  0,    // 6월 1일 → day 0
  30,   // 7월 1일 → 30
  61,   // 8월 1일 → 30 + 31
  92,   // 9월 1일 → 61 + 31
  122,  // 10월 1일 → 92 + 30
  153,  // 11월 1일 → 122 + 31
  183,  // 12월 1일 → 153 + 30
  214,  // 1월 1일 → 183 + 31
  245,  // 2월 1일 → 214 + 31
  273,  // 3월 1일 → 245 + 28 (윤년 29일 제외 가정)
  304,  // 4월 1일 → 273 + 31
  334   // 5월 1일 → 304 + 30
];

function preload() {
  // CSV 파일을 data/ 폴더에 넣었다고 가정
  dataLines = loadStrings('data/ta_20250606113030.csv');
}

function setup() {
  createCanvas(800, 500);
  textFont('Arial');

  // CSV 파싱: “YYYY-MM-DD”로 시작하는 줄에서 avgTa(3번째 필드)만 뽑아낸다.
  // 윤년 날짜(2024-02-29)는 건너뛰어 총 730일(365×2)만 사용한다고 가정.
  let filteredTemps = [];
  for (let i = 0; i < dataLines.length; i++) {
    let line = dataLines[i].trim();
    if (/^2024-02-29/.test(line)) {
      continue; // 윤년 날짜 건너뛰기
    }
    if (/^\d{4}-\d{2}-\d{2}/.test(line)) {
      let parts = line.split(',');
      let avgTa = parseFloat(parts[2]);
      if (!isNaN(avgTa)) {
        filteredTemps.push(avgTa);
      }
    }
  }
  // 이제 filteredTemps.length === 730 이라 가정
  lastYearTemps = filteredTemps.slice(0, 365);   // 2023-06-01 ~ 2024-05-31
  thisYearTemps = filteredTemps.slice(365, 730); // 2024-06-01 ~ 2025-05-31

  // 전체 범위에서 최솟값/최댓값 계산
  let allTemps = lastYearTemps.concat(thisYearTemps);
  globalMinTemp = min(allTemps);
  globalMaxTemp = max(allTemps);

  // Bar 객체 생성 (상단: thisYear, 하단: lastYear)
  for (let i = 0; i < numDays; i++) {
    let x = i * barWidth;
    bars.push(new Bar(x, thisYearTemps[i], 'top'));
    bars.push(new Bar(x, lastYearTemps[i], 'bottom'));
  }
}

function draw() {
  background(255);

  // ────────────────────────────────────
  // 1) Bar 객체 업데이트하고 표시 (그래프 레이어)
  // ────────────────────────────────────
  for (let bar of bars) {
    bar.update();
    bar.display();
  }

  // ────────────────────────────────────
  // 2) 중앙 기준선
  // ────────────────────────────────────
  stroke(100);
  strokeWeight(1);
  line(0, height / 2, width, height / 2);

  // ────────────────────────────────────
  // 3) Y축 온도 틱 및 라인 그리기 (레이블 레이어)
  // ────────────────────────────────────
  stroke(200);
  strokeWeight(1);
  const numTicks = 5;
  textAlign(RIGHT, CENTER);
  fill(0);

  for (let i = 0; i <= numTicks; i++) {
    let t = globalMinTemp + i * (globalMaxTemp - globalMinTemp) / numTicks;

    // 위쪽(상단) y 좌표: 중앙선에서 위로 매핑
    let yTop = map(t, globalMinTemp, globalMaxTemp, height / 2, 0);
    // 아래쪽(하단) y 좌표: 중앙선에서 아래로 매핑
    let yBottom = height / 2 + map(t, globalMinTemp, globalMaxTemp, 0, height / 2 - 30);

    // 상단/하단 모두 가로선 표시
    line(0, yTop, width, yTop);
    line(0, yBottom, width, yBottom);

    // 온도값 텍스트 (왼쪽 여백 40px)
    text(nfc(t, 1) + '℃', 40, yTop);
    text(nfc(t, 1) + '℃', 40, yBottom);
  }

  // ────────────────────────────────────
  // 4) 스크롤 오프셋 계산
  // ────────────────────────────────────
  let scrollOffset = (frameCount * speed) % (numDays * barWidth);

  // ────────────────────────────────────
  // 5) X축 월 레이블 (스크롤과 함께 이동)
  // ────────────────────────────────────
  textAlign(CENTER, BOTTOM);
  textSize(12);
  fill(50);
  noStroke();

  for (let m = 0; m < monthNames.length; m++) {
    // 원래 데이터 기준 x 위치
    let xOrig = monthStartIndices[m] * barWidth;
    // 스크롤 적용 위치
    let xScrolled = xOrig - scrollOffset;
    // 범위를 벗어나면 한 사이클 뒤로 감싸기
    if (xScrolled < -barWidth * 2) {
      xScrolled += numDays * barWidth;
    } else if (xScrolled > width + barWidth * 2) {
      xScrolled -= numDays * barWidth;
    }
    // 화면 안에 보이는 구간만 그리기
    if (xScrolled >= -50 && xScrolled <= width + 50) {
      text(monthNames[m], xScrolled + barWidth * 0.5, height - 10);
    }
  }
}

// ────────────────────────────────────
// Bar 클래스 (온도 → 색상 매핑 포함)
// ────────────────────────────────────
class Bar {
  constructor(x, temp, section) {
    this.x = x;
    this.temp = temp;
    this.width = barWidth;
    this.section = section;
    this.color = this.mapTempToColor(temp);
  }

  update() {
    this.x -= speed;
    if (this.x + this.width < 0) {
      this.x += numDays * barWidth;
    }
  }

  display() {
    // 높이 값(h)을, 상단/하단 각각 절반을 최대(높이/2 - 30픽셀)로 매핑
    let h = map(this.temp, globalMinTemp, globalMaxTemp, 0, height / 2 - 30);
    fill(this.color);
    noStroke();
    if (this.section === 'top') {
      rect(this.x, height / 2 - h, this.width, h);
    } else {
      rect(this.x, height / 2, this.width, h);
    }
  }

  mapTempToColor(temp) {
    let ratio = constrain((temp - globalMinTemp) / (globalMaxTemp - globalMinTemp), 0, 1);
    let r = lerp(0, 255, ratio);
    let b = lerp(255, 0, ratio);
    return color(r, 0, b);
  }
}
