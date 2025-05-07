title = "PAINT BALL";
description = "\n[Tap] Throw\n";
characters = ["\n llll\nlyyyyl\nlyyyyl\nlyyyyl\nlyyyyl\n llll\n", "\n cccc\ncbbbbc\ncbbbbc\ncbbbbc\ncbbbbc\n cccc\n"];
options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  isDrawingScoreFront: true,
  isDrawingParticleFront: true,
  seed: 5
};
var gridCount = 12;
var grid;
var gridY;
var balls;
var nextBallTicks;
var waitingBall;
var multiplier;
function update() {
  if (!ticks) {
    grid = times(gridCount, function () {
      return times(gridCount + 3, function () {
        return 0;
      });
    });
    gridY = 0;
    balls = [];
    nextBallTicks = 0;
    waitingBall = {
      pos: vec(9, 70),
      angle: 0,
      va: -1
    };
    multiplier = 1;
  }
  var scr = sqrt(difficulty) * 0.03;
  color("light_black");
  box(4, 50, 4, 100);
  box(95, 50, 4, 100);
  gridY += scr;
  if (gridY > 4) {
    gridY -= 7;
    times(gridCount, function (x) {
      times(gridCount + 2, function (y) {
        grid[x][gridCount + 2 - y] = grid[x][gridCount + 1 - y];
      });
      grid[x][0] = 0;
    });
  }
  grid.forEach(function (gl, x) {
    gl.forEach(function (g, y) {
      color(["light_black", "yellow", "blue"][g]);
      box(50 + (x - (gridCount - 1) / 2) * 7, 50 + (y - (gridCount + 2) / 2) * 7 + gridY, 6);
    });
  });
  color("black");
  if (waitingBall != null) {
    waitingBall.pos.y += scr;
    if (waitingBall.pos.y > 95) {
      waitingBall.pos.y = 95;
    }
    waitingBall.angle += waitingBall.va * sqrt(difficulty) * 0.02;
    if (waitingBall.va < 0 && waitingBall.angle < -PI / 4 || waitingBall.va > 0 && waitingBall.angle > PI / 4) {
      waitingBall.va *= -1;
    }
    var a = waitingBall.pos.x < 50 ? waitingBall.angle : PI - waitingBall.angle;
    bar(waitingBall.pos, 20, 2, a, 0);
    char("a", waitingBall.pos);
    if (input.isJustPressed) {
      play("select");
      balls.push({
        pos: waitingBall.pos,
        vel: vec(sqrt(difficulty) * 2).rotate(a),
        color: 1,
        paintingCount: 0
      });
      waitingBall = undefined;
      multiplier = 1;
    }
  }
  nextBallTicks--;
  if (nextBallTicks < 0) {
    var vel = vec(sqrt(difficulty) * 0.1).rotate(rnd(PI / 8, PI / 8 * 7));
    balls.push({
      pos: vec(rnd(20, 80), -3),
      vel: vel,
      color: 2,
      paintingCount: 0
    });
    nextBallTicks = 150 / difficulty;
  }
  remove(balls, function (b) {
    var gx = floor((b.pos.x + 3 - (50 - (gridCount - 1) / 2 * 7)) / 7);
    var gy = floor((b.pos.y + 3 - (50 - (gridCount + 2) / 2 * 7) - gridY) / 7);
    var sp = 1;
    if (b.color === 2 && gx >= 0 && gx < gridCount && gy >= 0 && gy < gridCount + 3) {
      if (grid[gx][gy] === 1) {
        b.paintingCount++;
        sp = 0.1;
      } else {
        b.paintingCount = 999;
      }
    }
    b.pos.add(b.vel.x * sp, b.vel.y * sp);
    b.pos.y += scr;
    if (b.pos.x <= 9 && b.vel.x < 0 || b.pos.x >= 90 && b.vel.x > 0) {
      if (b.color === 1) {
        waitingBall = {
          pos: b.pos,
          angle: 0,
          va: -1
        };
        multiplier = 1;
        return true;
      } else {
        b.vel.x *= -1;
      }
    }
    char(b.color === 1 ? "a" : "b", b.pos);
    if (b.color === 2 && b.pos.y > 99) {
      play("explosion");
      color("red");
      text("X", b.pos.x, 97);
      color("black");
      end();
    }
    if (b.pos.y < 3 && b.vel.y < 0 || b.pos.y > 99 && b.vel.y > 0) {
      b.vel.y *= -1;
    }
    if (gx >= 0 && gx < gridCount && gy >= 0 && gy < gridCount + 3) {
      if (b.color === 1 || b.paintingCount > 99 / sqrt(difficulty)) {
        if (b.color === 1 && grid[gx][gy] !== 1) {
          if (grid[gx][gy] === 2) {
            play("laser");
            multiplier++;
          } else {
            play("hit");
          }
          addScore(multiplier, b.pos);
        }
        grid[gx][gy] = b.color;
        b.paintingCount = 0;
      }
    }
  });
  remove(balls, function (b) {
    color("transparent");
    if (b.color === 2 && char("b", b.pos).isColliding["char"].a) {
      play("powerUp");
      multiplier++;
      color("cyan");
      particle(b.pos);
      addScore(multiplier, b.pos);
      return true;
    }
  });
  if (balls.length === 0) {
    nextBallTicks = 0;
  }
}

