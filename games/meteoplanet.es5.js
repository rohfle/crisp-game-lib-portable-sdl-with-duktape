title = "METEO PLANET";
description = "\n[Tap] Move\n";
characters = ["\nllllll\nll l l\nll l l\nllllll\n l  l\n l  l\n  ", "\nllllll\nll l l\nll l l\nllllll\nll  ll\n  ", "\n lll\nl l l\nl lll\nll ll\n lll\n"];
options = {
  theme: "dark",
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 6
};
var fallings;
var nextFallingsTicks;
var nextFallingAngle;
var angle;
var targetAngle;
var animTicks;
var stars;
function update() {
  if (!ticks) {
    fallings = [{
      dist: 53,
      angle: rndi(4) * PI / 2,
      type: 0
    }];
    nextFallingsTicks = 0;
    nextFallingAngle = rndi(1, 4);
    angle = 0;
    targetAngle = 0;
    animTicks = 0;
    stars = times(24, function (_) {
      return {
        dist: rnd(10, 70),
        angle: rnd(PI * 2)
      };
    });
  }
  var sd = sqrt(difficulty);
  color("light_black");
  var sp = vec();
  stars.forEach(function (s) {
    sp.set(50, 50).addWithAngle(s.angle - angle, s.dist);
    box(sp, 1);
  });
  color("black");
  if (input.isJustPressed) {
    play("select");
    targetAngle += PI / 2;
  }
  if (angle < targetAngle) {
    angle += 0.3 * sd;
    if (angle > targetAngle) {
      angle = targetAngle;
      if (angle > PI * 2.2) {
        angle = targetAngle = PI / 2;
      }
    }
    animTicks += sd;
  }
  char(addWithCharCode("a", floor(animTicks / 3) % 2), 50, 42);
  arc(50, 50, 3, 2, -angle + PI * 0.2, -angle + PI * 2.2);
  nextFallingsTicks--;
  if (nextFallingsTicks < 0) {
    var cc = rndi(6);
    var dist = 70;
    var _angle = nextFallingAngle * (PI / 2);
    times(11, function (i) {
      var type = abs(i - 5);
      if (type <= cc) {
        fallings.push({
          dist: dist,
          angle: _angle,
          type: type === 0 ? 0 : cc - type + 1
        });
      }
      dist += 6;
    });
    nextFallingsTicks = rnd(30, 50) / sqrt(sd);
    nextFallingAngle += rndi(1, 4);
  }
  var fp = vec();
  remove(fallings, function (f) {
    f.dist -= 0.5 * sd;
    fp.set(50, 50).addWithAngle(f.angle - angle, f.dist);
    if (f.type === 0) {
      color("black");
      var c = char("c", fp).isColliding["char"];
      if (c.a || c.b) {
        play("explosion");
        end();
      }
    } else {
      color("yellow");
      var _c = box(fp, f.type).isColliding["char"];
      if (_c.a || _c.b) {
        play("powerUp");
        addScore(f.type, fp);
        return true;
      }
    }
    if (f.dist < 5) {
      if (f.type === 0) {
        play("hit");
        particle(fp);
      }
      return true;
    }
  });
}

