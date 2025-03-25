title = "FROM TWO SIDES";
description = "\n[Slide] Move\n";
characters = ["\nrrrrrr\nrRRRRr\n rRRr\n ", "\nrRRr\n rr\n rr\n", "\n G\nGgG\n G\n"];
options = {
  theme: "pixel",
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 9
};
var arrows;
var nextArrowTicks;
var safes;
function update() {
  if (!ticks) {
    arrows = [];
    nextArrowTicks = [0, 60];
    safes = [{
      x: 50,
      vx: -1
    }, {
      x: 50,
      vx: 1
    }];
  }
  safes.forEach(function (s) {
    s.x += s.vx;
    if (s.x < 9 && s.vx < 0 || s.x > 90 && s.vx > 0) {
      s.vx *= -1;
    }
    s.vx += rnds(0.5);
    s.vx *= 0.98;
  });
  var _loop = function _loop(i) {
    nextArrowTicks[i]--;
    if (nextArrowTicks[i] < 0) {
      play("explosion");
      var w = rnd(10, 40) / sqrt(difficulty) + 10;
      times(17, function (xi) {
        var x = xi * 6 + 2;
        var isSafe = false;
        safes.forEach(function (s) {
          isSafe = isSafe || abs(x - s.x) < w / 2;
        });
        if (!isSafe) {
          arrows.push({
            pos: vec(x, i === 0 ? -3 : 103),
            vy: 0,
            wy: i === 0 ? 1 : -1
          });
          addScore(1);
        }
      });
      nextArrowTicks[i] = rnd(60, 90) / sqrt(difficulty);
    }
  };
  for (var i = 0; i < 2; i++) {
    _loop(i);
  }
  var s = difficulty * 2;
  remove(arrows, function (a) {
    a.vy += (a.wy * s - a.vy) * 0.05;
    a.pos.y += a.vy;
    if (a.wy > 0) {
      char("a", a.pos.x, a.pos.y - 1);
      char("b", a.pos.x, a.pos.y + 2);
    } else {
      char("a", a.pos.x, a.pos.y + 1, {
        mirror: {
          y: -1
        }
      });
      char("b", a.pos.x, a.pos.y - 2, {
        mirror: {
          y: -1
        }
      });
    }
    color("red");
    particle(a.pos, 0.4, -abs(a.vy), PI / 2 * a.wy, 0.3);
    color("black");
    return a.pos.y < -3 || a.pos.y > 103;
  });
  var x = clamp(input.pos.x, 1, 98);
  var c = char("c", x, 50).isColliding["char"];
  if (c.a || c.b) {
    play("powerUp");
    end();
  }
}

