var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');

var paddleHeight = 30;
var paddleWidth = 60;
var paddleX = (canvas.width - paddleWidth) / 2;

var x = canvas.width / 2;
var y = canvas.height - (paddleHeight + 2);
var dx = 0;
var dy = -2;

var alienX = 0
var alienY = 0;
var alienDx = 1;
var alienDy = 0;

var missileRadius = 5;
var missileSpeed = 2;

var rightPressed = false;
var leftPressed = false;
var firePressed = false;

var alienRowCount = 5;
var alienColumnCount = 12;
var alienWidth = 40;
var alienHeight = 30;
var alienPadding = 15;
var alienOffsetTop = 70;
var alienOffsetLeft = 15;
var alienColour;
var alienScore;
var alienImage;

var highScore;
var score = 0;
var numAliensHit = 0;
var lives = 3;

var aliens = [];
var missileStatus = 0;

function setUpAliens() {
  for (column = 0; column < alienColumnCount; column++) {
    aliens[column] = [];
    for (row = 0; row < alienRowCount; row++) {
      aliens[column][row] = { x: 0, y: 0, status: 1, score: 1 };
    }
  }
}

function setAlienColourAndScore(row) {
  switch (row) {
    case 0:
      alienScore = 50;
      alienColour = '#0200cc';
      alienImage = 'public/images/invader_3.png';
      break;
    case 1:
      alienScore = 40;
      alienColour = '#ff0002';
      alienImage = 'public/images/invader_2.png';
      break;
    case 2:
      alienScore = 30;
      alienColour = '#00ff03';
      alienImage = 'public/images/invader_2.png';
      break;
    case 3:
      alienScore = 20;
      alienColour = '#01fffe';
      alienImage = 'public/images/invader_1.png';
      break;
    case 4:
      alienScore = 10;
      alienColour = '#ffff00';
      alienImage = 'public/images/invader_1.png';
      break;
  }
}

function drawAliens() {
  for (column = 0; column < alienColumnCount; column++) {
    for (row = 0; row < alienRowCount; row++) {
      if (aliens[column][row].status == 1) {
        var alienX = (column * (alienWidth + alienPadding)) + alienOffsetLeft + alienDx;
        var alienY = (row * (alienHeight + alienPadding)) + alienOffsetTop + alienDy;
        setAlienColourAndScore(row);

        aliens[column][row].x = alienX;
        aliens[column][row].y = alienY;
        aliens[column][row].score = alienScore;

        var img = document.createElement('img');
        img.src = alienImage;
        ctx.drawImage(img, alienX, alienY, alienWidth, alienHeight);
      }
    }
  }
}

function collisionDetection() {
  for (column = 0; column < alienColumnCount; column++) {
    for (row = 0; row < alienRowCount; row++) {
      var alien = aliens[column][row];
      if (alien.status == 1 && missileStatus == 1) {
        if (x > alien.x && x < alien.x + alienWidth &&
            y > alien.y && y < alien.y + alienHeight) {
          missileStatus = 0;
          alien.status = 0;
          score += alien.score;
          numAliensHit++;
          if (numAliensHit == alienRowCount * alienColumnCount) {
            setUpAliens();
            numAliensHit = 0;
            y = canvas.height - paddleHeight;
            x = paddleX + (paddleWidth / 2);
            missileSpeed++;
          }
        }
      }
    }
  }
}

function updateHighScore() {
  var jsonString = localStorage.getItem('invadersHighScore');
  if (jsonString === null) {
    highScore = 0;
  } else {
    highScore = JSON.parse(jsonString);
  }

  if (score > highScore) {
    highScore = score;
    var jsonString = JSON.stringify(highScore);
    localStorage.setItem('invadersHighScore', jsonString);
  }
}

function drawScore() {
  ctx.font = '16px ZX-Spectrum';
  ctx.fillStyle = '#ffff00';
  ctx.fillText('Score: ' + score, 8, 20);
}

function drawLives() {
  ctx.font = '16px ZX-Spectrum';
  ctx.fillStyle = '#ffff00';
  ctx.fillText('Lives: ' + lives, canvas.width - 140, 20);
}

function drawHighScore() {
  ctx.font = '16px ZX-Spectrum';
  ctx.fillStyle = '#ffff00';
  ctx.fillText('High Score: ' + highScore, canvas.width - 600, 20);
}

function drawPaddle() {
  var img = document.createElement('img');
  img.src = 'public/images/cannon.png';
  ctx.drawImage(img, paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
}

document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);
document.addEventListener('mousemove', mouseMoveHandler, false);

function keyDownHandler(e) {
  if (e.keyCode == 39) {
    rightPressed = true;
  }
  else if (e.keyCode == 37) {
    leftPressed = true;
  }
  else if (e.keyCode == 32) {
    firePressed = true;
    console.log("Fire button pressed");
    if (missileStatus !== 1) {
      fire();
    }
  }
}

function keyUpHandler(e) {
  if (e.keyCode == 39) {
    rightPressed = false;
  }
  else if (e.keyCode == 37) {
    leftPressed = false;
  }
  else if (e.keyCode == 32){
    firePressed = false;
  }
}

function mouseMoveHandler(e) {
  var relativeX = e.clientX - canvas.offsetLeft;
  if (relativeX > 0 && relativeX < canvas.width) {
    paddleX = relativeX - paddleWidth / 2;
  }
}

function fire() {
  missileStatus = 1;
  x = paddleX + (paddleWidth / 2);
  y = canvas.height - (paddleHeight + 2);
}

function drawMissile() {
  if (missileStatus === 1) {
    ctx.beginPath();
    ctx.rect(x - 2, y, 5, 20);
    ctx.fillStyle = '#ffff00';
    ctx.fill();
    ctx.closePath();
  }
}

function eraseMissile() {
  missileStatus = 0;
  x = paddleX + (paddleWidth / 2); ;
  y = canvas.height - (paddleHeight + 2);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawMissile();
  drawAliens();
  drawPaddle();
  drawScore();
  drawLives();
  updateHighScore();
  drawHighScore();

  collisionDetection();

  if (y == 0) {
    eraseMissile();
  }

  if (rightPressed && paddleX < canvas.width - paddleWidth) {
    paddleX += 7;
  }
  else if (leftPressed && paddleX > 0) {
    paddleX -= 7;
  }

  alienX++;
  alienY++;

  x += dx;
  y += dy;

  requestAnimationFrame(draw);
}

setUpAliens();
draw();
