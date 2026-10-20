// 定義 6 個天氣問題與選項的陣列
let questions = [];

// 定義目前被拖曳選項的索引 (-1 代表沒有選擇任何項目)
let draggedIndex = -1;

// 紀錄滑鼠點擊時相對於選項左上角的偏移量，避免拖曳時跳動
let offsetX = 0;
let offsetY = 0;

// 定義交卷按鈕
let submitButton;

// 儲存計算後的總成績
let finalScore = null;

// 是否顯示成績結果的開關
let showResults = false;

// 儲存彩帶特性的陣列
let confettiParticles = [];

function setup() {
  // 建立與瀏覽器視窗一樣大的全螢幕畫布
  createCanvas(windowWidth, windowHeight);

  // 初始化 6 個天氣問題與選項的位置
  initQuestions();

  // 建立「交卷看成績」按鈕
  submitButton = createButton('交卷看成績');
  
  // 設定按鈕樣式
  submitButton.style('font-size', '18px');
  submitButton.style('padding', '12px 24px');
  submitButton.style('background-color', '#4CAF50');
  submitButton.style('color', 'white');
  submitButton.style('border', 'none');
  submitButton.style('border-radius', '8px');
  submitButton.style('cursor', 'pointer');
  submitButton.style('box-shadow', '0px 4px 6px rgba(0,0,0,0.1)');
  
  // 綁定按鈕點擊事件，點擊後觸發 calculateScore 函數
  submitButton.mousePressed(calculateScore);
  
  // 設定按鈕在畫面上的位置
  positionButton();
}

function draw() {
  // 設定背景為舒適的淺藍色
  background(240, 248, 255);

  // 繪製頂部標題與說明文字
  drawHeader();

  // 繪製上方的 6 個天氣目標框 (GIF/圖片預留區)
  drawDropZones();

  // 繪製下方的 6 個可拖曳文字選項
  drawDraggableOptions();

  // 如果已點擊交卷，顯示成績結果
  if (showResults) {
    displayScoreResult();

    // 當成績高於 60% 時，更新並繪製彩帶動畫效果
    if (finalScore > 60) {
      updateAndDrawConfetti();
    }
  }
}

// 初始化 6 道天氣題目與選項資料
function initQuestions() {
  let cols = 3; // 每列顯示 3 個
  let startX = width * 0.08;
  let startYImg = height * 0.18;
  let startYOpt = height * 0.62;
  let spacingX = width * 0.29;
  let spacingYImg = height * 0.20;
  let spacingYOpt = height * 0.11;

  // 6 個基本天氣題目
  let weatherData = [
    { name: "晴天 (Sunny)", hint: "萬里無雲，陽光普照 ☀️" },
    { name: "雨天 (Rainy)", hint: "天空降水，出門記得帶傘 🌧️" },
    { name: "陰天 (Cloudy)", hint: "天空佈滿雲層，不見太陽 ☁️" },
    { name: "下雪 (Snowy)", hint: "氣溫極低，降落白色雪花 ❄️" },
    { name: "刮風 (Windy)", hint: "空氣快速流動，樹枝搖晃 💨" },
    { name: "雷雨 (Thunderstorm)", hint: "伴隨閃電與巨大雷聲 🌩️" }
  ];

  questions = []; // 清空陣列

  for (let i = 0; i < 6; i++) {
    let r = Math.floor(i / cols);
    let c = i % cols;

    // 計算目標放置框的位置與尺寸
    let targetX = startX + c * spacingX;
    let targetY = startYImg + r * spacingYImg;
    let targetW = width * 0.25;
    let targetH = height * 0.16;

    // 計算預設選項的位置與尺寸
    let optX = startX + c * spacingX;
    let optY = startYOpt + (i >= 3 ? spacingYOpt : 0);
    let optW = width * 0.25;
    let optH = height * 0.08;

    questions.push({
      id: i,
      title: weatherData[i].name,
      hint: weatherData[i].hint,
      // 目標區域座標與大小
      target: { x: targetX, y: targetY, w: targetW, h: targetH },
      // 可拖曳選項當前位置
      currentX: optX,
      currentY: optY,
      // 預設原始位置（用於未放對時彈回）
      defaultX: optX,
      defaultY: optY,
      w: optW,
      h: optH,
      // 記錄放置在哪個目標區 (-1 代表尚未放置)
      placedInTarget: -1
    });
  }
}

// 繪製標題列
function drawHeader() {
  push();
  textAlign(CENTER, CENTER);
  fill(25, 50, 90);
  textSize(Math.min(width, height) * 0.035);
  textStyle(BOLD);
  text("【氣象小學堂】基本天氣拖曳測驗", width / 2, height * 0.06);

  textSize(Math.min(width, height) * 0.018);
  textStyle(NORMAL);
  fill(80, 100, 130);
  text("請將下方文字拖曳至上方對應的天氣提示框中，完成後點擊「交卷看成績」！", width / 2, height * 0.11);
  pop();
}

// 繪製上方放置目標區
function drawDropZones() {
  for (let i = 0; i < questions.length; i++) {
    let t = questions[i].target;

    push();
    stroke(160, 190, 225);
    strokeWeight(2);
    fill(255, 255, 255, 230);
    rect(t.x, t.y, t.w, t.h, 12); // 繪製圓角外框

    // 提示文字（此處可作為 GIF 動畫或圖片顯示區）
    noStroke();
    fill(40, 80, 120);
    textSize(15);
    textAlign(CENTER, CENTER);
    text(`[ 天氣 GIF / 動畫區域 #${i + 1} ]\n\n${questions[i].hint}`, t.x + t.w / 2, t.y + t.h / 2);
    pop();
  }
}

