// Hand Pose Detection with ml5.js
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/hand-pose

let video;
let handPose;
let hands = [];
let circleX, circleY; // 圓的座標
const circleSize = 100; // 圓的大小

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

  // 確保至少檢測到一隻手
  if (hands.length > 0) {
    for (let hand of hands) {
      if (hand.confidence > 0.1) {
        // 定義每組關鍵點的範圍
        const ranges = [
          [0, 4],  // 0-4
          [5, 8],  // 5-8
          [9, 12], // 9-12
          [13, 16],// 13-16
          [17, 20] // 17-20
        ];

        // 繪製每組關鍵點的線條
        for (let range of ranges) {
          stroke(0, 255, 0); // 綠色線條
          strokeWeight(2);   // 線條粗細
          noFill();

          beginShape();
          for (let i = range[0]; i <= range[1]; i++) {
            let keypoint = hand.keypoints[i];
            vertex(keypoint.x, keypoint.y); // 添加每個關鍵點作為頂點
          }
          endShape();
        }

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
        let d = dist(indexFinger.x, indexFinger.y, circleX, circleY);
        if (d < circleSize / 2) {
          // 如果碰觸到圓，讓圓跟隨食指移動
          circleX = indexFinger.x;
          circleY = indexFinger.y;
        }
      }
    }
  }
}
