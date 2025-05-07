title = "MOLE N";
description = "\n[Tap]\n Whack a number\n";
characters = [];
options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  isDrawingScoreFront: true,
  isDrawingParticleFront: true,
  seed: 3
};
var numbers;
var numbersY;
var penaltyY;
var currentNumbers;
var moles;
var targetNumber;
var nextTargetNumberCount;
var nextMoleDist;
var moleMoveTicks;
var hitPos;
var hitTicks;
var numberCount = 9;
var offsets = [vec(1, 0), vec(0, 1), vec(-1, 0), vec(0, -1)];
function update() {
  if (!ticks) {
    numbers = times(numberCount, function () {
      return times(numberCount, function () {
        return rndi(10);
      });
    });
    currentNumbers = times(numberCount, function () {
      return times(numberCount, function () {
        return 0;
      });
    });
    numbersY = 0;
    penaltyY = 0;
    targetNumber = 1;
    nextTargetNumberCount = 0;
    moles = [];
    nextMoleDist = 0;
    moleMoveTicks = 0;
    hitPos = vec();
    hitTicks = 0;
  }
  var scr = sqrt(difficulty) * 0.02 + penaltyY;
  penaltyY *= 0.9;
  numbersY += scr;
  if (numbersY > 0) {
    times(numberCount, function (y) {
      times(numberCount, function (x) {
        if (y < numberCount - 1) {
          numbers[x][numberCount - y - 1] = numbers[x][numberCount - y - 2];
        } else {
          numbers[x][0] = rndi(10);
        }
      });
    });
    moles.forEach(function (m) {
      m.pos.y++;
    });
    hitPos.y++;
    numbersY -= 11;
  }
  if (input.isJustPressed) {
    play("laser");
    var p = vec(input.pos).sub(1, numbersY).div(11).floor();
    hitPos.set(p);
    hitTicks = 40;
    if (p.isInRect(0, 0, numberCount, numberCount)) {
      var isTargetRemoved = false;
      moles.forEach(function (m) {
        if (m.removeTicks === 0 && m.pos.equals(p)) {
          if (m.value === targetNumber) {
            isTargetRemoved = true;
          } else {
            m.removeTicks = 60;
            m.score = -m.value;
            penaltyY += 1;
          }
        }
      });
      if (isTargetRemoved) {
        targetNumber = getRandomNumber();
        moles.forEach(function (m) {
          m.removeTicks = 60;
          m.score = m.value;
        });
      }
      penaltyY += 1;
    }
  }
  if (moles.length === 0) {
    nextMoleDist = 0;
  }
  nextMoleDist -= scr;
  if (nextMoleDist < 0) {
    var pos = vec();
    for (var i = 0; i < 9; i++) {
      pos.x = rndi(numberCount);
      if (!existsMole(pos)) {
        nextTargetNumberCount--;
        var value = void 0;
        if (nextTargetNumberCount <= 0) {
          value = targetNumber;
          nextTargetNumberCount = rndi(4, 7);
        } else {
          value = getRandomNumber();
        }
        moles.push({
          pos: pos,
          value: value,
          removeTicks: 0,
          score: 0
        });
        break;
      }
    }
    nextMoleDist += rnd(9, 12);
  }
  moleMoveTicks -= sqrt(sqrt(difficulty));
  if (moleMoveTicks < 0) {
    remove(moles, function (m) {
      if (m.removeTicks > 0) {
        return;
      }
      var w = rndi(4);
      var p = vec();
      for (var _i = 0; _i < 4; _i++) {
        var o = offsets[w];
        p.set(m.pos).add(o);
        if (p.y > 0 && !existsMole(p)) {
          play("hit");
          m.pos.set(p);
          break;
        }
        w = wrap(w + 1, 0, 4);
      }
    });
    moleMoveTicks += 99;
  }
  remove(moles, function (m) {
    if (m.removeTicks > 0) {
      m.removeTicks -= sqrt(difficulty);
      if (m.removeTicks <= 0) {
        color("red");
        var _p = vec(m.pos).mul(11).add(6, 6 + numbersY);
        if (m.score !== 0) {
          play(m.score > 0 ? "powerUp" : "coin");
          particle(_p, 9, 2);
          addScore(m.score, _p);
        }
        return true;
      }
    } else if (m.pos.y >= numberCount - 1) {
      m.removeTicks = 60;
      if (m.value === targetNumber) {
        play("explosion");
        moles.forEach(function (m) {
          m.removeTicks = 60;
        });
        color("light_red");
        rect(m.pos.x * 11 + 1, m.pos.y * 11 + 1 + numbersY, 11, 11);
        end();
      }
    }
  });
  times(numberCount, function (y) {
    return times(numberCount, function (x) {
      currentNumbers[x][y] = numbers[x][y];
    });
  });
  moles.forEach(function (m) {
    var n = m.removeTicks > 0 ? m.value + 10 : wrap(currentNumbers[m.pos.x][m.pos.y] + m.value, 0, 10);
    currentNumbers[m.pos.x][m.pos.y] = n;
  });
  times(numberCount, function (y) {
    return times(numberCount, function (x) {
      var n = currentNumbers[x][y];
      if (n >= 10) {
        n -= 10;
        color("red");
      } else {
        color(hitTicks > 0 && x === hitPos.x && y === hitPos.y ? "green" : "blue");
      }
      text("".concat(n), x * 11 + 6, y * 11 + 6 + numbersY, {
        scale: {
          x: 2,
          y: 2
        }
      });
    });
  });
  hitTicks -= sqrt(difficulty);
  color("white");
  rect(0, 0, 100, 7);
  rect(0, 93, 100, 7);
  color("black");
  text("TARGET =", 3, 96);
  color("red");
  text("".concat(targetNumber), 3 + 6 * 9, 96);
  function existsMole(p) {
    if (!p.isInRect(0, 0, numberCount, numberCount)) {
      return true;
    }
    var exists = false;
    moles.forEach(function (m) {
      if (m.pos.equals(p)) {
        exists = true;
      }
    });
    return exists;
  }
  function getRandomNumber() {
    return rndi(1, clamp((sqrt(difficulty) - 1) * 5 + 2.5, 1, 10));
  }
}

