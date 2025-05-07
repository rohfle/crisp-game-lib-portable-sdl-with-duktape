title = "CIRCLE W";
description = "\n[Hold] Expand\n";
characters = [];
options = {
  viewSize: {
    x: 200,
    y: 100
  },
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 5
};
var circles;
var nextCircleDist;
var nextDangerCount;
var playerRadius;
var scr;
var multiplier;
function update() {
  if (!ticks) {
    circles = [{
      pos: vec(200, 50),
      radius: 10,
      type: "player"
    }];
    nextCircleDist = 0;
    nextDangerCount = 30;
    playerRadius = 1;
    multiplier = 1;
    scr = vec();
  }
  if (input.isJustPressed) {
    play("laser");
  }
  if (playerRadius < 9 && multiplier > 1) {
    multiplier--;
  }
  playerRadius += sqrt(difficulty) * (input.isPressed ? 1 : -1) * 0.5;
  if (playerRadius < 1) {
    playerRadius = 1;
  }
  var playerCircle;
  remove(circles, function (c) {
    c.pos.add(scr);
    c.pos.y = wrap(c.pos.y, -15, 115);
    if (c.type === "player") {
      playerCircle = c;
      return;
    }
    return c.pos.x < -c.radius;
  });
  color("green");
  var pp = playerCircle.pos;
  arc(pp, playerRadius);
  if (pp.x < 20) {
    pp.x = 20;
  }
  var isSetPlayer = false;
  circles.forEach(function (c) {
    if (c.type === "player") {
      return;
    }
    color(c.type === "danger" ? "red" : "blue");
    if (arc(c.pos, c.radius).isColliding.rect.green) {
      if (c.type === "danger") {
        play("explosion");
        end();
      } else if (!isSetPlayer) {
        play("coin");
        multiplier += ceil(playerRadius);
        addScore(multiplier, c.pos);
        c.type = "player";
        playerRadius = c.radius;
        isSetPlayer = true;
        playerCircle.pos.x = -99;
        playerCircle.type = "normal";
      }
    }
  });
  nextCircleDist += scr.x;
  if (nextCircleDist < 0) {
    var pos = vec();
    var radius;
    var type = nextDangerCount === 0 ? "danger" : "normal";
    color("transparent");
    for (var i = 0; i < 9; i++) {
      radius = rnd(8, 15);
      pos.set(200 + radius, rndi(99));
      var c = box(pos, radius * (type === "danger" ? 8 : 5), radius * 2.5).isColliding.rect;
      if (!(c.blue || c.red)) {
        circles.push({
          pos: pos,
          radius: radius,
          type: type
        });
        nextDangerCount--;
        if (nextDangerCount < 0) {
          play("hit");
          nextDangerCount = rndi(24, 30);
        }
        nextCircleDist = 5;
        break;
      }
    }
  }
  scr.set(-sqrt(difficulty), (50 - pp.y) * 0.1);
  if (pp.x > 20) {
    scr.x -= (pp.x - 20) * 0.1;
  }
  color("black");
  text("x".concat(multiplier), 3, 9);
}

