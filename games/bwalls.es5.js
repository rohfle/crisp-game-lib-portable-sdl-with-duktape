title = "B WALLS";
description = "\n[Tap] Shoot\n";
characters = ["\n  ll\n  ll\nrrLLrr\nrrLLrr\n  ll\n", "\nl ll l\n lyyl\nlyyyyl\n ylly\n ylly\n  ll\n", "\n y\nyyy\nlll\nyyy\nlll\n y\n"];
options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 19
};
var walls;
var nextWallDist;
var scr;
var wallTicks;
var shotY;
var multiplier;
function update() {
  if (!ticks) {
    walls = [];
    nextWallDist = 0;
    scr = 0;
    wallTicks = 0;
    shotY = undefined;
    multiplier = 1;
  }
  var wallStopInterval = 120 / sqrt(difficulty);
  var isWallStopping = wallTicks / wallStopInterval % 1 > 0.5;
  if (shotY == null && input.isJustPressed) {
    play("powerUp");
    shotY = 90;
    multiplier = 1;
  }
  if (shotY != null) {
    shotY -= sqrt(difficulty) * 3;
    char("c", 50, shotY);
    if (shotY > 66) {
      scr += (shotY - 66) * 0.1;
    }
  }
  if (!isWallStopping) {
    play("hit");
  }
  var maxY = 0;
  remove(walls, function (w) {
    w.y += scr;
    if (w.y > maxY) {
      maxY = w.y;
    }
    if (!isWallStopping) {
      w.ox = (w.ox + w.vx) % (w.width + w.interval);
    }
    var x = w.ox - w.width;
    color("yellow");
    while (x < 99) {
      if (rect(x, w.y, w.width, 5).isColliding["char"].c) {
        play("select");
        shotY = undefined;
      }
      x += w.width + w.interval;
    }
    color("black");
    if (char("b", 50, w.y - 3).isColliding["char"].c && shotY != null) {
      play("explosion");
      addScore(multiplier, 50, w.y - 3);
      multiplier *= 2;
      return true;
    }
  });
  if (shotY == null) {
    wallTicks++;
  } else if (shotY < -9 || !isWallStopping && shotY < maxY + 7) {
    play("select");
    shotY = undefined;
  }
  nextWallDist -= scr;
  if (nextWallDist < 0) {
    var w = rnd(10, 20);
    var i = rnd(20, 40);
    var wall = {
      y: -9 - nextWallDist,
      width: w,
      interval: i,
      ox: rnd(w + i),
      vx: 0
    };
    var isValid = false;
    for (var _i = 0; _i < 99; _i++) {
      var vx = rnds(5, 10) * sqrt(difficulty);
      if (abs(vx * wallStopInterval * 0.5 % (w + _i)) > 19) {
        wall.vx = vx;
        isValid = true;
        break;
      }
    }
    if (!isValid) {
      wall.width = 0;
    }
    walls.push(wall);
    nextWallDist += 11;
  }
  if (maxY < 40) {
    scr += (40 - maxY) * 0.01;
  } else {
    scr *= 0.5;
  }
  scr += difficulty * 0.01;
  color("black");
  if (char("a", 50, 90).isColliding.rect.yellow) {
    play("lucky");
    end();
  }
}

