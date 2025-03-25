title = "FROOOOG";
description = "\n[Hold]    Bend\n[Release] Jump\n";
characters = [];
options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 101
};
var lanes;
var nextEmptyLaneCount;
var cars;
var nextLaneY;
var frog;
function update() {
  if (!ticks) {
    lanes = [];
    cars = [];
    nextLaneY = 90;
    nextEmptyLaneCount = 0;
    times(3, function () {
      return addLane(true);
    });
    times(7, function () {
      return addLane();
    });
    times(99, function () {
      return updateLanes();
    });
    frog = {
      y: 95,
      py: 0,
      targetY: 0,
      state: "stop",
      isSafe: true
    };
  }
  var scr = difficulty * 0.02;
  if (frog.y < 90) {
    scr += (90 - frog.y) * 0.1;
  }
  if (frog.y > 103) {
    play("explosion");
    end();
  }
  lanes.forEach(function (l) {
    l.y += scr;
  });
  cars.forEach(function (c) {
    c.pos.y += scr;
  });
  nextLaneY += scr;
  if (nextLaneY > -50) {
    addLane();
  }
  frog.y += scr;
  frog.py += scr;
  frog.targetY += scr;
  updateLanes();
  if (frog.state === "stop") {
    drawFrog();
    if (input.isPressed) {
      play("select");
      frog.state = "bend";
      frog.targetY = frog.y - 3;
    }
  }
  if (frog.state === "bend") {
    frog.targetY -= sqrt(difficulty) * 0.7;
    color("light_black");
    rect(49, frog.targetY, 1, frog.y - frog.targetY);
    drawFrog();
    var ty = frog.targetY;
    for (var i = 0; i < lanes.length; i++) {
      var l = lanes[i];
      if (l.y > frog.targetY) {
        ty = l.y - 5;
      }
    }
    color("light_black");
    box(50, ty, 3, 5);
    if (input.isJustReleased || frog.targetY < 9) {
      play("powerUp");
      frog.state = "jump";
      frog.targetY = ty;
      frog.py = frog.y;
    }
  }
  if (frog.state === "jump") {
    frog.y -= sqrt(difficulty) * 1.5;
    var scale = sin((frog.y - frog.targetY) / (frog.py - frog.targetY) * PI) + 1;
    drawFrog(scale);
    if (frog.y < frog.targetY) {
      play("hit");
      color("transparent");
      frog.y = frog.targetY;
      var isf = box(50, frog.y, 1).isColliding.rect.light_green;
      var lc = isf || frog.isSafe ? 0 : ceil((frog.py - frog.y - 1) / 10);
      addScore(lc * lc, 50, frog.y);
      frog.state = "stop";
      frog.isSafe = isf;
    }
  }
  function drawFrog() {
    var scale = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
    var y = frog.y;
    color("green");
    var c = box(50, y, 3 * scale, 5 * scale).isColliding.rect;
    if (scale === 1 && (c.red || c.yellow || c.purple || c.blue || c.cyan)) {
      play("explosion");
      end();
    }
    var ox = 2 * scale;
    var oy = 2 * scale * scale;
    var w = 2 * scale;
    var h = 3 * scale;
    box(50 - ox, y - oy, w, h);
    box(49 + ox, y - oy, w, h);
    box(50 - ox, y + oy, w, h);
    box(49 + ox, y + oy, w, h);
  }
  function updateLanes() {
    remove(lanes, function (l) {
      if (l.ticks > 999) {
        color("light_green");
        box(50, l.y + 5, 100, 9);
      } else {
        color("light_black");
        box(50, l.y, 100, 1);
      }
      l.ticks--;
      if (l.ticks < 0) {
        cars.push({
          pos: vec(l.vx < 0 ? 99 + l.width / 2 : -l.width / 2, l.y + 5),
          vx: l.vx,
          width: l.width,
          color: l.color
        });
        l.ticks = l.interval * rnd(0.9, 1.6);
      }
      return l.y > 99;
    });
    remove(cars, function (c) {
      c.pos.x += c.vx;
      color(c.color);
      box(c.pos, c.width, 7);
      return c.pos.x < -c.width || c.pos.x > 99 + c.width || c.pos.y > 103;
    });
  }
  function addLane() {
    var isEmpty = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    nextEmptyLaneCount--;
    var vr = sqrt(difficulty) + 0.1;
    var vx = (rnd(vr) * rnd(vr) * rnd(vr) + 1) * 0.3 * (rnd() < 0.5 ? -1 : 1);
    var width = rndi(9, 19);
    var interval = width + rnd(40, 90) / abs(vx);
    lanes.push({
      y: nextLaneY,
      vx: vx,
      width: width,
      color: ["red", "purple", "yellow", "blue", "cyan"][rndi(5)],
      interval: interval,
      ticks: nextEmptyLaneCount < 0 || isEmpty ? 9999999 : rnd(interval / 2)
    });
    nextLaneY -= 10;
    if (nextEmptyLaneCount < 0) {
      nextEmptyLaneCount = rndi(9, 16);
    }
  }
}

