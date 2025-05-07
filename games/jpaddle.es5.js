title = "JPADDLE";
description = "\n[Tap]  Jump/Turn\n[Hold] Move\n";
options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 4
};
var paddle;
var balls;
var jumpCounter;
var jumpToggle;
var jumpHeight = 12;
var maxJumps = 99;
var paddleSize = 6;
var ballSpeed = 1;
var spawnInterval = 60;
function update() {
  if (!ticks) {
    paddle = vec(50, 90);
    balls = [];
    jumpCounter = 0;
    jumpToggle = 0;
  }
  if (input.isJustPressed && jumpCounter < maxJumps) {
    paddle.y -= jumpHeight / (jumpCounter + 1);
    jumpCounter++;
    jumpToggle++;
    play("jump");
  } else {
    paddle.y += difficulty * 0.1;
  }
  if (input.isPressed) {
    if (jumpCounter > 0) {
      paddle.x += difficulty * 0.5 * (jumpToggle % 2 === 1 ? 1 : -1);
    }
  }
  paddle.clamp(3, 97, 30, 110);
  color("cyan");
  rect(paddle.x - paddleSize / 2, paddle.y - 2, paddleSize, 4);
  color("black");
  balls.forEach(function (b) {
    b.pos.x += b.vel.x * ballSpeed * difficulty;
    b.pos.y += b.vel.y * ballSpeed * difficulty;
    if (b.pos.x < 0 || b.pos.x > 97) {
      b.vel.x *= -1;
      play("hit");
    }
    if (arc(b.pos, 3).isColliding.rect.cyan && b.vel.y > 0) {
      b.pos.y = paddle.y - 3;
      b.vel.y *= -1;
      addScore(99 - b.pos.y, b.pos);
      play("powerUp");
      jumpCounter -= 9;
      if (jumpCounter < 0) {
        jumpCounter = 0;
      }
    }
    if (b.pos.y > 100) {
      remove(balls, function (x) {
        return x === b;
      });
    }
  });
  if (ticks % floor(spawnInterval / difficulty) === 0) {
    balls.push({
      pos: vec(rnd(10, 90), 0),
      vel: vec(rnd(-1, 1), 1).normalize()
    });
    play("laser");
  }
  if (paddle.y > 99) {
    play("explosion");
    end();
  }
}

