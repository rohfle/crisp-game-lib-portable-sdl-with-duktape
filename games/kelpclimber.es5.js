title = "KELP CLIMBER";
description = "\n[Tap] Grab kelp\n";
options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  isDrawingScoreFront: true,
  audioSeed: 1
};
var otter;
var kelpStrands;
var nextKelpStandDist;
var obstacles;
var nextObstacleDist;
var screenWidth = 100;
var screenHeight = 100;
var otterSize = 5;
function update() {
  if (!ticks) {
    kelpStrands = [{
      pos: vec(25, 40),
      length: screenHeight
    }, {
      pos: vec(50, 50),
      length: screenHeight
    }, {
      pos: vec(75, 45),
      length: screenHeight
    }];
    nextKelpStandDist = 0;
    otter = {
      pos: vec(kelpStrands[1].pos.x, 90),
      grabbedKelp: kelpStrands[1]
    };
    obstacles = [];
    nextObstacleDist = 0;
  }
  var scrollSpeed = 0.5 * difficulty;
  var nearestKelp = null;
  var minDistance = 99;
  kelpStrands.forEach(function (kelp) {
    if (kelp !== otter.grabbedKelp && kelp.pos.y > 40) {
      var distance = Math.abs(kelp.pos.x - otter.pos.x);
      if (distance < minDistance) {
        minDistance = distance;
        nearestKelp = kelp;
      }
    }
  });
  if (input.isJustPressed) {
    if (nearestKelp) {
      play("jump");
      addScore(ceil(abs(nearestKelp.pos.x - otter.pos.x)), otter.pos);
      otter.grabbedKelp.pos.y = 199;
      otter.grabbedKelp = nearestKelp;
      otter.pos.x = nearestKelp.pos.x;
    }
  }
  kelpStrands.forEach(function (kelp) {
    kelp.pos.y += scrollSpeed;
  });
  remove(kelpStrands, function (kelp) {
    return kelp.pos.y > screenHeight + 50;
  });
  nextKelpStandDist -= scrollSpeed;
  if (nextKelpStandDist < 0) {
    play("click");
    kelpStrands.push({
      pos: vec(rnd(10, 90), -50),
      length: screenHeight
    });
    nextKelpStandDist += rnd(30, 50);
  }
  obstacles.forEach(function (obstacle) {
    obstacle.pos.y += scrollSpeed;
  });
  remove(obstacles, function (obstacle) {
    return obstacle.pos.y > screenHeight + 10;
  });
  nextObstacleDist -= scrollSpeed;
  if (nextObstacleDist < 0) {
    play("hit");
    var newObstacle = {
      pos: vec(rnd(10, 90), -10),
      size: vec(rnd(5, 15), rnd(5, 15))
    };
    obstacles.push(newObstacle);
    nextObstacleDist += rnd(40, 50);
  }
  color("green");
  kelpStrands.forEach(function (kelp) {
    box(kelp.pos, vec(3, kelp.length));
  });
  color("red");
  obstacles.forEach(function (obstacle) {
    box(obstacle.pos, obstacle.size);
  });
  color("yellow");
  if (box(otter.pos, otterSize).isColliding.rect.red) {
    play("explosion");
    end();
  }
  if (nearestKelp) {
    color("light_cyan");
    box(nearestKelp.pos.x, 90, otterSize - 2);
  }
}

