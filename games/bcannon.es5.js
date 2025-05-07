title = "B CANNON";
description = "\n[Tap]  Turn\n[Hold] Fire\n";
characters = ["\n ll\nll\n l\n ll\nl\n", "\n ll\nll\n l\nll\n  l\n", "\nll ll\nl l l\n lll\nl l l\nll ll\n"];
options = {
  theme: "dark",
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 2
};
var balls;
var nextBallCount;
var nextBallCountMax;
var nextBallTicks;
var ballSpeed;
var rope;
var player;
var targetPos;
function update() {
  if (!ticks) {
    balls = [];
    nextBallCount = 0;
    nextBallCountMax = 2;
    nextBallTicks = 40;
    ballSpeed = 1;
    rope = {
      from: vec(),
      angle: 0,
      length: 0
    };
    player = {
      x: 40,
      pos: vec(40, 92),
      angle: 0,
      vx: 1,
      stopTicks: 0
    };
    targetPos = vec(50, 50);
  }
  color("light_black");
  rect(0, 0, 100, 5);
  rect(0, 95, 100, 5);
  rect(0, 5, 5, 90);
  rect(95, 5, 5, 90);
  color("black");
  if (rope.length > 0) {
    if (!bar(rope.from, rope.length, 3, rope.angle, 0).isColliding.rect.light_black) {
      rope.length += sqrt(difficulty) * 2;
    } else {
      rope.length = 0;
    }
  }
  if (balls.length === 0) {
    nextBallTicks++;
    if (nextBallTicks > 60) {
      play("powerUp");
      nextBallTicks = 0;
      nextBallCount++;
      if (nextBallCount > nextBallCountMax) {
        nextBallCount = 1;
        ballSpeed += 0.2;
        nextBallCountMax = clamp(nextBallCountMax + 1, 1, 4);
      }
      var x = 50 - (nextBallCount - 1) * 10 - 20;
      balls = times(nextBallCount, function (i) {
        x += 20;
        return {
          pos: vec(x, 30),
          vel: vec(0, ballSpeed),
          radius: 9,
          invincibleTIcks: 0
        };
      });
    }
  }
  var nBall;
  var nbDist = 200;
  color("yellow");
  remove(balls, function (b) {
    b.pos.add(b.vel);
    if (b.pos.x < 5 + b.radius && b.vel.x < 0 || b.pos.x > 95 - b.radius && b.vel.x > 0) {
      play("hit");
      b.vel.x *= -1;
    }
    if (b.pos.y < 5 + b.radius && b.vel.y < 0 || b.pos.y > 95 - b.radius && b.vel.y > 0) {
      play("hit");
      b.vel.y *= -1;
    }
    b.invincibleTIcks--;
    if (arc(b.pos, b.radius).isColliding.rect.black && b.invincibleTIcks < 0) {
      var radius = b.radius * 0.7;
      if (radius < 3) {
        play("jump");
        addScore(balls.length, b.pos);
        particle(b.pos);
        return true;
      }
      play("coin");
      var s = b.vel.length;
      var invincibleTIcks = 30 / sqrt(difficulty);
      var oa = wrap(b.vel.angle - rope.angle - PI, -PI, PI);
      if (abs(oa) > PI / 2) {
        oa = PI - abs(oa);
      }
      if (abs(oa) < PI / 5) {
        oa = PI / 5;
      }
      balls.push({
        pos: vec(b.pos),
        vel: vec(s).rotate(rope.angle + oa),
        radius: radius,
        invincibleTIcks: invincibleTIcks
      });
      balls.push({
        pos: vec(b.pos),
        vel: vec(s).rotate(rope.angle - oa),
        radius: radius,
        invincibleTIcks: invincibleTIcks
      });
      return true;
    }
    var d = b.pos.distanceTo(player.pos);
    if (d < nbDist) {
      nbDist = d;
      nBall = b;
    }
  });
  if (nBall != null) {
    targetPos.add(vec(nBall.vel).mul(8 + ballSpeed).add(nBall.pos).sub(targetPos).mul(0.1 * sqrt(difficulty)));
  }
  if (input.isJustPressed) {
    play("select");
    player.vx *= -1;
  }
  if (input.isPressed) {
    if (nBall != null) {
      player.stopTicks++;
    }
  } else {
    player.stopTicks = 0;
    player.x += player.vx * sqrt(difficulty);
    if (player.x < 0) {
      player.angle++;
      player.x = 84 + player.x;
    } else if (player.x >= 84) {
      player.angle--;
      player.x = 84 - player.x;
    }
    player.angle = wrap(player.angle, 0, 4);
  }
  switch (player.angle) {
    case 0:
      player.pos.set(player.x + 8, 92);
      break;
    case 1:
      player.pos.set(8, player.x + 8);
      break;
    case 2:
      player.pos.set(92 - player.x, 8);
      break;
    case 3:
      player.pos.set(92, 92 - player.x);
      break;
  }
  color("black");
  char("c", targetPos);
  if (player.stopTicks === 10) {
    play("laser");
    rope.angle = player.pos.angleTo(targetPos);
    rope.from.set(player.pos);
    rope.length = 1;
  }
  if (char(addWithCharCode("a", floor(ticks / 20) % 2), player.pos, {
    mirror: {
      x: player.vx
    },
    rotation: player.angle
  }).isColliding.rect.yellow) {
    play("explosion");
    end();
  }
}

