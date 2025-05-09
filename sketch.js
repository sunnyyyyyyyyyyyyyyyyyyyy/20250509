// Hand Pose Detection with ml5.js
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/hand-pose

let video;
let handPose;
let hands = [];
let circleX, circleY; // 圓的座標
const circleSize = 100; // 圓的大小
let indexTrail = []; // 食指的紅色軌跡
let thumbTrail = []; // 大拇指的綠色軌跡
let thumbTouching = false; // 大拇指是否接觸圓

function preload() {
  // Initialize HandPose model with flipped video input
  handPose = ml5.handPose({ flipped: true });
}

function mousePressed() {
  console.log(hands);
}

function gotHands(results) {
  hands = results;
}

function setup() {
  createCanvas(640, 480); // 產生一個畫布，640*480
  video = createCapture(VIDEO, { flipped: true });
  video.hide();

  // Start detecting hands
  handPose.detectStart(video, gotHands);

  // 初始化圓的位置
  circleX = width / 2;
  circleY = height / 2;
}

function draw() {
  image(video, 0, 0);

  // 繪製圓
  fill(0, 0, 255, 150); // 半透明藍色
  noStroke();
  ellipse(circleX, circleY, circleSize);

  // 繪製食指的紅色軌跡
  stroke(255, 0, 0); // 紅色
  strokeWeight(2);
  noFill();
  beginShape();
  for (let pos of indexTrail) {
    vertex(pos.x, pos.y);
  }
  endShape();

  // 繪製大拇指的綠色軌跡
  stroke(0, 255, 0); // 綠色
  strokeWeight(10); // 線條粗細為 10
  noFill();
  beginShape();
  for (let pos of thumbTrail) {
    vertex(pos.x, pos.y);
  }
  endShape();

  // 確保至少檢測到一隻手
  if (hands.length > 0) {
    for (let hand of hands) {
      if (hand.confidence > 0.1) {
        // 繪製每個關鍵點
        for (let i = 0; i < hand.keypoints.length; i++) {
          let keypoint = hand.keypoints[i];

          // 根據左右手設置顏色
          if (hand.handedness == "Left") {
            fill(255, 0, 255); // 左手為紫色
          } else {
            fill(255, 255, 0); // 右手為黃色
          }

          noStroke();
          circle(keypoint.x, keypoint.y, 16); // 繪製關鍵點
        }

        // 檢測食指（編號 8）是否碰觸圓
        let indexFinger = hand.keypoints[8];
        let dIndex = dist(indexFinger.x, indexFinger.y, circleX, circleY);
        if (dIndex < circleSize / 2) {
          // 如果碰觸到圓，讓圓跟隨食指移動
          circleX = indexFinger.x;
          circleY = indexFinger.y;

          // 記錄食指的軌跡
          indexTrail.push({ x: indexFinger.x, y: indexFinger.y });
        }

        // 檢測大拇指（編號 4）是否碰觸圓
        let thumb = hand.keypoints[4];
        let dThumb = dist(thumb.x, thumb.y, circleX, circleY);
        if (dThumb < circleSize / 2) {
          // 如果碰觸到圓，讓圓跟隨大拇指移動
          circleX = thumb.x;
          circleY = thumb.y;

          // 記錄大拇指的軌跡
          thumbTrail.push({ x: thumb.x, y: thumb.y });
          thumbTouching = true;
        } else {
          thumbTouching = false;
        }
      }
    }
  }

  // 如果大拇指離開圓，停止記錄新的軌跡
  if (!thumbTouching) {
    thumbTrail = thumbTrail; // 保留已畫出的軌跡
  }
}
