var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');

var paddleHeight = 20;
var paddleWidth = 70;
var paddleX = (canvas.width - paddleWidth) / 2;
var paddleSpeed = 30;

var x = canvas.width / 2;
var y = canvas.height - (paddleHeight + 2);
var dx = 0;
var dy = -10;

var missileRadius = 5;
var missileSpeed = 10;
var gameSpeed = 250;

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

var alienTopLeftX = alienWidth + 10;
var alienTopRightX = alienColumnCount * (alienWidth + alienPadding);
var alienTopLeftY = 10;
var alienDx = -5;
var alienDy = alienHeight / 2;

var highScore;
var score = 0;
var numAliensHit = 0;
var lives = 3;

var aliens = [];
var missileStatus = 0;
var alienMissileStatus = 0;
var missileX;
var missileY;
var alienMissileHeight = 10;

function setUpAliens() {
  alienTopLeftX = alienWidth + 10;
  alienTopRightX = alienColumnCount * (alienWidth + alienPadding);
  alienTopLeftY = 10;
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

function clearAliens() {
  ctx.clearRect(10, 10, canvas.width, alienRowCount *
    (alienHeight + alienPadding));
}

function drawAliens() {
  clearAliens();
  alienTopLeftX += alienDx;
  alienTopRightX = alienTopLeftX + alienColumnCount *
                    (alienWidth + alienPadding);
  if ((alienTopLeftX < alienWidth) ||
    (alienTopRightX > (canvas.width - alienWidth))) {
    alienDx = -alienDx;
    alienTopLeftY += alienDy;
  } else {
    //console.log(alienTopLeftX);
  }

  var columnToFireFrom = Math.floor(Math.random() * alienRowCount);
  //console.log('Firing Column :' + columnToFireFrom);
  //console.log('Alien Missile Status :' + alienMissileStatus);
  for (column = 0; column < alienColumnCount; column++) {
    for (row = 0; row < alienRowCount; row++) {
      if (aliens[column][row].status == 1) {
        var alienX = (column * (alienWidth + alienPadding)) +
                      alienOffsetLeft + alienTopLeftX;
        var alienY = (row * (alienHeight + alienPadding)) +
                      alienOffsetTop + alienTopLeftY;
        setAlienColourAndScore(row);

        aliens[column][row].x = alienX;
        aliens[column][row].y = alienY;
        aliens[column][row].score = alienScore;
        if ((alienMissileStatus === 0) && (row === columnToFireFrom) &&
            (aliens[column][row].status == 1)) {
          console.log('Alien [' + column + '][' + row + '] is firing');
          fireAlienMissile(alienX, alienY);
        }

        if (alienY >= (canvas.height - alienHeight)) {
          alienDy = 0;
        }
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
            gameSpeed -= 10;
          }
        }
      }
      if (alien.status == 1) {
        if (alien.x >= paddleX && alien.x <= (paddleX + paddleWidth) &&
           (alien.y + alienHeight) >= (canvas.height - paddleHeight)) {
          alert('GAME OVER - The Aliens Have Landed');
          location.reload();
          //lives--;
          //setInterval(draw, 500);
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
  ctx.drawImage(img, paddleX, canvas.height - paddleHeight,
    paddleWidth, paddleHeight);
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
    //console.log('Fire button pressed');
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
  else if (e.keyCode == 32) {
    firePressed = false;
  }
}

function mouseMoveHandler(e) {
  var relativeX = e.clientX - canvas.offsetLeft;
  if (relativeX > 0 && relativeX < canvas.width) {
    paddleX = relativeX - paddleWidth / 2;
  }
}

function fireAlienMissile(alienX, alienY) {
  alienMissileStatus = 1;
  missileX = alienX + (alienWidth / 2);
  missileY = alienY + alienHeight;
}

function drawAlienMissile() {
  if (alienMissileStatus === 1) {
    ctx.beginPath();
    ctx.rect(missileX, missileY, 2, alienMissileHeight);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.closePath();
  }
}

function eraseAlienMissile() {
  alienMissileStatus = 0;
}

function hitByAlien() {
  if (((missileY + alienMissileHeight) >= (canvas.height)) &&
    (missileX >= paddleX) && (missileX <= (paddleX + paddleWidth))) { 
    console.log("HIT!!!!!!");
    eraseAlienMissile();
    return true;
  }
}

function fire() {
  missileStatus = 1;
  x = paddleX + (paddleWidth / 2) - 2;
  y = canvas.height - (paddleHeight + 2);
}

function drawMissile() {
  if (missileStatus === 1) {
    ctx.beginPath();
    ctx.rect(x, y, 2, 10);
    ctx.fillStyle = '#ffff00';
    ctx.fill();
    ctx.closePath();
  }
}

function eraseMissile() {
  missileStatus = 0;
  x = paddleX + (paddleWidth / 2);
  y = canvas.height - (paddleHeight + 2);
}

function drawPlayerExplosion() {
  var img = document.createElement('img');
  img.src = 'public/images/alien_hit.png';
  ctx.drawImage(img, paddleX, canvas.height - paddleHeight,
    paddleWidth, paddleHeight);
}

function drawAlienExplosion() {

}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawMissile();
  drawAlienMissile();
  drawAliens();
  drawPaddle();
  drawScore();
  drawLives();
  updateHighScore();
  drawHighScore();

  collisionDetection();
  if (hitByAlien() == true) {
    lives--;
    drawLives();
    drawPlayerExplosion();
  }

  if (lives === 0) {
    alert('Game Over');
    //newGame();
    location.reload();
  }

  if (y <= 0) {
    eraseMissile();
  }

  if (missileY >= canvas.height) {
    eraseAlienMissile();
  }

  if (rightPressed && paddleX < canvas.width - paddleWidth) {
    paddleX += paddleSpeed;
  }
  else if (leftPressed && paddleX > 0) {
    paddleX -= paddleSpeed;
  }

  x += dx;
  y += dy;
  missileY += 5;

  //requestAnimationFrame(draw);
  //alienTopLeftX += alienDx;
  //console.log("topLeft: ", alienTopLeftX);
  //console.log("topRight: ", alienTopRightX);
  //setInterval(drawAliens, 300);
}

var newGame = function () {
  lives = 3;
  score = 0;
  setUpAliens();
  setInterval(draw, gameSpeed);
  //draw();
};

newGame();
