title = "GLOOP";
description = "\n[Slide] Move\n";
characters = ["\n llll\nllllll\nll  ll\nll  ll\n", "\n lll\nl   l\nl l l\nl   l\n lll\n", "\nl l\n l\nl l\n", "\n l l l\nl   l\n l   l\nl   l\n l   l\nl l l\n"];
options = {
  isPlayingBgm: true,
  isReplayEnabled: true
};
var p, v, vya, pis, sps;
function update() {
  if (ticks === 0) {
    p = vec(50, 50);
    v = vec();
    vya = -1;
    pis = [];
    sps = [];
  }
  color("light_cyan");
  for (var x = 0; x < 15; x++) {
    for (var y = 0; y < 18; y++) {
      if ((x + y) % 2 === 0) {
        char("d", x * 6 + 8, y * 6);
      }
    }
  }
  v.y += 0.02 * difficulty * vya;
  v.mul(0.99);
  p.add(v);
  p.x = clamp(input.pos.x, 8, 92);
  p.y = wrap(p.y, 0, 99);
  color("black");
  char("a", p);
  while (pis.length < 7) {
    pis.push({
      p: vec(rnd(10, 90), rnd(10, 90))
    });
  }
  if (rnd() < 0.02 * difficulty) {
    var pp = vec(rnd(10, 90), rnd(10, 90));
    if (abs(pp.x - p.x) + abs(wrap(pp.y - p.y, -50, 50)) > 25) {
      sps.push({
        p: pp,
        isAlive: true
      });
    }
  }
  pis = pis.filter(function (pi) {
    var isAlive = true;
    if (char("b", pi.p).isColliding["char"].a) {
      if (abs(v.y) > 1) {
        play("select");
        isAlive = false;
        sps.map(function (sp) {
          if (sp.p.distanceTo(pi.p) < 20) {
            play("coin");
            sp.isAlive = false;
          }
        });
      } else {
        play("hit");
      }
      v.y *= -0.3;
      vya *= -1;
      p.y = pi.p.y + vya * 5;
    }
    return isAlive;
  });
  var sc = 1;
  color("red");
  sps = sps.filter(function (sp) {
    if (sp.isAlive) {
      if (char("c", sp.p).isColliding["char"].a) {
        play("explosion");
        end();
      }
      return true;
    } else {
      addScore(sc, sp.p);
      sc++;
    }
  });
}

