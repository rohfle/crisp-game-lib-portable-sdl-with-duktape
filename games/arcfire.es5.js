title = "ARCFIRE";
description = "\n[Hold]\n  Set arc\n[Release]\n  Fire\n";
characters = ["\n  ll\n  l  l\n llll\nl l  \n  lll\n l \n", "\n  ll\nl l\n llll\n  l  l\nllll\n    l\n", "", "\n llll\n  l  \n lllll\nl l  \n  lll\n l \n", "\n llll\n  l\nlllll\n  l  l\nllll\n    l\n"];
options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 16,
  theme: "crt"
};
var pos;
var moveAngle;
var moveDist;
var angle;
var arcFrom;
var arcTo;
var shots;
var isPressing;
var enemies;
var enemyAddAngle;
var enemyAddTicks;
var multiplier;
function update() {
  if (!ticks) {
    pos = vec(50, 50);
    angle = 0;
    shots = [];
    isPressing = false;
    moveAngle = 0;
    moveDist = 0;
    enemies = [];
    enemyAddAngle = rnd(PI * 2);
    enemyAddTicks = 0;
  }
  if (moveDist > 1) {
    pos.add(vec(moveDist * 0.2).rotate(moveAngle));
    moveDist *= 0.2;
    if (!pos.isInRect(10, 10, 90, 90)) {
      moveAngle += PI;
    }
    pos.clamp(10, 90, 10, 90);
  }
  angle += 0.07 * difficulty;
  color("light_blue");
  arc(50, 50, 7, 4);
  color("light_black");
  line(pos, vec(9).rotate(angle).add(pos), 2);
  color("black");
  char(addWithCharCode("a", floor(ticks / 30) % 2), pos, {
    mirror: {
      x: cos(moveAngle) < 0 ? -1 : 1
    }
  });
  var range = 0;
  if (isPressing) {
    arcTo = angle;
    range = 300 / sqrt((arcTo - arcFrom) * 30);
    color("green");
    line(pos, vec(range).rotate(arcFrom).add(pos));
    line(pos, vec(range).rotate(arcTo).add(pos));
    arc(pos, range, 3, arcFrom, arcTo);
  }
  if (isPressing && arcTo - arcFrom > PI) {
    isPressing = false;
  }
  if (isPressing && input.isJustReleased) {
    isPressing = false;
    if (shots.length === 0) {
      play("select");
      shots.push({
        pos: pos,
        d: 0,
        range: range,
        arcFrom: arcFrom,
        arcTo: arcTo
      });
    }
    moveAngle = (arcTo + arcFrom) / 2;
    moveDist = range / 2;
  }
  if (input.isJustPressed) {
    play("laser");
    arcFrom = angle;
    isPressing = true;
    multiplier = 1;
  }
  color("cyan");
  shots = shots.filter(function (s) {
    s.d += 2;
    arc(pos, s.d, 5, s.arcFrom, s.arcTo);
    return s.d < s.range;
  });
  enemyAddTicks -= difficulty;
  if (enemyAddTicks < 0) {
    var p = vec(70).rotate(enemyAddAngle).add(50, 50);
    var v = vec(rnd(10)).rotate(rnd(PI * 2)).add(50, 50).sub(p).div(500 / rnd(1, difficulty));
    enemies.push({
      p: p,
      v: v
    });
    enemyAddTicks += rnd(40, 60);
    if (rnd() < 0.1) {
      enemyAddAngle = rnd(PI * 2);
    } else {
      enemyAddAngle += rnds(0.05);
    }
  }
  color("red");
  enemies = enemies.filter(function (e) {
    e.p.add(e.v);
    var c = char(addWithCharCode("d", floor(ticks / 30) % 2), e.p, {
      mirror: {
        x: cos(e.v.angle) < 0 ? -1 : 1
      }
    }).isColliding;
    if (c.rect.cyan) {
      play("powerUp");
      particle(e.p);
      addScore(multiplier, e.p);
      multiplier++;
      return false;
    }
    if (c["char"].a || c["char"].b || c.rect.light_blue) {
      if (c.rect.light_blue) {
        text("X", vec(e.p).sub(50, 50).div(2).add(50, 50));
      } else {
        text("X", pos);
      }
      play("lucky");
      end();
    }
    return true;
  });
}

