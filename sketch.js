function preload() {
  // data/ta_20250606113030.csv 파일을 줄 단위로 불러와 dataLines에 저장
  dataLines = loadStrings('data/ta_20250606113030.csv');
}
let dataLines;            // preload()에서 불러온 CSV의 각 줄 문자열 배열
let thisYearTemps = [];   // 2024-06-01~2025-06-01 기간(또는 두 번째 365일)의 일별 평균기온을 담을 배열
let lastYearTemps = [];   // 2023-06-01~2024-06-01 기간(또는 첫 번째 365일)의 일별 평균기온을 담을 배열
let bars = [];

let numDays = 365;        // 1년 단위를 365일로 간주 (필요 시 윤년 처리 고려)
let barWidth = 7;
let speed = 1;

let globalMinTemp, globalMaxTemp;

function setup() {
  createCanvas(800, 500);

  // 1) dataLines에서 “날짜로 시작하는 줄”만 골라서 온도(세 번째 필드: avgTa)를 추출
  let tempsAll = [];  // CSV에서 순서대로 뽑아낸 avgTa(일별 평균기온) 숫자를 담을 임시 배열

  for (let i = 0; i < dataLines.length; i++) {
    let line = dataLines[i].trim();
    // “2023-” 또는 “2024-” 같은 날짜 형식(YYYY-MM-DD)로 시작하는지 확인
    // (필요 시 파일에 따라 년도가 “2025-”까지 나올 수 있으니 정규 표현식으로 검사)
    if (/^\d{4}-\d{2}-\d{2}/.test(line)) {
      // 콤마(,)로 분리하면: [날짜, 지점번호, avgTa, minTa, maxTa]
      let parts = line.split(',');
      // parts[2]가 평균기온(avgTa) 문자열
      let avgTa = parseFloat(parts[2]);
      if (!isNaN(avgTa)) {
        tempsAll.push(avgTa);
      }
    }
  }

  // 2) tempsAll에 담긴 연속적인 일별 평균기온 배열을 **앞쪽 365개** → lastYearTemps,
  //    **뒤쪽 365개** → thisYearTemps로 나눠 담기
  //    (만약 데이터 기간이 정확히 365 + 365 = 730개라면 이렇게 나눌 수 있음)
  //    만약 윤년(2024-02-29)이 포함되어 731개 이상이라면, 
  //    사용하는 인덱스를 조정해서 정확하게 각각 365개씩만 슬라이스하거나 
  //    필요 없는 날짜(예: 2024-02-29)만 건너뛰도록 코드를 수정해야 함.

  // 예시: tempsAll.length === 731일일 경우, 365*2 = 730개만 사용하고
  //       이미 2024-02-29(Leap day)를 무시했다고 가정
  // 만약 정확히 365*2 = 730개라면 바로 슬라이스 가능
  //    let firstChunk = tempsAll.slice(0, 365);
  //    let secondChunk = tempsAll.slice(365, 730);

  // 파일에 총 731개 데이터(2023-06-01 ~ 2025-06-01)가 들어 있는 경우를 가정하고,
  // 1) 2024-02-29(“2024-02-29”)인덱스를 건너뛰는 예시:
  let filteredTemps = [];
  let leapIndex = -1;
  for (let i = 0; i < dataLines.length; i++) {
    let line = dataLines[i].trim();
    if (/^2024-02-29/.test(line)) {
      leapIndex = i;
      continue; // 2024-02-29 건너뛰기
    }
    if (/^\d{4}-\d{2}-\d{2}/.test(line)) {
      let parts = line.split(',');
      let avgTa = parseFloat(parts[2]);
      if (!isNaN(avgTa)) {
        filteredTemps.push(avgTa);
      }
    }
  }
  // 이제 filteredTemps.length === 730(=365 * 2)라고 가정
  lastYearTemps = filteredTemps.slice(0, 365);
  thisYearTemps = filteredTemps.slice(365, 730);

  // 3) 전체 730개의 온도 중에서 최소·최대값을 구해 시각화 스케일 설정
  let allTemps = lastYearTemps.concat(thisYearTemps);
  globalMinTemp = min(allTemps);
  globalMaxTemp = max(allTemps);

  // 4) Bar 객체 생성 (화면 상단에 thisYear, 하단에 lastYear)
  for (let i = 0; i < numDays; i++) {
    let x = i * barWidth;
    bars.push(new Bar(x, thisYearTemps[i], 'top'));
    bars.push(new Bar(x, lastYearTemps[i], 'bottom'));
  }
}

function draw() {
  background(255);
  for (let bar of bars) {
    bar.update();
    bar.display();
  }
  stroke(100);
  line(0, height / 2, width, height / 2);
}

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
