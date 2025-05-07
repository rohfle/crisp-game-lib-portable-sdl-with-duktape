title = "TEETER";
description = "\n[Tap]\n Change angle\n";
characters = ["\n llll\nl llll\nllllll\nllllll\nllllll\n llll\n"];
options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 60
};
var bars;
var barAngleSign;
var ballTargetPos;
var ballPos;
var floors;
function update() {
  if (!ticks) {
    bars = [];
    times(7, function () {
      addBar();
    });
    barAngleSign = 1;
    ballTargetPos = ballPos = undefined;
    floors = [];
  }
  if (ballTargetPos == null) {
    play("laser");
    var x;
    var _loop = function _loop() {
      x = rnd(20, 80);
      var isOnBar = false;
      bars.forEach(function (b) {
        if (abs(b.pos.x - x) < b.width / 2 * cos(b.angle)) {
          isOnBar = true;
        }
      });
      if (isOnBar) {
        return 1;
      }
    };
    for (var i = 0; i < 99; i++) {
      if (_loop()) break;
    }
    ballTargetPos = vec(x, -4);
    ballPos = vec(ballTargetPos);
    floors = [];
    var fw = 0;
    while (fw < 100) {
      var width = rnd(20, 30);
      floors.push({
        pos: vec(fw + width / 2, 95),
        width: width,
        score: floor(rnd(1, 3.1) * rnd(1, 3.1)),
        barCount: 0
      });
      fw += width;
    }
    var fi = rndi(floors.length);
    floors[fi].score = 0;
    floors[fi].barCount = floor(rnd(1, 2.2) * rnd(1, 2.2));
    fi = rndi(floors.length);
    floors[fi].score = 0;
    floors[fi].barCount = -floor(rnd(1, 2.2) * rnd(1, 2.2));
    floors.forEach(function (f) {
      f.pos.x -= (fw - 100) / 2;
    });
  }
  ballTargetPos.y += difficulty * 0.5;
  ballPos.add(vec(ballTargetPos).sub(ballPos).mul(0.5));
  color("black");
  char("a", ballPos);
  if (input.isJustPressed) {
    play("select");
    barAngleSign *= -1;
  }
  bars.forEach(function (b) {
    var a = b.angle * barAngleSign;
    if (bar(b.pos, b.width, 3, a).isColliding["char"].a) {
      play("hit");
      ballTargetPos.set(vec(b.pos).addWithAngle(a, (b.width / 2 + 7) * (a > 0 ? 1 : -1)));
    }
  });
  var barCountDiff = 0;
  remove(floors, function (f) {
    var t, c;
    if (f.score > 0) {
      t = "".concat(f.score);
      c = f.score < 5 ? "light_black" : "black";
    } else if (f.barCount < 0) {
      t = "".concat(f.barCount);
      c = "red";
    } else {
      t = "+".concat(f.barCount);
      c = "blue";
    }
    color(c);
    if (box(f.pos, f.width - 1, 10).isColliding["char"].a) {
      particle(f.pos);
      if (f.score > 0) {
        play("coin");
        addScore(f.score, f.pos);
        f.score++;
      } else {
        barCountDiff += f.barCount;
      }
      return true;
    }
    color("white");
    text(t, clamp(f.pos.x - (t.length - 1) * 3, 3, 97 - (t.length - 1) * 6), f.pos.y);
    return f.pos.x > 99 + f.width / 2;
  });
  if (barCountDiff > 0) {
    var sc = 0;
    times(barCountDiff, function () {
      play("powerUp");
      if (!addBar()) {
        sc++;
      }
    });
    if (sc > 0) {
      addScore(sc, ballPos);
    }
  } else if (barCountDiff < 0) {
    play("explosion");
    color("black");
    for (var _i = 0; _i < -barCountDiff; _i++) {
      var bi = rndi(bars.length);
      particle(bars[bi].pos);
      bars.splice(bi, 1);
      if (bars.length === 0) {
        break;
      }
    }
  }
  if (ballPos.y > 99) {
    if (bars.length === 0) {
      play("lucky");
      end();
    }
    ballTargetPos = undefined;
  }
  function addBar() {
    color("white");
    bars.forEach(function (b) {
      bar(b.pos, b.width + 5, 6, b.angle);
      bar(b.pos, b.width + 5, 6, -b.angle);
    });
    var b;
    color("transparent");
    var isPlaced = false;
    for (var _i2 = 0; _i2 < 99; _i2++) {
      var _width = rnd(12, 18);
      var angle = rnds(0.2, 0.8);
      var aw = _width * cos(angle);
      var pos = vec(rnd(5 + aw / 2, 95 - aw / 2), rnd(20, 70));
      var c1 = bar(pos, _width + 5, 6, angle).isColliding.rect.white;
      var c2 = bar(pos, _width + 5, 6, -angle).isColliding.rect.white;
      if (!c1 && !c2) {
        bars.push({
          pos: pos,
          angle: angle,
          width: _width
        });
        isPlaced = true;
        break;
      }
    }
    return isPlaced;
  }
}

