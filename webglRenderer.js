let gl, img;
const planeSize = 800;
export function preloadWebGL() {
  img = loadImage('./data/Layer1.png');      // 지형 텍스처
}

/**
 * WebGL 캔버스 초기화 (setup 단계)
 */
export function setupWebGL() {
  // WEBGL 모드 캔버스 생성
  createCanvas(planeSize, planeSize, WEBGL)
    .style('position', 'absolute');

  // 내부 WebGL 컨텍스트 저장 (worldToScreen에 사용)
  gl = this._renderer;

  // 기본 텍스트 속성
  textSize(12);
  textAlign(CENTER, CENTER);
  noStroke();
  angleMode(RADIANS);
}

/**
 * 매 프레임 WebGL 씬 그리기 (draw 단계)
 * @param {Array} cities  // [{ x, z, currentTempH, targetTempH, currentRainH, targetRainH, region }, ...]
 */
export function drawWebGL(cities) {
  // 배경색
  background(104, 194, 217);

  // 카메라 컨트롤 (마우스 드래그 / 휠 줌)
  orbitControl();

  // 조명 세팅
  ambientLight(150);
  directionalLight(255, 255, 255, 0, -1, -1);

  // 지형 평면 (지도 텍스처)
  push();
  rotateX(HALF_PI);
  texture(img);
  plane(planeSize, planeSize);
  pop();

  // 데이터 막대 렌더링
  for (let c of cities) {
    // 부드러운 보간
    c.currentTempH = lerp(c.currentTempH, c.targetTempH, 0.05);
    c.currentRainH = lerp(c.currentRainH, c.targetRainH, 0.05);

    // 온도 막대 (오렌지 톤)
    push();
    translate(c.x - 15, -c.currentTempH / 2, c.z);
    ambientMaterial(240, 117, 24);
    box(15, c.currentTempH, 15);
    pop();

    // 강수 막대 (그린 톤)
    push();
    translate(c.x + 15, -c.currentRainH / 2, c.z);
    ambientMaterial(98, 177, 112);
    box(15, c.currentRainH, 15);
    pop();

    // 지역명 텍스트
    push();
    translate(c.x, -max(c.currentTempH, c.currentRainH) - 10, c.z);
    fill(0);
    text(c.region, 0, 0);
    pop();
  }
}

/**
 * WebGL 3D 좌표 → 2D 스크린 좌표 변환
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @returns {{x: number, y: number}}
 */
export function worldToScreen(x, y, z) {
  const mv = gl.uMVMatrix.mat4;
  const p  = gl.uPMatrix.mat4;
  const v  = [x, y, z, 1];

  // 모델뷰 변환
  const mvv = [
    mv[0]*v[0] + mv[4]*v[1] + mv[8]*v[2]  + mv[12]*v[3],
    mv[1]*v[0] + mv[5]*v[1] + mv[9]*v[2]  + mv[13]*v[3],
    mv[2]*v[0] + mv[6]*v[1] + mv[10]*v[2] + mv[14]*v[3],
    mv[3]*v[0] + mv[7]*v[1] + mv[11]*v[2] + mv[15]*v[3]
  ];

  // 투영 변환
  const clip = [
    p[0]*mvv[0] + p[4]*mvv[1] + p[8]*mvv[2]  + p[12]*mvv[3],
    p[1]*mvv[0] + p[5]*mvv[1] + p[9]*mvv[2]  + p[13]*mvv[3],
    p[2]*mvv[0] + p[6]*mvv[1] + p[10]*mvv[2] + p[14]*mvv[3],
    p[3]*mvv[0] + p[7]*mvv[1] + p[11]*mvv[2] + p[15]*mvv[3]
  ];

  // NDC → 스크린 좌표
  const ndcX = clip[0] / clip[3];
  const ndcY = clip[1] / clip[3];

  return {
    x: ( ndcX * 0.5 + 0.5 ) * width,
    y: ( 1 - (ndcY * 0.5 + 0.5) ) * height
  };
}
