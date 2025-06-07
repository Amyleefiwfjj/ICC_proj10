let img, tempTable, rainTable, font, gl;
let cities = [];
let currentIdx = 0;          // 0–11: month index, or 'avg'
const planeSize = 800;
let lang = 'ko', unit = 'C';
const API_KEY = '';          // OpenWeather API key if you want realtime data

// 자치도별 3D 위치
const regionCoords = {
    '경기도': { x: -60, z: -230 },
    '강원도': { x: 100, z: -230 },
    '충청북도': { x: 0, z: -100 },
    '충청남도': { x: -100, z: -80 },
    '전라북도': { x: -80, z: 20 },
    '전라남도': { x: -100, z: 130 },
    '경상북도': { x: 180, z: -70 },
    '경상남도': { x: 120, z: 70 },
    '제주특별자치도': { x: -160, z: 300 }
};

// 다국어 레이블
const I18N = {
    ko: { avg: '평균', feels: '체감', rain: '강수', uv: '자외선', prep: '준비물' },
    en: { avg: 'Avg', feels: 'Feels', rain: 'Rain', uv: 'UV', prep: 'Gear' }
};

// 의류/준비물 추천
function clothingAdvice(tC) {
    if (tC >= 28) return '🍦 반팔·선크림';
    if (tC >= 22) return '👕 가벼운 옷';
    if (tC >= 16) return '👔 긴팔·얇은 겉옷';
    if (tC >= 10) return '🧥 재킷';
    return '🧣 코트·패딩';
}

function preload() {
    font = loadFont('./data/Title.ttf');
    tempTable = loadTable('./data/temp.csv', 'csv', 'header');
    rainTable = loadTable('./data/rain.csv', 'csv', 'header');
    img = loadImage('./data/Layer1.png');
}

function setup() {
    createCanvas(planeSize, planeSize, WEBGL);
    gl = this._renderer;

    textFont(font);
    textSize(12);
    textAlign(CENTER, CENTER);
    noStroke();
    angleMode(RADIANS);

    // CSV 파싱: 월 수, 자치도 리스트
    const monthsCount = tempTable.getRowCount();
    const regions = tempTable.columns.filter(c => c !== '일시');

    // cities 배열 생성
    for (let region of regions) {
        if (!(region in regionCoords)) continue;
        const coords = regionCoords[region];

        // 온도/강수량 데이터 읽기
        const temps = [];
        const rains = [];
        for (let i = 0; i < monthsCount; i++) {
            const t = parseFloat(tempTable.getString(i, region));
            const r = parseFloat(rainTable.getString(i, region));
            temps.push(isNaN(t) ? 0 : t);
            rains.push(isNaN(r) ? 0 : r);
        }

        // 평균 계산
        const avgT = temps.reduce((a, b) => a + b, 0) / monthsCount;
        const avgR = rains.reduce((a, b) => a + b, 0) / monthsCount;

        cities.push({
            ...coords,
            region,
            temps, rains,
            avgT, avgR,
            currentTempH: 0, targetTempH: 0,
            currentRainH: 0, targetRainH: 0,
            extra: {}
        });
    }

    // 월 버튼 생성
    for (let i = 0; i < tempTable.getRowCount(); i++) {
        const label = tempTable.getString(i, '일시');
        createButton(label)
            .position(10 + i * 60, height + 10)
            .mousePressed(() => selectMonth(i));
    }
    // 평균 버튼
    createButton(I18N[lang].avg)
        .position(10 + tempTable.getRowCount() * 60, height + 10)
        .mousePressed(() => selectMonth('avg'));

    // 언어·단위 토글
    select('#langSel').changed(e => { lang = e.target.value; updateInfo(); });
    select('#unitSel').changed(e => { unit = e.target.value; updateInfo(); });

    // 초기 설정
    selectMonth(0);
    updateInfo();
    if (API_KEY) fetchRealtime();
}

function draw() {
    background(188, 226, 235);
    orbitControl();
    ambientLight(150);
    directionalLight(255, 255, 255, 0, -1, -1);

    // 지도 바닥 (PNG 비율 유지 필요하면 별도 처리)
    push();
    rotateX(HALF_PI);
    texture(img);
    plane(planeSize, planeSize);
    pop();

    // 막대 그리기
    const barOffset = 15;      // 템프와 레인 바 사이 간격
    const tempScale = 5;      // 온도 스케일
    const rainScale = 0.3;    // 강수 스케일 (필요에 따라 조정)

    for (let c of cities) {
        // 애니메이션 보간
        c.currentTempH = lerp(c.currentTempH, c.targetTempH, 0.05);
        c.currentRainH = lerp(c.currentRainH, c.targetRainH, 0.05);

        // 온도 막대 (보라)
        push();
        translate(c.x - barOffset, -c.currentTempH / 2, c.z);
        ambientMaterial(200, 100, 200);
        box(15, c.currentTempH, 15);
        pop();

        // 강수량 막대 (파랑)
        push();
        translate(c.x + barOffset, -c.currentRainH / 2, c.z);
        ambientMaterial(100, 150, 255);
        box(15, c.currentRainH, 15);
        pop();

        // 자치도 이름
        push();
        translate(c.x, -max(c.currentTempH, c.currentRainH) - 10, c.z);
        fill(0);
        text(c.region, 0, 0);
        pop();
    }

    handleTooltip();
}

