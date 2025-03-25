title = "HIT BLOW UP";
description = "\n[Tap]\n Select color\n";
characters = ["\n ll\nllll\nllll\n ll\n", "\n ll\nl  l\nl  l\n ll\n"];
options = {
  isPlayingBgm: true,
  seed: 4
};
var isGoingNextStage;
var stageCount;
var loopCount;
var selectorBase;
var selector;
var selectorY;
var target;
var current;
var currentIndex;
var hist;
var hitBlowTicks;
var nextStageTicks;
var hitCount;
var blowCount;
var colors = ["red", "green", "blue", "yellow", "cyan", "purple"];
function update() {
  if (!ticks) {
    isGoingNextStage = true;
    stageCount = 0;
  }
  if (isGoingNextStage) {
    loopCount = floor(stageCount / 6);
    var s = stageCount % 6;
    if (s === 0) {
      selectorBase = times(6, function (i) {
        return i;
      });
      times(99, function () {
        var n1 = rndi(6);
        var n2 = rndi(6);
        var t = selectorBase[n1];
        selectorBase[n1] = selectorBase[n2];
        selectorBase[n2] = t;
      });
    }
    var sc = 3 + floor((s + 1) / 2);
    selector = times(sc, function (i) {
      return selectorBase[i];
    });
    var tc = 2 + floor(s / 2);
    target = times(sc, function (i) {
      return selector[i];
    });
    times(99, function () {
      var n1 = rndi(selector.length);
      var n2 = rndi(selector.length);
      var t = target[n1];
      target[n1] = target[n2];
      target[n2] = t;
    });
    target.splice(tc);
    hist = [];
    selectorY = 90;
    isGoingNextStage = false;
    current = times(target.length, function () {
      return -1;
    });
    currentIndex = 0;
    hitBlowTicks = -1;
    nextStageTicks = -1;
  }
  if (nextStageTicks < 0) {
    selectorY -= pow(2, loopCount) / (target.length * target.length + selector.length) * 0.05;
  }
  color("light_black");
  rect(0, selectorY, 99, 99 - selectorY);
  var sx = 50 - (selector.length - 1) / 2 * 10;
  selector.forEach(function (s) {
    color(colors[s]);
    char("a", sx, selectorY + 3);
    sx += 10;
  });
  if (nextStageTicks < 0 && input.isJustPressed) {
    var i = floor((input.pos.x - 50) / 10 + selector.length / 2);
    if (i >= 0 && i < selector.length) {
      play("select");
      current[currentIndex] = selector[i];
      currentIndex++;
      if (currentIndex === target.length) {
        var hit = 0;
        var blow = 0;
        target.forEach(function (t, i) {
          if (t === current[i]) {
            hit++;
          } else if (current.indexOf(t) > -1) {
            blow++;
          }
        });
        hist.push({
          colors: current,
          hit: hit,
          blow: blow
        });
        hitBlowTicks = 60;
        current = times(target.length, function () {
          return -1;
        });
        currentIndex = 0;
        if (hit === target.length) {
          addScore((selectorY - hist.length * 6) * (loopCount + 1), 70, (selectorY - hist.length * 6) / 2 + 9);
          nextStageTicks = 60;
        }
        hitCount = hit;
        blowCount = blow;
      }
    }
  }
  var hy = selectorY - 3;
  hist.forEach(function (hs) {
    var hx = 50 - (target.length - 1) / 2 * 7;
    hs.colors.forEach(function (h) {
      color(colors[h]);
      char("a", hx, hy);
      hx += 7;
    });
    color("black");
    text("".concat(hs.hit), 3, hy);
    text("".concat(hs.blow), 96, hy);
    hy -= 6;
  });
  hitBlowTicks--;
  if (hitBlowTicks > 0) {
    text("HIT", 10, hy + 6);
    text("BLOW", 70, hy + 6);
    if (hitBlowTicks % 10 === 0) {
      if (hitCount > 0) {
        play("powerUp");
        hitCount--;
      } else if (blowCount > 0) {
        play("coin");
        blowCount--;
      }
    }
  }
  nextStageTicks--;
  if (nextStageTicks >= 0) {
    color("black");
    rect(50, 0, 1, hy + 3);
    rect(48, 0, 5, 1);
    rect(48, hy + 2, 5, 1);
    drawAnswer();
    if (nextStageTicks === 0) {
      stageCount++;
      isGoingNextStage = true;
    }
    return;
  }
  var cx = 50 - (target.length - 1) / 2 * 7;
  current.forEach(function (c) {
    if (c < 0) {
      color("light_black");
      char("b", cx, hy);
    } else {
      color(colors[c]);
      char("a", cx, hy);
    }
    cx += 7;
  });
  if (nextStageTicks < 0 && hy < 3) {
    play("lucky");
    drawAnswer();
    end();
  }
  function drawAnswer() {
    var tx = 50 - (target.length - 1) / 2 * 7;
    target.forEach(function (t) {
      color(colors[t]);
      char("a", tx, selectorY + 8);
      tx += 7;
    });
  }
}