// 繪製下方可拖曳選項
function drawDraggableOptions() {
  for (let i = 0; i < questions.length; i++) {
    let q = questions[i];

    // 若該項目正在被拖曳，跟隨滑鼠移動
    if (draggedIndex === i) {
      q.currentX = mouseX - offsetX;
      q.currentY = mouseY - offsetY;
    }

    push();
    // 判斷滑鼠是否懸停或拖曳中
    if (isMouseOver(q) || draggedIndex === i) {
      stroke(33, 150, 243);
      strokeWeight(3);
      fill(225, 245, 254);
    } else {
      stroke(200, 215, 230);
      strokeWeight(1.5);
      fill(255, 255, 255);
    }

    rect(q.currentX, q.currentY, q.w, q.h, 10);

    // 繪製選項名稱
    noStroke();
    fill(30, 30, 30);
    textSize(16);
    textAlign(CENTER, CENTER);
    text(q.title, q.currentX + q.w / 2, q.currentY + q.h / 2);
    pop();
  }
}

// 判斷滑鼠是否落在特定選項範圍內
function isMouseOver(q) {
  return (
    mouseX >= q.currentX &&
    mouseX <= q.currentX + q.w &&
    mouseY >= q.currentY &&
    mouseY <= q.currentY + q.h
  );
}

// 滑鼠按下事件：觸發抓取拖曳
function mousePressed() {
  for (let i = 0; i < questions.length; i++) {
    let q = questions[i];
    if (isMouseOver(q)) {
      draggedIndex = i;
      offsetX = mouseX - q.currentX;
      offsetY = mouseY - q.currentY;

      // 被重新抓取時，先解除綁定
      if (q.placedInTarget !== -1) {
        q.placedInTarget = -1;
      }
      break;
    }
  }
}

// 滑鼠放開事件：判定是否放進目標區
function mouseReleased() {
  if (draggedIndex !== -1) {
    let q = questions[draggedIndex];
    let matched = false;

    for (let j = 0; j < questions.length; j++) {
      let t = questions[j].target;
      let centerX = q.currentX + q.w / 2;
      let centerY = q.currentY + q.h / 2;

      // 判斷中心點是否落入目標區域
      if (
        centerX >= t.x &&
        centerX <= t.x + t.w &&
        centerY >= t.y &&
        centerY <= t.y + t.h
      ) {
        // 對齊並吸附至目標框中心位置
        q.currentX = t.x + (t.w - q.w) / 2;
        q.currentY = t.y + (t.h - q.h) / 2;
        q.placedInTarget = j;
        matched = true;
        break;
      }
    }

    // 若未放入任何目標區，自動彈回原始位置
    if (!matched) {
      q.currentX = q.defaultX;
      q.currentY = q.defaultY;
      q.placedInTarget = -1;
    }

    draggedIndex = -1; // 清空拖曳狀態
  }
}

// 計算測驗成績
function calculateScore() {
  let correctCount = 0;

  // 檢查 placement 是否正確（選項 ID 是否與放置的目標 ID 一致）
  for (let i = 0; i < questions.length; i++) {
    if (questions[i].placedInTarget === i) {
      correctCount++;
    }
  }

  // 計算百分比
  finalScore = (correctCount / questions.length) * 100;
  showResults = true;

  // 若分數高於 60%，產生彩帶
  if (finalScore > 60) {
    initConfetti();
  }
}

// 顯示成績結果
function displayScoreResult() {
  push();
  rectMode(CENTER);
  textAlign(CENTER, CENTER);

  // 繪製半透明深色背景框
  fill(0, 0, 0, 200);
  noStroke();
  rect(width / 2, height * 0.86, width * 0.45, height * 0.08, 12);

  // 顯示分數與評語
  fill(255);
  textSize(22);
  textStyle(BOLD);
  let statusText = finalScore > 60 ? "🎉 恭喜通過測驗！" : "💪 再接再厲！";
  text(`總成績：${finalScore.toFixed(0)} 分 (${statusText})`, width / 2, height * 0.86);
  pop();
}

// 初始化彩帶粒子
function initConfetti() {
  confettiParticles = [];
  for (let i = 0; i < 120; i++) {
    confettiParticles.push({
      x: random(width),
      y: random(-height, 0),
      size: random(8, 14),
      color: color(random(255), random(255), random(255)),
      speedY: random(2, 5),
      speedX: random(-1.5, 1.5),
      rotation: random(TWO_PI),
      rotationSpeed: random(0.02, 0.08)
    });
  }
}

// 更新並繪製彩帶效果
function updateAndDrawConfetti() {
  push();
  for (let i = 0; i < confettiParticles.length; i++) {
    let p = confettiParticles[i];

    p.y += p.speedY;
    p.x += p.speedX + sin(frameCount * 0.03) * 0.5;
    p.rotation += p.rotationSpeed;

    // 超出畫面下方時，重新從頂部落下
    if (p.y > height) {
      p.y = random(-40, 0);
      p.x = random(width);
    }

    push();
    translate(p.x, p.y);
    rotate(p.rotation);
    fill(p.color);
    noStroke();
    rect(0, 0, p.size, p.size * 0.6, 2);
    pop();
  }
  pop();
}

// 視窗大小變更時的響應式調整
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initQuestions();
  positionButton();
}

// 按鈕位置動態置中
function positionButton() {
  if (submitButton) {
    submitButton.position(width / 2 - submitButton.width / 2, height * 0.75);
  }
}