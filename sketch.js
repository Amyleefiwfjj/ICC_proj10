let img, table, font;
let cities = [];
let currentIndex = 0;
const planeSize = 800;

// 자치도별 화면 내 위치 (map image 좌표에 맞춰 조정)
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

function preload() {
    font = loadFont('./data/Title.ttf');
    table = loadTable('./data/data.csv', 'csv', 'header');
    img = loadImage('./data/Layer1.png');
}

function setup() {
    createCanvas(planeSize, planeSize, WEBGL);
    noStroke();
    angleMode(RADIANS);

    textFont(font);
    textSize(12);
    textAlign(CENTER, CENTER);

    // — CSV 파싱: 각 자치도별 temps, avg 계산 —
    const months = table.getRowCount(); // 예: 12
    for (let region in regionCoords) {
        if (!table.columns.includes(region)) continue;
        const coords = regionCoords[region];
        const temps = [];
        for (let r = 0; r < months; r++) {
            temps.push(table.getNum(r, region));
        }
        const avg = temps.reduce((s, v) => s + v, 0) / months;
        cities.push({
            region,
            x: coords.x,
            z: coords.z,
            temps,
            avg,
            currentH: 0,
            targetH: 0
        });
    }

    // — 버튼 생성: 각 월 + 평균 —
    for (let i = 0; i < cities[0].temps.length; i++) {
        const label = table.getString(i, '일시'); // ex) "24-Jun" 또는 "Jun-24"
        createButton(label)
            .position(10 + i * 60, height + 10)
            .mousePressed(() => selectMonth(i));
    }
    createButton('평균')
        .position(10 + cities[0].temps.length * 60, height + 10)
        .mousePressed(() => selectMonth('avg'));

    // 초기 선택
    selectMonth(0);
}

function selectMonth(idx) {
    currentIndex = idx;
    for (let city of cities) {
        const val = (idx === 'avg') ? city.avg : city.temps[idx];
        city.targetH = val * 5;  // 높이 스케일링
    }
}

function draw() {
    background(200);
    orbitControl();
    ambientLight(150);
    directionalLight(255, 255, 255, 0, -1, -1);

    // 지도 이미지 바닥
    push();
    rotateX(HALF_PI);
    texture(img);
    plane(planeSize, planeSize);
    pop();

    // 막대 + 라벨
    for (let city of cities) {
        city.currentH = lerp(city.currentH, city.targetH, 0.05);
        const h = city.currentH;

        // 막대
        push();
        translate(city.x, -h / 2, city.z);
        ambientMaterial(200, 100, 200);
        box(20, h, 20);
        pop();

        // 텍스트
        push();
        translate(city.x, -h - 10, city.z);
        fill(0);
        text(city.region, 0, 0);
        pop();
    }
}
