// sketch.js

let rawData = [];
let stations = [];
let table;

const CANVAS_W = 600;
const CANVAS_H = 800;
const HEIGHT_SCALE = 10;

function preload() {
    // CSV 헤더가 ['x','y','temp'] 형태인지 반드시 확인하세요.
    // 파일 경로는 프로젝트 폴더 구조에 맞게 조정합니다.
    table = loadTable('./data/temperature_1.csv', 'csv', 'header');
}

function setup() {
    createCanvas(CANVAS_W, CANVAS_H, WEBGL);
    noStroke();
    angleMode(RADIANS);

    // --- 1. 로드된 테이블 상태 확인 (로그 출력)
    print("🔍 Table Loaded? rowCount =", table.getRowCount());
    print("🔍 Columns =", table.getColumnCount(), ", Column Names =", table.columns);
    // -> 여기에서 ['x','y','temp']로 나오는지 확인합니다.

    // --- 2. CSV 행(row) 순회하여 rawData에 저장 (단, 유효한 값만)
    let skippedCount = 0;
    for (let r = 0; r < table.getRowCount(); r++) {
        // 'x', 'y', 'temp' 컬럼이 실제로 존재하는지 확인
        let rawX = table.getString(r, 'x');
        let rawY = table.getString(r, 'y');
        let rawTemp = table.getString(r, 'temp');

        // 컬럼 자체가 undefined라면(헤더명이 잘못되었거나 로드에 실패한 경우)
        if (rawX === undefined || rawY === undefined || rawTemp === undefined) {
            skippedCount++;
            continue;
        }

        // 빈 문자열(즉, 측정값이 없는 경우)도 skip
        if (rawX.trim() === "" || rawY.trim() === "" || rawTemp.trim() === "") {
            skippedCount++;
            continue;
        }

        // 숫자로 변환
        let xCoord = float(rawX);
        let yCoord = float(rawY);
        let temp = float(rawTemp);

        // 숫자로 변환이 안 된(NaN) 경우도 skip
        if (isNaN(xCoord) || isNaN(yCoord) || isNaN(temp)) {
            skippedCount++;
            continue;
        }

        // 유효한 데이터만 rawData에 추가
        rawData.push({ x: xCoord, y: yCoord, temp });
    }

    // 스킵된 행 개수 로그 (너무 많지 않을 경우 확인용)
    if (skippedCount > 0) {
        print("⚠️ skipped rows (invalid or blank):", skippedCount);
    }

    // --- 3. rawData가 비어 있으면 더 이상 진행하지 않음
    if (rawData.length === 0) {
        print("❌ 유효한 데이터가 하나도 없습니다. CSV 경로, 헤더, 데이터 값을 확인하세요.");
        noLoop();
        return;
    }

    // --- 4. rawData를 순회하며 stations 배열에 저장
    for (let pt of rawData) {
        stations.push({
            x: pt.x,                    // CSV의 x 값을 그대로 캔버스 좌표로 사용
            y: pt.y,                    // CSV의 y 값을 그대로 캔버스 좌표로 사용
            temp: pt.temp,
            currentHeight: 0,
            targetHeight: pt.temp * HEIGHT_SCALE
        });
    }
}

function draw() {
    background(255);

    // WEBGL 모드 기준: 좌상단(0,0) → translate, 위에서 기울여 내려다보는 시점
    rotateX(PI / 3);
    translate(-CANVAS_W / 2, -CANVAS_H / 2, 0);

    ambientLight(150);
    directionalLight(255, 255, 255, 0, -1, -1);

    // --- 5. stations에 있는 좌표에만 3D 기둥 그리기
    for (let s of stations) {
        // 부드러운 애니메이션 효과: currentHeight → targetHeight
        s.currentHeight = lerp(s.currentHeight, s.targetHeight, 0.027);

        // 기둥(바) 그리기
        push();
        translate(s.x, s.y, s.currentHeight / 2);
        ambientMaterial(200, 100, 200);
        box(8, 8, s.currentHeight);
        pop();

        // (선택) 온도 레이블 표시
        push();
        translate(s.x, s.y, s.currentHeight + 5);
        rotateZ(-PI / 4);
        fill(0);
        textSize(8);
        text(nf(s.temp, 1, 1) + '°', 0, 0);
        pop();
    }
}
