title = "JUGGLING ACT";
description = "\n[Hold] Throw ball back\n[Release] Move\n";
characters = ["\n  lll\n  lll\n  ll\n  ll\n llll\nll  ll\n"];
options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  audioSeed: 1
};
var juggler;
var balls;
var nextBallSpawnTime;
var gravity = 0.02;
var throwVelocity = 2;
var jugglerVelocity = 0.36;
function update() {
  if (!ticks) {
    juggler = {
      pos: vec(50, 90),
      velX: 0,
      state: "ready"
    };
    balls = [];
    nextBallSpawnTime = 0;
  }
  var sd = sqrt(difficulty);
  if (input.isJustPressed) {
    play("select");
    juggler.state = "catch";
  } else if (input.isJustReleased) {
    juggler.state = "ready";
  }
  if (!input.isPressed) {
    var nearestBall = findNearestBall();
    if (nearestBall) {
      var moveDirection = nearestBall.pos.x > juggler.pos.x ? 1 : -1;
      juggler.velX += moveDirection * jugglerVelocity;
    }
  }
  juggler.velX *= 0.85;
  juggler.pos.x += juggler.velX * sd;
  if (juggler.pos.x < 5 && juggler.velX < 0 || juggler.pos.x > 95 && juggler.velX > 0) {
    juggler.velX *= -0.5;
  }
  color("blue");
  var handOffset = juggler.state === "catch" ? -5 : 0;
  box(juggler.pos.x - 5, juggler.pos.y + handOffset, 3, 3);
  box(juggler.pos.x + 5, juggler.pos.y + handOffset, 3, 3);
  char("a", juggler.pos, {
    mirror: {
      x: juggler.velX > 0 ? 1 : -1
    }
  });
  color("red");
  remove(balls, function (ball) {
    ball.pos.add(vec(ball.vel).mul(sd));
    ball.vel.mul(0.99);
    if (ball.pos.x < 0 && ball.vel.x < 0 || ball.pos.x > 100 && ball.vel.x > 0) {
      ball.vel.x *= -1;
    }
    if (ball.state === "falling") {
      ball.vel.y += gravity * sd;
      if (juggler.state === "catch" && ball.pos.y > juggler.pos.y - 8 && ball.pos.y < juggler.pos.y) {
        if (Math.abs(ball.pos.x - juggler.pos.x) < 10) {
          play("jump");
          ball.state = "rising";
          ball.vel.y = -throwVelocity;
          ball.vel.x = (ball.pos.x - juggler.pos.x) / 10 + rnds(0.1);
          addScore(balls.length, ball.pos);
        }
      }
    } else {
      ball.vel.y += gravity * sd;
      if (ball.vel.y >= 0) {
        ball.state = "falling";
      }
    }
    arc(ball.pos, 2);
    if (ball.pos.y > 100) {
      play("click");
      return true;
    }
  });
  nextBallSpawnTime -= sd;
  if (nextBallSpawnTime <= 0) {
    play("laser");
    balls.push({
      pos: vec(rnd(10, 90), 0),
      vel: vec(0, 0),
      state: "falling"
    });
    nextBallSpawnTime = 200;
  }
  if (balls.length === 0) {
    play("explosion");
    end();
  }
}
function findNearestBall() {
  var nearestBall = null;
  var nearestDistance = Infinity;
  balls.forEach(function (ball) {
    if (ball.state === "falling") {
      var distance = Math.abs(ball.pos.y - juggler.pos.y);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestBall = ball;
      }
    }
  });
  return nearestBall;
}

