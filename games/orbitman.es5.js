title = "ORBIT MAN";
description = "\n[Tap] Launch\n";
characters = [];
options = {
  theme: "dark",
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 600
};
var planets;
var nextPlanetDist;
var man;
var flyingTicks;
var multiplier;
var stars;
function update() {
  if (!ticks) {
    planets = [{
      pos: vec(50, 0),
      radius: 5,
      isDestroyed: false
    }];
    nextPlanetDist = 20;
    man = {
      planet: planets[0],
      angle: PI / 2,
      av: 1,
      pos: vec(50, 0),
      target: vec(50, 0)
    };
    flyingTicks = 0;
    multiplier = 1;
    stars = times(20, function () {
      return {
        pos: vec(rnd(99), rnd(99)),
        vy: rnd(3, 6)
      };
    });
  }
  var scr = sqrt(difficulty) * 0.05;
  flyingTicks = clamp(flyingTicks - difficulty, 1, 99);
  if (man.planet.pos.y < 80) {
    scr += (80 - man.planet.pos.y) * (0.1 / flyingTicks);
  }
  color("light_black");
  stars.forEach(function (s) {
    s.pos.y += scr / s.vy;
    if (s.pos.y > 99) {
      s.pos.set(rnd(99), 0);
      s.vy = rnd(3, 6);
    }
    rect(s.pos, 1, 1);
  });
  nextPlanetDist -= scr;
  while (nextPlanetDist < 0) {
    var radius = rnd(4, 9);
    planets.push({
      pos: vec(rnd(10 + radius, 90 - radius), nextPlanetDist - 30),
      radius: radius,
      isDestroyed: false
    });
    nextPlanetDist += radius * rnd(1, 2);
  }
  man.angle += difficulty * 0.03 * man.av;
  color("light_blue");
  bar(man.planet.pos, 99, 4, man.angle, -man.planet.radius * 0.015);
  color("black");
  var nextPlanet;
  var maxDist = 0;
  var piercedPlanets = [man.planet];
  remove(planets, function (p) {
    if (p.isDestroyed) {
      particle(p.pos, ceil(p.radius * 4), sqrt(p.radius) * 0.5);
      return true;
    }
    p.pos.y += scr;
    var c = arc(p.pos, p.radius).isColliding.rect;
    if (p !== man.planet && c.black) {
      return true;
    }
    if (p !== man.planet && p.pos.y > -p.radius - 4 && c.light_blue) {
      piercedPlanets.push(p);
      var d = p.pos.distanceTo(man.planet.pos);
      if (d > maxDist) {
        nextPlanet = p;
        maxDist = d;
      }
    }
    return p.pos.y > 100 + p.radius * 2;
  });
  if (input.isJustPressed) {
    if (nextPlanet == null) {
      play("explosion");
      for (var i = 0; i < 99; i++) {
        man.pos.addWithAngle(man.angle, 3);
        if (!man.pos.isInRect(5, 5, 95, 95)) {
          break;
        }
      }
      end();
    } else {
      play("powerUp");
      if (multiplier > 1) {
        multiplier--;
      }
      if (piercedPlanets.length > 2) {
        play("hit");
      }
      piercedPlanets.forEach(function (p) {
        if (p !== nextPlanet) {
          p.isDestroyed = true;
          addScore(multiplier, p.pos);
          multiplier++;
        }
      });
      man.planet = nextPlanet;
      man.angle += PI;
      man.av *= -1;
      flyingTicks = 20;
    }
  }
  var a = man.angle;
  man.target.set(man.planet.pos).addWithAngle(a, man.planet.radius);
  man.pos.add(vec(man.target).sub(man.pos).mul(0.1));
  color("cyan");
  var p1 = vec(man.pos).addWithAngle(a, 4);
  var p2 = vec(p1).addWithAngle(a + PI * 0.75, 3);
  line(p1, p2, 2);
  p2.set(p1).addWithAngle(a - PI * 0.75, 3);
  line(p1, p2, 2);
  p2.set(p1).addWithAngle(a, 4);
  line(p1, p2, 2);
  p2.set(p1).addWithAngle(a - PI * 0.3, 3);
  p1.addWithAngle(a + PI * 0.3, 3);
  line(p1, p2, 2);
  if (man.planet.pos.y - man.planet.radius > 99) {
    play("explosion");
    end();
  }
}

