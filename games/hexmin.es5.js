title = "HEXMIN";
description = "\n[Tap] Roll\n";
characters = [];
options = {
  theme: "shape",
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 70
};
var lanes;
var laneChangeTicks;
var nextLaneAddingCount;
var arrowAngle;
var multiplier;
var ss = [4, 6, 8, 10, 10, 10];
var rs = [49, 42, 33, 22, 11];
function update() {
  if (!ticks) {
    lanes = times(6, function () {
      return {
        value: 0
      };
    });
    laneChangeTicks = 0;
    nextLaneAddingCount = 0;
    arrowAngle = 0;
    multiplier = 1;
  }
  if (input.isJustPressed) {
    play("laser");
    arrowAngle = wrap(arrowAngle + 1, 0, 6);
    multiplier = ceil(multiplier * 0.9) - 1;
    if (multiplier < 1) {
      multiplier = 1;
    }
  }
  var p = vec();
  for (var i = 0; i < 6; i++) {
    var oa = wrap(i - arrowAngle, 0, 6);
    p.set(50, 50).addWithAngle(i * PI / 3, rs[4]);
    color(oa === 0 || oa === 2 ? "red" : "light_black");
    drawHex(p, ss[4] / 2);
  }
  laneChangeTicks--;
  if (laneChangeTicks < 0) {
    for (var _i = 0; _i < 6; _i++) {
      var l = lanes[_i];
      if (l.value > 0) {
        play("hit");
        l.value++;
        if (l.value > 4) {
          play("explosion");
          end();
        }
      }
    }
    nextLaneAddingCount--;
    if (nextLaneAddingCount < 0) {
      var li = rndi(6);
      for (var _i2 = 0; _i2 < 6; _i2++) {
        var _l = lanes[li];
        if (_l.value === 0) {
          _l.value = 1;
          break;
        }
        li = wrap(li + 1, 0, 6);
      }
      nextLaneAddingCount = floor(rnd(1 + 3 / difficulty));
    }
    laneChangeTicks += 30 / sqrt(difficulty);
  }
  lanes.forEach(function (l, j) {
    for (var _i3 = 0; _i3 < 5; _i3++) {
      if (l.value <= _i3) {
        break;
      }
      p.set(50, 50).addWithAngle(j * PI / 3, rs[_i3]);
      color(_i3 < 3 ? "green" : "blue");
      drawHex(p, ss[_i3] / 2);
    }
    if (l.value === 4) {
      var _oa = wrap(j - arrowAngle, 0, 6);
      if (_oa === 0 || _oa === 2) {
        play("coin");
        addScore(multiplier, 50, 50);
        multiplier += 6;
        l.value = 0;
      }
    }
  });
  color("black");
  text("x".concat(multiplier), 3, 9);
  function drawHex(cp, s) {
    var p1 = vec();
    var p2 = vec();
    p1.set(cp).addWithAngle(5.5 * PI / 3, s);
    for (var _i4 = 0; _i4 < 6; _i4++) {
      p2.set(p1);
      p1.set(cp).addWithAngle((_i4 + 0.5) * PI / 3, s);
      line(p1, p2, 2);
    }
  }
}

