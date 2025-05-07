title = "SMOKE G";
description = "\n[Tap] Smoke\n";
characters = ["\nllllll\nll l l\nll l l\nllllll\n l  l\n l  l\n  ", "\nllllll\nll l l\nll l l\nllllll\nll  ll\n  ", "\n  lll\nll l l\n llll\n l  l\nll  ll\n", "\n  lll\nll l l\n llll\n  ll\n l  l\n l  l\n"];
options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 9
};
var grenades;
var smokes;
var enemies;
var nextEnemyDist;
var currentSide;
var nextSideChangeCount;
var player;
var shotRange = 50;
function update() {
  if (!ticks) {
    grenades = [];
    smokes = [];
    enemies = [];
    nextEnemyDist = 0;
    currentSide = 1;
    nextSideChangeCount = 0;
    player = {
      pos: vec(50, 90),
      angle: -PI / 2
    };
  }
  var scr = sqrt(difficulty) * 0.1;
  if (input.isJustPressed && smokes.length < 9) {
    play("select");
    grenades.push({
      pos: vec(player.pos),
      target: vec(input.pos).clamp(0, 99, 0, 99),
      ticks: 0
    });
  }
  color("light_black");
  remove(grenades, function (g) {
    g.ticks += sqrt(difficulty);
    g.pos.add(vec(g.target).sub(g.pos).mul(0.1));
    g.pos.y += cos(g.ticks / 30 * PI * 4) + scr;
    box(g.pos, 4);
    if (g.ticks > 30) {
      play("hit");
      smokes.push({
        pos: vec(g.target),
        radius: 0,
        isExtending: true
      });
      return true;
    }
  });
  color("black");
  remove(smokes, function (s) {
    if (s.isExtending) {
      s.radius += (10 - s.radius) * 0.2 * sqrt(difficulty);
      if (s.radius > 9) {
        s.isExtending = false;
        s.radius = 10;
      }
    } else {
      s.radius *= 1 - 0.005 * sqrt(difficulty);
    }
    s.pos.y += scr;
    arc(s.pos, s.radius);
    return !s.isExtending && s.radius < 2;
  });
  if (enemies.length === 0) {
    nextEnemyDist = 0;
  }
  nextEnemyDist -= scr;
  if (nextEnemyDist < 0) {
    nextSideChangeCount--;
    if (nextSideChangeCount < 0) {
      currentSide *= -1;
      nextSideChangeCount = rnd(1, 5);
      nextEnemyDist += 7;
    }
    var pos = vec(50 + rnd(40) * currentSide, -3);
    enemies.push({
      pos: pos,
      angle: player.pos.angleTo(pos) + rnds(0.2)
    });
    nextEnemyDist += rnd(5, 9);
  }
  var te;
  var minDist = 99;
  color("transparent");
  enemies.forEach(function (e) {
    var ta = player.pos.angleTo(e.pos);
    var d = player.pos.distanceTo(e.pos);
    if (bar(player.pos, d, 2, ta, 0).isColliding.rect.black) {
      return;
    }
    if (d < minDist) {
      minDist = d;
      te = e;
    }
  });
  if (te != null) {
    var ta = player.pos.angleTo(te.pos);
    var oa = wrap(ta - player.angle, -PI, PI);
    var av = 0.012 * sqrt(difficulty);
    if (abs(oa) < av) {
      player.angle = ta;
    } else {
      player.angle += oa < 0 ? -av : av;
    }
  }
  color("light_cyan");
  bar(player.pos, shotRange * 1.1, 2, player.angle, 0);
  color("blue");
  char(addWithCharCode("a", floor(ticks / 20) % 2), player.pos, {
    mirror: {
      x: abs(wrap(player.angle, -PI, PI)) < PI / 2 ? 1 : -1
    }
  });
  remove(enemies, function (e) {
    e.pos.y += scr;
    color("transparent");
    var c1 = bar(e.pos, e.pos.distanceTo(player.pos), 2, e.pos.angleTo(player.pos), 0).isColliding.rect;
    var av = 0.008 * sqrt(difficulty);
    if (!c1.black) {
      var _ta = e.pos.angleTo(player.pos);
      var _oa = wrap(_ta - e.angle, -PI, PI);
      if (abs(_oa) < av) {
        e.angle = _ta;
      } else {
        e.angle += _oa < 0 ? -av : av;
      }
      color("light_purple");
    } else {
      color("light_black");
    }
    var c2 = bar(e.pos, shotRange, 2, e.angle, 0).isColliding["char"];
    if (!c1.black && (c2.a || c2.b)) {
      play("explosion");
      color("purple");
      bar(e.pos, shotRange, 4, e.angle, 0);
      end();
    }
    color(c1.black ? "light_red" : "red");
    var c3 = char(addWithCharCode("c", floor(ticks / 30) % 2), e.pos, {
      mirror: {
        x: abs(wrap(e.angle, -PI, PI)) < PI / 2 ? 1 : -1
      }
    }).isColliding.rect;
    if (c3.light_cyan) {
      play("laser");
      color("cyan");
      bar(player.pos, shotRange, 4, player.angle, 0);
      particle(player.pos, 20, 3, player.angle, 0);
      color("red");
      particle(e.pos);
      addScore(1);
      return true;
    }
    if (e.pos.y > 99) {
      play("explosion");
      color("red");
      text("X", e.pos.x, 96);
      end();
    }
  });
}

