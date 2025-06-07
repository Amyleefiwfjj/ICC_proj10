let img, table, font;
let cities = [];
let currentIndex = 0;

const monthCols = [
    'Jun-24', 'Jul-24', 'Aug-24', 'Sep-24', 'Oct-24', 'Nov-24',
    'Dec-24', 'Jan-25', 'Feb-25', 'Mar-25', 'Apr-25', 'May-25'
];

function preload() {
    font = loadFont('./data/Title.ttf');
    table = loadTable('./data/data.csv', 'csv', 'header');
    img = loadImage('./data/Layer1.jpg');
}

function setup() {
    createCanvas(800, 800, WEBGL);
    noStroke();
    angleMode(RADIANS);

    textFont(font);
    textSize(12);
    textAlign(CENTER, CENTER);

    // CSV 파싱하여 cities 배열 생성
    for (let r = 0; r < table.getRowCount(); r++) {
        const name = table.getString(r, '지점명');
        const lat = table.getNum(r, '위도');
        const lon = table.getNum(r, '경도');
        const temps = monthCols.map(c => table.getNum(r, c));
        const avg = table.getNum(r, '1년_평균기온(℃)');

        const x = map(lon, 124, 132, -400, 400);
        const y = map(lat, 43, 33, -400, 400);

        cities.push({ name, x, y, temps, avg, currentH: 0, targetH: 0 });
    }

    // 버튼 생성
    for (let i = 0; i <= 12; i++) {
        const label = i < 12 ? `${i + 1}월` : '평균';
        createButton(label)
            .position(10 + i * 45, height + 10)
            .mousePressed(() => selectMonth(i));
    }

    selectMonth(0);
}

function selectMonth(idx) {
    currentIndex = idx;
    for (let city of cities) {
        const value = idx < 12 ? city.temps[idx] : city.avg;
        city.targetH = value * 5;
    }
}

function draw() {
    background(200);
    orbitControl();
    ambientLight(150);
    directionalLight(255, 255, 255, 0, -1, -1);

    // 수평 바닥 plane
    push();
    rotateX(-HALF_PI);
    texture(img);
    plane(800, 800);
    pop();

    // 막대그래프 및 라벨
    for (let city of cities) {
        city.currentH = lerp(city.currentH, city.targetH, 0.03);

        // 막대
        push();
        translate(city.x, city.y, city.currentH / 2);
        ambientMaterial(200, 100, 200);
        box(20, 20, city.currentH);
        pop();

        // 텍스트
        push();
        translate(city.x, city.y, city.currentH + 15);
        fill(0);
        text(city.name, 0, 0);
        pop();
    }
}
