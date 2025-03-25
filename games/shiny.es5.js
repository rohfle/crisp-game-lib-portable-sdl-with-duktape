title = "SHINY";
description = "\n[Hold] Rainy\n";
characters = ["\n  ll\n  l\nlllll\n  l\n l lll\nl\n", "\n   ll\n   l\nlllll\n  l\nll ll\n     l\n", "\n  lll\n l l l\n  lll\n   l\nllll\n    l\n", "\n lll\nl l l\n lll\n  l\n l lll\nl   \n", "\nl l l\nl l l\n lll\n  l\n l l\nl   l \n", "\n  ll\n llll\nllllll\nllllll\n llll\n  ll\n"];
options = {
  viewSize: {
    x: 200,
    y: 100
  },
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 7
};
var humans;
var drops;
var grounds;
var clouds;
var rainyRatio;
var windY;
var humansCount;
var humanY = 89;
var rightEdgeGroundIndex = 20;
function update() {
  if (!ticks) {
    humans = [];
    drops = [];
    grounds = times(22, function (i) {
      return {
        pos: vec((i - 1) * 10 + 5, 95),
        size: 8
      };
    });
    clouds = times(30, function (i) {
      var rainyPos = vec((i + 1) / 31 * 199 + rnds(3), rnd(5, 15));
      var shinyPos = vec(rainyPos.x < 99 ? -20 : 220, rainyPos.y);
      return {
        pos: vec(shinyPos),
        rainyPos: rainyPos,
        shinyPos: shinyPos,
        radius: rnd(5, 10),
        weakDropTicks: rnd(99),
        strongDropTicks: rnd(100, 900)
      };
    });
    rainyRatio = 0;
    humansCount = 0;
    windY = 0;
  }
  if (humans.length === 0) {
    if (humansCount < 9) {
      humansCount++;
    }
    humans = times(humansCount, function () {
      return {
        pos: vec(-4, humanY),
        speed: rnd(0.1, 0.15) * difficulty,
        ticks: rndi(999),
        isRunning: false,
        isFalling: false
      };
    });
    grounds[rightEdgeGroundIndex].size = 8;
  }
  var isRainy = input.isPressed;
  if (input.isJustPressed) {
    play("hit");
    windY = rnds(0.5) * sqrt(difficulty);
    grounds[rightEdgeGroundIndex].size -= 0.1;
  }
  if (input.isJustReleased) {
    play("hit");
  }
  rainyRatio += !isRainy && rainyRatio > 0 ? -1 : isRainy && rainyRatio < 10 ? 1 : 0;
  var rr = rainyRatio / 10;
  color("yellow");
  var p1 = vec(100, 10);
  var p2 = vec();
  char("f", p1);
  if (rr < 1) {
    for (var i = 0; i < 7; i++) {
      var a = ticks * 0.05 + i * PI * 2 / 7;
      var l = abs(sin(i + ticks * 0.05) * 5 * (1 - rr)) + 10;
      p1.set(100, 10).addWithAngle(a, 7);
      p2.set(100, 10).addWithAngle(a, l);
      line(p1, p2);
    }
  }
  color("light_black");
  clouds.forEach(function (c) {
    c.pos.set(c.rainyPos.x * rr + c.shinyPos.x * (1 - rr), c.rainyPos.y * rr + c.shinyPos.y * (1 - rr));
    if (c.pos.y > -9 && c.pos.y < 209) {
      box(c.pos, c.radius * 2, c.radius * 2);
    }
    c.weakDropTicks--;
    if (c.weakDropTicks < 0) {
      if (isRainy) {
        addDrop(c.pos.x, c.pos.y + c.radius, "weak");
      }
      c.weakDropTicks = rnd(100, 200);
    }
    c.strongDropTicks--;
    if (c.strongDropTicks < 0) {
      if (isRainy) {
        addDrop(c.pos.x, c.pos.y + c.radius, "strong");
      }
      c.strongDropTicks = rnd(500, 999) / difficulty;
    }
  });
  grounds.forEach(function (g, i) {
    if (i === rightEdgeGroundIndex) {
      color("black");
      if (g.size >= 1) {
        box(g.pos.x, g.pos.y - (4 - g.size / 2), 8, g.size);
        g.size -= 0.005 * difficulty;
      }
    } else {
      if (g.size < 8) {
        color("light_black");
        box(g.pos, g.size, g.size);
        g.size += 0.12 * difficulty;
      } else {
        color("black");
        box(g.pos, 8, 8);
      }
    }
  });
  color("red");
  humans = humans.filter(function (h) {
    var ci = h.isRunning ? 2 + floor(h.ticks / 15) % 2 : 0 + floor(h.ticks / 30) % 2;
    if (!h.isFalling) {
      h.pos.x += h.speed * (h.isRunning ? 5 : 1);
    } else {
      ci = 4;
    }
    var c = addWithCharCode("a", ci);
    if (!char(c, h.pos).isColliding.rect.black) {
      h.isFalling = true;
      h.pos.y += difficulty;
      if (h.pos.y > 103) {
        humansCount--;
        if (humansCount <= 0) {
          play("lucky");
          end();
        } else {
          play("explosion");
        }
        return false;
      }
    } else {
      h.pos.y = humanY;
      h.isFalling = false;
    }
    h.ticks++;
    var ti = floor(30 / difficulty);
    if (h.ticks % ti === 0) {
      h.isRunning = isRainy;
    }
    if (h.pos.x > 203) {
      play("powerUp");
      var s = floor(grounds[20].size * humans.length);
      if (s > 0) {
        addScore(s, 190, 80);
      }
      return false;
    }
    return true;
  });
  drops = drops.filter(function (d) {
    d.pos.add(d.vel);
    if (d.type === "strong") {
      color("blue");
      var cc = line(d.pos, vec(d.vel).normalize().mul(4).add(d.pos), 3).isColliding["char"];
      if (cc.a || cc.b || cc.c || cc.d) {
        return false;
      }
    } else {
      color("light_blue");
      line(d.pos, vec(d.vel).normalize().mul(3).add(d.pos), 2);
    }
    if (d.pos.y > 90) {
      if (d.type === "strong") {
        var gi = floor(d.pos.x / 10) + 1;
        if (gi >= 2 && gi < 20) {
          play("select");
          grounds[gi].size = 0;
        }
      }
      return false;
    }
    return true;
  });
  function addDrop(x, y, t) {
    drops.push({
      pos: vec(x, y),
      vel: vec((rnds(0.2) + windY) * difficulty, difficulty),
      type: t
    });
  }
}

