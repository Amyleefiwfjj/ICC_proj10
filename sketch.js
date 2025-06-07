let img, table, font;
let cities = [];
let currentIdx = 0;
let lang = 'ko';
let unit = 'C';
const API_KEY = '';
let gl;

// 자치도 위치
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

const I18N = {
    ko: { avg: '평균', feels: '체감', rain: '강수', uv: '자외선', prep: '준비물' },
    en: { avg: 'Avg', feels: 'Feels', rain: 'Rain', uv: 'UV', prep: 'Gear' }
};

function clothingAdvice(tC) {
    if (tC >= 28) return '🍦 반팔·선크림';
    if (tC >= 22) return '👕 가벼운 옷';
    if (tC >= 16) return '👔 긴팔·얇은 겉옷';
    if (tC >= 10) return '🧥 재킷';
    return '🧣 코트·패딩';
}

function preload() {
    font = loadFont('./data/Title.ttf');
    table = loadTable('./data/data.csv', 'csv', 'header');
    img = loadImage('./data/Layer1.png');
}

function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);
    gl = this._renderer;
    textFont(font); textSize(12); textAlign(CENTER, CENTER); noStroke();
    angleMode(RADIANS);

    // CSV 파싱
    const monthsCount = table.getRowCount();
    const regions = table.columns.filter(c => c !== '일시');
    regions.forEach(region => {
        if (!(region in regionCoords)) return;
        const temps = [];
        for (let i = 0; i < monthsCount; i++) {
            const n = parseFloat(table.getString(i, region));
            temps.push(isNaN(n) ? 0 : n);
        }
        const avg = temps.reduce((a, b) => a + b, 0) / monthsCount;
        cities.push({ ...regionCoords[region], region, temps, avg, currentH: 0, targetH: 0, extra: {} });
    });

    // 월 버튼 생성
    const mb = select('#monthButtons');
    for (let i = 0; i < monthsCount; i++) {
        const lbl = table.getString(i, '일시');
        const btn = createButton(lbl).addClass('month-btn');
        btn.parent(mb);
        btn.mousePressed(() => selectMonth(i));
    }
    const avgBtn = createButton(I18N[lang].avg).addClass('month-btn');
    avgBtn.parent(mb).mousePressed(() => selectMonth('avg'));

    // 언어/단위 토글
    select('#langSel').changed(() => updateInfo());
    select('#unitSel').changed(() => updateInfo());

    selectMonth(0);
    updateInfo();
    if (API_KEY) fetchRealtime();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function draw() {
    background(188, 226, 235);
    orbitControl(); ambientLight(150);
    directionalLight(255, 255, 255, 0, -1, -1);

    push(); rotateX(HALF_PI); texture(img); plane(windowWidth, windowHeight); pop();

    cities.forEach(c => {
        c.currentH = lerp(c.currentH, c.targetH, 0.05);
        const h = c.currentH;
        push(); translate(c.x, -h / 2, c.z); ambientMaterial(200, 100, 200); box(20, h, 20); pop();
        push(); translate(c.x, -h - 10, c.z); fill(0); text(c.region, 0, 0); pop();
    });

    handleTooltip();
}

// 3D→2D 투영 헬퍼
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
    const ndcX = clip[0] / clip[3];
    const ndcY = clip[1] / clip[3];
    return { x: (ndcX * 0.5 + 0.5) * width, y: (1 - (ndcY * 0.5 + 0.5)) * height };
}

function handleTooltip() {
    const tip = select('#tooltip');
    const footer = select('#footer');
    let shown = false;
    cities.forEach(c => {
        if (shown) return;
        const pos = worldToScreen(c.x, -c.currentH / 2, c.z);
        if (dist(mouseX, mouseY, pos.x, pos.y) < 12) {
            const baseT = (currentIdx === 'avg' ? c.avg : c.temps[currentIdx]);
            const dispT = (unit === 'F' ? (baseT * 9 / 5 + 32).toFixed(1) : baseT.toFixed(1));
            let html = `<b>${c.region}</b><br>${dispT}°${unit}`;
            if (c.extra.feels !== undefined) {
                const feels = (unit === 'F' ? (c.extra.feels * 9 / 5 + 32).toFixed(1) : c.extra.feels.toFixed(1));
                html += `<br>${I18N[lang].feels}: ${feels}°${unit}`;
                html += `<br>${I18N[lang].rain}: ${c.extra.rain}%`;
                html += `<br>${I18N[lang].uv}: ${c.extra.uv}`;
            }
            html += `<br>${I18N[lang].prep}: ${clothingAdvice(baseT)}`;
            tip.html(html).style('left', pos.x + 15 + 'px').style('top', pos.y + 15 + 'px').show();
            // 하단 footer 업데이트
            footer.html(`${dispT}°${unit}`);
            shown = true;
        }
    });
    if (!shown) {
        tip.hide();
        select('#footer').html('');
    }
}

function selectMonth(idx) {
    currentIdx = idx;
    cities.forEach(c => c.targetH = ((idx === 'avg' ? c.avg : c.temps[idx]) * 5));
    updateInfo();
    select('#footer').html('');
}

function updateInfo() {
    const info = select('#info');
    const label = (currentIdx === 'avg' ? I18N[lang].avg : table.getString(currentIdx, '일시'));
    info.html(`<b>${label}</b><br>°${unit}`);
}

async function fetchRealtime() {
    for (let c of cities) {
        const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${c.lat}&lon=${c.lon}&units=metric&appid=${API_KEY}`;
        try {
            const js = await fetch(url).then(r => r.json()), cur = js.current;
            c.extra = { feels: cur.feels_like, rain: cur.pop ? Math.round(cur.pop * 100) : 0, uv: cur.uvi };
        } catch (_) { }
    }
}