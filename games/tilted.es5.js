title = "TILTED";
description = "\n[Tap]\n Jump\n Jump & Turn\n";
characters = ["\n  lll\n  lll\n lll\n  l\n l ll\nl    l\n", "\n  lll\n  lll\nllllll\n  l\n l l\n l l\n", "\n  lll\nl lll\n ll\n  l  \n l lll\nl    \n", "\n llll\nl llll\nllllll\nllllll\nllllll\n llll\n",, "\n llll\nl llll\nllllll\nllllll\nllllll\n llll\n"];
options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 3000
};
var bars;
var nextBarDist;
var barCount;
var balls;
var nextBallTicks;
var player;
function update() {
  if (!ticks) {
    bars = [{
      pos: vec(50, 0),
      angle: 0,
      length: 90
    }];
    nextBarDist = 10;
    barCount = 0;
    balls = [];
    nextBallTicks = 60;
    player = {
      pos: vec(50, -6),
      vel: vec(1, 0),
      bar: bars[0],
      jumpCount: 0
    };
  }
  var scr = difficulty * 0.02;
  if (player.pos.y < 60) {
    scr += (60 - player.pos.y) * 0.1;
  }
  addScore(scr);
  var pc;
  if (player.bar != null) {
    var b = player.bar;
    var d = vec(player.pos.x, player.pos.y + 5).distanceTo(b.pos);
    if (player.pos.x < b.pos.x) {
      d = -d;
    }
    d += player.vel.x / 2 * sqrt(difficulty);
    if (abs(d) > b.length / 2 + 6) {
      player.bar = null;
      player.jumpCount = 0;
    }
    player.pos.set(vec(b.pos).addWithAngle(b.angle, d).add(0, -5));
    if (input.isJustPressed) {
      play("jump");
      player.bar = null;
      player.vel.y = -2;
      player.pos.y -= 2 * sqrt(difficulty);
      player.jumpCount = 1;
    }
    pc = addWithCharCode("a", floor(ticks / 15) % 2);
  } else {
    if (input.isJustPressed) {
      play("jump");
      if (player.jumpCount > 0) {
        player.vel.x *= -1;
      } else {
        player.jumpCount = 1;
      }
      player.vel.y = -2 / player.jumpCount / player.jumpCount;
      player.jumpCount++;
    }
    player.pos.y += scr;
    player.vel.y += input.isPressed ? 0.05 : 0.1;
    player.pos.add(vec(player.vel).mul(sqrt(difficulty) / 2));
    pc = "c";
  }
  if (player.pos.x < 8 && player.vel.x < 0 || player.pos.x > 92 && player.vel.x > 0) {
    player.vel.x *= -1;
  }
  if (player.pos.y > 99) {
    play("explosion");
    end();
  }
  color("black");
  char(pc, player.pos, {
    mirror: {
      x: player.vel.x > 0 ? 1 : -1
    }
  });
  nextBallTicks--;
  if (nextBallTicks < 0) {
    balls.push({
      pos: vec(rnd(20, 80), -40),
      vel: vec(rnds(0.5, 1), 0),
      ticks: 0
    });
    nextBallTicks += rnd(60, 80) / difficulty;
  }
  remove(balls, function (b) {
    b.pos.y += scr;
    b.vel.y += 0.05;
    b.vel.mul(0.995);
    b.pos.add(vec(b.vel).mul(sqrt(difficulty) / 2));
    if (b.pos.x < 8 && b.vel.x < 0 || b.pos.x > 92 && b.vel.x > 0) {
      b.vel.x *= -1;
    }
    color("yellow");
    var c = char("d", b.pos).isColliding["char"];
    if (c.a || c.b || c.c) {
      play("hit");
      if (player.bar != null) {
        player.bar.pos.y = 999;
        player.bar = null;
        player.vel.y += 1;
      } else {
        player.vel.y += 4;
      }
      particle(b.pos, 20, 3, PI / 2, PI / 3);
      return true;
    }
    if (c.d) {
      b.ticks = 999;
      char("e", b.pos);
    }
    b.ticks++;
    if (b.ticks > 500) {
      particle(b.pos);
      return true;
    }
    return b.pos.y > 103;
  });
  color("transparent");
  balls.forEach(function (b) {
    if (char("d", b.pos).isColliding["char"].e) {
      b.ticks = 999;
    }
  });
  color("light_black");
  rect(0, 0, 5, 100);
  rect(95, 0, 5, 100);
  remove(bars, function (b) {
    b.pos.y += scr;
    var c = bar(b.pos, b.length, 3, b.angle).isColliding["char"];
    if (player.bar == null && (c.a || c.b || c.c)) {
      play("laser");
      if (player.vel.y <= 0) {
        player.vel.y *= -0.5;
        player.pos.y += player.vel.y * 3 * difficulty;
      } else {
        player.bar = b;
      }
    }
    if (c.d) {
      var _d = 99;
      var hb = balls[0];
      balls.forEach(function (bl) {
        var bd = bl.pos.distanceTo(b.pos);
        if (bd < _d) {
          _d = bd;
          hb = bl;
        }
      });
      if (hb != null) {
        var _d2 = hb.pos.distanceTo(b.pos);
        if (_d2 > b.length / 2) {
          hb.vel.mul(-1);
        } else {
          var a = hb.vel.angle - (hb.vel.angle - b.angle) * 2;
          var s = hb.vel.length;
          hb.vel.set().addWithAngle(a, s);
        }
        hb.pos.add(vec(hb.vel).mul(sqrt(difficulty)));
        hb.ticks += 30;
      }
    }
    return b.pos.y > 120;
  });
  nextBarDist -= scr;
  while (nextBarDist < 0) {
    var isSide = barCount % 2;
    var length = rnd(15, 22);
    var x = isSide ? 50 + rnds(25, 50 - length / 2) : rnd(35, 65);
    var _b = {
      pos: vec(x, -9 - nextBarDist),
      angle: rnd() < (isSide ? 0.2 : 0.7) ? 0 : rnds(PI / 5),
      length: length
    };
    bars.push(_b);
    if (isSide) {
      bars.push({
        pos: vec(100 - x, _b.pos.y),
        angle: -_b.angle,
        length: length
      });
    }
    nextBarDist += rnd(15, 20);
    barCount++;
  }
}