// 3D→2D 투영
function worldToScreen(x, y, z) {
    const mv = gl.uMVMatrix.mat4;
    const p = gl.uPMatrix.mat4;
    const v = [x, y, z, 1];
    const mvv = [
        mv[0] * v[0] + mv[4] * v[1] + mv[8] * v[2] + mv[12] * v[3],
        mv[1] * v[0] + mv[5] * v[1] + mv[9] * v[2] + mv[13] * v[3],
        mv[2] * v[0] + mv[6] * v[1] + mv[10] * v[2] + mv[14] * v[3],
        mv[3] * v[0] + mv[7] * v[1] + mv[11] * v[2] + mv[15] * v[3]
    ];
    const clip = [
        p[0] * mvv[0] + p[4] * mvv[1] + p[8] * mvv[2] + p[12] * mvv[3],
        p[1] * mvv[0] + p[5] * mvv[1] + p[9] * mvv[2] + p[13] * mvv[3],
        p[2] * mvv[0] + p[6] * mvv[1] + p[10] * mvv[2] + p[14] * mvv[3],
        p[3] * mvv[0] + p[7] * mvv[1] + p[11] * mvv[2] + p[15] * mvv[3]
    ];
    const ndcX = clip[0] / clip[3], ndcY = clip[1] / clip[3];
    return {
        x: (ndcX * 0.5 + 0.5) * width,
        y: (1 - (ndcY * 0.5 + 0.5)) * height
    };
}

function handleTooltip() {
    const tip = document.getElementById('tooltip');
    let shown = false;
    for (let c of cities) {
        const pos = worldToScreen(c.x, -c.currentTempH / 2, c.z);
        if (dist(mouseX, mouseY, pos.x, pos.y) < 12) {
            // 온도
            const baseT = (currentIdx === 'avg' ? c.avgT : c.temps[currentIdx]);
            const dispT = unit === 'F'
                ? (baseT * 9 / 5 + 32).toFixed(1)
                : baseT.toFixed(1);
            // 강수
            const baseR = (currentIdx === 'avg' ? c.avgR : c.rains[currentIdx]);
            const dispR = `${baseR.toFixed(1)} mm`;

            const suf = '°' + unit;
            let html = `<b>${c.region}</b><br>${dispT}${suf}`;
            html += `<br>${I18N[lang].rain}: ${dispR}`;
            html += `<br>${I18N[lang].prep}: ${clothingAdvice(baseT)}`;

            tip.innerHTML = html;
            tip.style.left = pos.x + 15 + 'px';
            tip.style.top = pos.y + 15 + 'px';
            tip.style.display = 'block';
            shown = true;
            break;
        }
    }
    if (!shown) tip.style.display = 'none';
}

function selectMonth(idx) {
    currentIdx = idx;
    for (let c of cities) {
        const t = (idx === 'avg' ? c.avgT : c.temps[idx]);
        const r = (idx === 'avg' ? c.avgR : c.rains[idx]);
        c.targetTempH = t * 5;       // 필요하면 스케일 조정
        c.targetRainH = r * 0.3;     // 필요하면 스케일 조정
    }
    updateInfo();
}

function updateInfo() {
    const info = document.getElementById('info');
    const label = (currentIdx === 'avg')
        ? I18N[lang].avg
        : tempTable.getString(currentIdx, '일시');

    // 전체 평균 온도
    let sum = 0;
    cities.forEach(c => sum += (currentIdx === 'avg' ? c.avgT : c.temps[currentIdx]));
    const avgTemp = sum / cities.length;
    const dispAvg = unit === 'F'
        ? (avgTemp * 9 / 5 + 32).toFixed(1)
        : avgTemp.toFixed(1);

    info.innerHTML = `<b>${label}</b><br>${dispAvg}°${unit}`;
}

async function fetchRealtime() {
    for (let c of cities) {
        // 위도/경도 필드가 있다면 추가 가능
        // c.extra = { ... }
    }
}
