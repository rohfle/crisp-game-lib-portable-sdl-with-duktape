title = "SCRAMBIRD";
description = "\n[Tap]\n Fly & Shoot\n";
characters = ["\n rr\n rr\nyrry\nyrry\ny  y\ny  y\n", "\n bbbb\nbbbbbb\n bbbb\n r  r\nr    r\n", "\npp \n l ll\n rlrrl\n rllll\n   lr\n\n\n", "\n\n l ll\n rlrrl\n rllll\n l lr\npp\n", "\nl l\n"];
options = {
  theme: "pixel",
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 3000
};
var walls;
var wallHeight;
var wallHeightVel;
var missiles;
var tanks;
var nextTankDist;
var ship;
var shots;
var bombs;
var fuel;
var multiplier;
function update() {
  if (!ticks) {
    walls = times(11, function (i) {
      return {
        x: i * 10,
        height: 10
      };
    });
    wallHeight = 10;
    wallHeightVel = 0;
    missiles = [];
    tanks = [];
    nextTankDist = 10;
    ship = {
      pos: vec(10, 50),
      vy: 0
    };
    shots = [];
    bombs = [];
    fuel = 50;
    multiplier = 1;
  }
  var scr = difficulty * 0.3;
  var wallColor = ["purple", "blue", "green", "red"][floor(ticks / 420) % 4];
  color(wallColor);
  walls.forEach(function (w) {
    w.x -= scr;
    if (w.x < -10) {
      w.x += 110;
      wallHeight += wallHeightVel;
      if (wallHeight < 10 && wallHeightVel < 0 || wallHeight > 50 && wallHeightVel > 0) {
        wallHeightVel *= -1;
        wallHeight += wallHeightVel;
      } else if (rnd() < 0.2) {
        wallHeightVel = 0;
      } else if (rnd() < 0.3) {
        wallHeightVel = rnd() < 0.5 ? -10 : 10;
      }
      w.height = wallHeight;
      nextTankDist--;
      if (nextTankDist < 0) {
        tanks.push(vec(w.x + 5, 90 - w.height - 3));
        nextTankDist = rnd(1, 16);
      } else if (rnd() < 0.5) {
        missiles.push({
          pos: vec(w.x + 5, 90 - w.height - 3),
          launchTicks: rnd() < 0.5 / sqrt(difficulty) ? 9999 : rnd(200, 300) / difficulty
        });
      }
    }
    rect(w.x, 90 - w.height, 9, w.height);
    rect(w.x, 0, 9, 5);
  });
  color("black");
  if (input.isJustPressed) {
    play(fuel > 0 ? "laser" : "hit");
    ship.vy -= difficulty * (fuel > 0 ? 0.5 : 0.1);
    shots.push(vec(ship.pos));
    bombs.push({
      pos: vec(ship.pos),
      vel: vec(2 * sqrt(difficulty), 0)
    });
  }
  ship.vy += 0.015 * difficulty;
  ship.vy *= 0.98;
  ship.pos.y += ship.vy;
  if (char(addWithCharCode("c", ship.vy < 0 ? 0 : 1), ship.pos).isColliding.rect[wallColor]) {
    play("explosion");
    end();
  }
  color("red");
  particle(ship.pos.x - 2, ship.pos.y, 0.5, 0.5, PI, PI / 5);
  remove(shots, function (s) {
    s.x += 2 * sqrt(difficulty);
    if (char("e", s).isColliding.rect[wallColor]) {
      return true;
    }
    return s.x > 103;
  });
  color("cyan");
  remove(bombs, function (b) {
    b.vel.y += 0.1 * difficulty;
    b.vel.mul(0.9);
    b.pos.add(b.vel);
    if (bar(b.pos, 2, 2, b.vel.angle).isColliding.rect[wallColor]) {
      return true;
    }
  });
  remove(missiles, function (m) {
    m.pos.x -= scr;
    m.launchTicks--;
    if (m.launchTicks < 0) {
      m.pos.y -= difficulty * 0.5;
    }
    color("black");
    var c = char("a", m.pos).isColliding;
    if (c["char"].e || c.rect.cyan) {
      play("hit");
      color("red");
      particle(m.pos);
      addScore(multiplier, m.pos);
      multiplier++;
      return true;
    }
    if (c["char"].c || c["char"].d) {
      play("explosion");
      end();
    }
    if (m.pos.x < -3 || m.pos.y < -3) {
      if (multiplier > 1) {
        multiplier--;
      }
      return true;
    }
  });
  color("black");
  remove(tanks, function (t) {
    t.x -= scr;
    var c = char("b", t).isColliding;
    if (c["char"].e || c.rect.cyan) {
      play("powerUp");
      color("blue");
      particle(t);
      fuel = clamp(fuel + 10, 0, 50);
      return true;
    }
    if (c["char"].c || c["char"].d) {
      play("explosion");
      end();
    }
    return t.x < -3;
  });
  color("transparent");
  remove(shots, function (s) {
    var c = char("e", s).isColliding["char"];
    return c.a || c.b;
  });
  remove(bombs, function (b) {
    var c = bar(b.pos, 2, 2, b.vel.angle).isColliding["char"];
    return c.a || c.b;
  });
  fuel = clamp(fuel - difficulty * 0.025, 0, 50);
  color("yellow");
  text("FUEL", 10, 93);
  rect(40, 90, fuel, 6);
  color("blue");
  rect(40 + fuel, 90, 50 - fuel, 6);
}

