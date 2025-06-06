let data;
let margin = 60;
let slider;

function preload() {
  loadJSON("photosynthesis_vs_co2.json", (json) => {
    data = json;
  });
}

function setup() {
  createCanvas(800, 500);
  slider = createSlider(0, 1200, 420, 1); // CO2 concentration slider
  slider.position(100, height + 10);
  slider.style('width', '600px');
}

function draw() {
  background(255);
  if (!data) return;

  drawAxes();

  let minCO2 = 0;
  let maxCO2 = 1200;
  let minRate = 0;
  let maxRate = data.fit_params.Vmax * 1.1;

  // Static CO2 markers for context
  let cityCO2 = {
    "Seoul": 420,
    "Jeju": 390,
    "Ulsan": 450
  };

  strokeWeight(1);
  for (let city in cityCO2) {
    let cx = map(cityCO2[city], minCO2, maxCO2, margin, width - margin);
    stroke(200);
    line(cx, margin, cx, height - margin);
    noStroke();
    fill(100);
    textAlign(CENTER);
    text(city + "\n" + cityCO2[city] + " ppm", cx, height - margin + 30);
  }

  // Michaelis-Menten curve
  stroke(255, 0, 0);
  strokeWeight(2);
  noFill();
  beginShape();
  for (let pt of data.fit_curve) {
    let x = map(pt.CO2_ppm, minCO2, maxCO2, margin, width - margin);
    let y = map(pt.rate, minRate, maxRate, height - margin, margin);
    vertex(x, y);
  }
  endShape();

  // Experimental data points
  fill(0, 100, 255);
  noStroke();
  for (let pt of data.data_points) {
    let x = map(pt.CO2_ppm, minCO2, maxCO2, margin, width - margin);
    let y = map(pt.rate, minRate, maxRate, height - margin, margin);
    ellipse(x, y, 8, 8);
  }

  // Interactive point from slider
  let co2Val = slider.value();
  let rateVal = michaelisMenten(co2Val, data.fit_params.Vmax, data.fit_params.Km);
  let x = map(co2Val, minCO2, maxCO2, margin, width - margin);
  let y = map(rateVal, minRate, maxRate, height - margin, margin);
  fill(0);
  stroke(0);
  ellipse(x, y, 10, 10);
  noStroke();
  textAlign(CENTER);
  textSize(14);
  text("CO₂: " + co2Val + " ppm\nRate: " + rateVal.toFixed(2), x, y - 20);
}

function drawAxes() {
  stroke(0);
  strokeWeight(1);
  line(margin, margin, margin, height - margin);
  line(margin, height - margin, width - margin, height - margin);

  fill(0);
  noStroke();
  textSize(14);
  textAlign(CENTER);
  text("CO₂ Concentration (ppm)", width / 2, height - 20);
  push();
  translate(20, height / 2);
  rotate(-PI / 2);
  text("Photosynthesis Rate (µmol CO₂ m⁻² s⁻¹)", 0, 0);
  pop();
}

function michaelisMenten(C, Vmax, Km) {
  return (Vmax * C) / (Km + C);
}
