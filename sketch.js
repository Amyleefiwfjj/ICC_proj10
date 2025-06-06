const COLS = 100, ROWS = 100;
const CELL = 8, HEIGHT_SCALE = 8;
let monthTables = new Array(12);   // 인덱스 0-11 미리 확보
let grids = [];
let curMonth = 0;
let minT = -15, maxT = 35;

/* ---------- preload ---------- */
function preload() {
    for (let m = 1; m <= 12; m++) {
        // m-1 자리에 바로 대입 (push 사용 X)
        monthTables[m - 1] = loadTable(
            `./data/temperature_${m}.csv`,
            'csv',
            'header'
        );
    }
}
// setup() 위쪽에 임시 디버그 코드
console.log('rows in tbl 0 =', monthTables[0].getRowCount());
console.log('first 5 rows');
for (let r = 0; r < 5; r++) {
    console.log(monthTables[0].getRow(r).arr);   // 각 행의 원본 배열 확인
}
// ===== 설정 =====
function setup() {
    createCanvas(COLS * CELL + 200, ROWS * CELL + 100, WEBGL);
    noStroke();
    // CSV → 3차원 배열로 변환
    for (let m = 0; m < 12; m++) {
        const tbl = monthTables[m];
        let grid = Array.from(Array(ROWS), () => Array(COLS).fill(0));
        for (let r = 0; r < tbl.getRowCount(); r++) {
            const i = tbl.getNum(r, 'x');
            const j = tbl.getNum(r, 'y');
            const t = tbl.getNum(r, 'temp');
            grid[j][i] = t;
        }
        grids.push(grid);
    }

    // 월 선택 버튼 생성
    const panel = select('#panel');
    for (let m = 0; m < 12; m++) {
        const btn = createButton(`${m + 1}월`);
        btn.parent(panel);
        btn.mousePressed(() => curMonth = m);
    }

    // 기본 조명
    ambientLight(120);
    directionalLight(255, 255, 255, 0.3, -0.7, -0.5);
}

// ===== 매 프레임 =====
function draw() {
    background(248);
    orbitControl();               // 마우스 회전·줌

    // 맵 중앙 맞추기
    translate(-COLS * CELL / 2, -ROWS * CELL / 2, 0);

    const grid = grids[curMonth];
    for (let j = 0; j < ROWS; j++) {
        for (let i = 0; i < COLS; i++) {
            const t = grid[j][i];
            const h = map(t, minT, maxT, 1, (maxT - minT) * HEIGHT_SCALE);

            // 색상: 파랑(차가움) → 보라 → 분홍 → 빨강(더움)
            const c = lerpColor(
                color(50, 120, 255),
                color(255, 60, 100),
                map(t, minT, maxT, 0, 1)
            );

            push();
            translate(i * CELL + CELL / 2, j * CELL + CELL / 2, h / 2);
            ambientMaterial(c);
            box(CELL * 0.8, CELL * 0.8, h);
            pop();
        }
    }

    // 월 텍스트(2D-HUD)
    resetMatrix();
    fill(40);
    textSize(14);
    textAlign(LEFT, TOP);
    text(`${curMonth + 1}월 평균 기온`, 15, height - 30);
}
