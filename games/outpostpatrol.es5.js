title = "\nOUTPOST\nPATROL\n";
description = "\n[Tap] Jump\n";
options = {
  theme: "shape",
  isPlayingBgm: true,
  isReplayEnabled: true,
  audioSeed: 7
};
var sentry;
var obstacles;
var nextObstacleTicks;
var bombs;
var nextBombTicks;
var waves;
var trackRadius = 40;
var centerPos = vec(50, 50);
var jumpDuration = 30;
var jumpTicks = 0;
function update() {
  if (!ticks) {
    sentry = {
      pos: vec(centerPos),
      angle: 0,
      isJumping: false,
      jumpHeight: 0
    };
    obstacles = [];
    nextObstacleTicks = 0;
    bombs = [];
    nextBombTicks = 0;
    waves = [];
  }
  sentry.angle += 0.02 * difficulty;
  sentry.pos = vec(centerPos).add(vec(trackRadius, 0).rotate(sentry.angle));
  if (input.isJustPressed && !sentry.isJumping) {
    play("jump");
    sentry.isJumping = true;
    jumpTicks = 0;
  }
  if (sentry.isJumping) {
    jumpTicks += (input.isPressed ? 1 : 2) * difficulty;
    sentry.jumpHeight = 10 * Math.sin(jumpTicks / jumpDuration * Math.PI);
    if (jumpTicks >= jumpDuration) {
      play("hit");
      sentry.isJumping = false;
      sentry.jumpHeight = 0;
    }
  }
  nextObstacleTicks -= difficulty;
  if (nextObstacleTicks < 0) {
    var angle = sentry.angle + PI;
    var minAo = PI;
    obstacles.forEach(function (obstacle) {
      var ao = abs(wrap(obstacle.angle - angle, -PI, PI));
      if (ao < minAo) {
        minAo = ao;
      }
    });
    if (minAo > PI * 0.2) {
      play("laser");
      obstacles.push({
        pos: vec(centerPos),
        angle: angle
      });
    }
    nextObstacleTicks += rnd(60, 150);
  }
  obstacles.forEach(function (obstacle) {
    obstacle.angle -= 0.01 * difficulty;
    obstacle.pos = vec(centerPos).add(vec(trackRadius, 0).rotate(obstacle.angle));
  });
  nextBombTicks -= difficulty;
  if (nextBombTicks < 0) {
    play("click");
    bombs.push({
      pos: vec(centerPos),
      angle: rnd(0, 2 * PI),
      height: 10
    });
    nextBombTicks += rnd(90, 120);
  }
  bombs.forEach(function (intruder) {
    intruder.angle -= 0.015 * difficulty;
    intruder.pos = vec(centerPos).add(vec(trackRadius, 0).rotate(intruder.angle));
  });
  color("light_black");
  arc(centerPos, trackRadius);
  color("yellow");
  remove(waves, function (wave) {
    wave.width += 0.1 * difficulty;
    arc(centerPos, trackRadius, 4, wave.angle - wave.width / 2, wave.angle + wave.width / 2);
    return wave.width > 1;
  });
  color("red");
  remove(obstacles, function (obstacle) {
    if (box(obstacle.pos, 5).isColliding.rect.yellow) {
      play("coin");
      addScore(1);
      return true;
    }
  });
  color(sentry.isJumping ? "cyan" : "blue");
  if (box(vec(sentry.pos).add(0, -sentry.jumpHeight), 7).isColliding.rect.red && !sentry.isJumping) {
    play("explosion");
    end();
  }
  color("yellow");
  remove(bombs, function (intruder) {
    var c = box(vec(intruder.pos).add(0, -intruder.height), 6).isColliding.rect;
    if ((c.blue || c.cyan) && sentry.isJumping) {
      play("powerUp");
      waves.push({
        angle: intruder.angle,
        width: 0
      });
      return true;
    }
    return false;
  });
}

