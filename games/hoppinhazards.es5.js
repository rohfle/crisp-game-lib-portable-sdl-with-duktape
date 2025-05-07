title = "\nHOPPIN' \nHAZARDS\n";
description = "\n[Hold] Hop\n";
options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  audioSeed: 80
};
var frog;
var minFrogSize = 10;
var maxFrogSize = 30;
var obstacles;
var obstacleSpeed = 1;
var nextObstacleTicks;
function update() {
  if (!ticks) {
    frog = {
      pos: vec(50, 90),
      size: minFrogSize
    };
    obstacles = [];
    nextObstacleTicks = 0;
  }
  color("blue");
  rect(0, 95, 100, 5);
  frog.pos.x = 50;
  if (input.isJustPressed) {
    play("select");
  }
  if (input.isPressed) {
    frog.size = Math.min(frog.size + difficulty, maxFrogSize);
    frog.pos.y = Math.max(frog.pos.y - difficulty, 10);
  } else {
    frog.size = Math.max(frog.size - difficulty * 2, minFrogSize);
    frog.pos.y = Math.min(frog.pos.y + difficulty * 2, 90);
  }
  addScore((frog.size - minFrogSize) / 100);
  color("green");
  box(frog.pos, frog.size);
  nextObstacleTicks -= difficulty;
  if (nextObstacleTicks < 0) {
    var x = rndi(2) === 0 ? -10 : 110;
    var shape = rndi(2) === 0 ? "bird" : "snake";
    var newObstacle = {
      pos: vec(x, rnd(10, 90)),
      vx: x < 50 ? obstacleSpeed + rnd(difficulty - 1) : -(obstacleSpeed + rnd(difficulty - 1)),
      vy: 0,
      shape: shape,
      color: rndi(2) === 0 ? "blue" : "red"
    };
    obstacles.push(newObstacle);
    play(shape === "bird" ? "hit" : "click");
    nextObstacleTicks = rnd(45, 120) / sqrt(difficulty);
  }
  remove(obstacles, function (o) {
    o.pos.add(o.vx, o.vy);
    color(o.color);
    if (o.shape === "bird") {
      var cob = bar(o.pos, 10, 3, o.vx > 0 ? 0 : PI, 0.5).isColliding.rect;
      if (cob.green) {
        play("explosion");
        end();
      }
    } else if (o.shape === "snake") {
      var _cob = arc(o.pos, 5, 3, PI / 2, PI / 2 + (o.vx > 0 ? -PI : PI)).isColliding.rect;
      if (_cob.green) {
        play("explosion");
        end();
      }
    }
    return o.pos.x < -10 || o.pos.x > 110;
  });
}

