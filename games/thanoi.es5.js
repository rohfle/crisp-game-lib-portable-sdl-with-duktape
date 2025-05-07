title = "T HANOI";
description = "\n[Tap]\n Take/Place disk\n[Hold]\n Shorten rod\n";
characters = [];
options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  isDrawingScoreFront: true,
  seed: 5
};
var rods;
var nextDiskTicks;
var selectedRodIndex;
var holdTicks;
var multiplier;
var barCount = 3;
var diskWidth = 7;
var diskHeight = 6;
function update() {
  if (!ticks) {
    rods = times(barCount, function (i) {
      return {
        disks: [],
        height: 90
      };
    });
    nextDiskTicks = 0;
    selectedRodIndex = -1;
    holdTicks = 0;
    multiplier = 1;
  }
  if (rods[0].disks.length === 0) {
    nextDiskTicks = 0;
  }
  nextDiskTicks--;
  if (nextDiskTicks < 0) {
    play("laser");
    rods[0].disks.unshift(rndi(1, 5));
    nextDiskTicks = 99 * sqrt(rods[0].disks.length) / sqrt(difficulty);
  }
  if (input.isJustPressed) {
    var i = clamp(floor(input.pos.x / (100 / barCount)), 0, barCount);
    if (selectedRodIndex < 0) {
      if (rods[i].disks.length > 0) {
        play("select");
        selectedRodIndex = i;
      }
    } else {
      var fb = rods[selectedRodIndex];
      var tb = rods[i];
      var fp = fb.disks[fb.disks.length - 1];
      if (i === selectedRodIndex) {
        play("hit");
      } else if (tb.disks.length === 0 || i === 0) {
        play("coin");
        fb.disks.pop();
        tb.disks.push(fp);
      } else {
        var tp = tb.disks[tb.disks.length - 1];
        if (fp <= tp) {
          play("coin");
          fb.disks.pop();
          tb.disks.push(fp);
        } else {
          play("hit");
        }
      }
      selectedRodIndex = -1;
    }
  }
  if (input.isPressed) {
    holdTicks++;
    var _i = clamp(floor(input.pos.x / (100 / barCount)), 0, barCount);
    if (_i > 0) {
      var h = holdTicks * holdTicks / 10000;
      rods[_i].height -= h;
      if (h > 0.5) {
        play("jump");
      }
    }
  } else {
    holdTicks = 0;
  }
  color("light_black");
  rect(0, 90, 100, 10);
  if (selectedRodIndex >= 0) {
    color("light_cyan");
    rect(selectedRodIndex * 100 / barCount, 0, 100 / barCount, 90);
  }
  rods.forEach(function (r, i) {
    var x = (i + 0.5) * 100 / barCount;
    r.height -= 0.01;
    if (r.height < r.disks.length * diskHeight) {
      if (i === 0) {
        play("explosion");
        end();
      } else {
        play("powerUp");
        var sc = r.disks.length * r.disks.length;
        addScore(sc * floor(multiplier), x, 90 - r.height);
        multiplier += sc / 100;
        r.disks = [];
        rods[0].height = clamp(rods[0].height + sc / 4 / sqrt(difficulty), 0, 90);
        r.height = 90;
        if (selectedRodIndex === i) {
          selectedRodIndex = -1;
        }
        holdTicks = 0;
      }
    }
    color(i === 0 ? "light_red" : "light_black");
    rect(x - 1, 90, 3, -r.height);
    var y = 90 - diskHeight / 2 + 1;
    r.disks.forEach(function (d, j) {
      var w = d * diskWidth;
      if (i === selectedRodIndex && j === r.disks.length - 1) {
        color("cyan");
        box(x + 0.5, y, w, diskHeight - 1);
        color("red");
        box(x + 0.5, y, w - 2, diskHeight - 3);
      } else {
        color("red");
        box(x + 0.5, y, w, diskHeight - 1);
      }
      y -= diskHeight;
    });
  });
  color("black");
  text("x".concat(floor(multiplier)), 3, 9);
}

