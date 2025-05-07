title = "M JAMMING";
description = "\n[Hold]\n Expand range\n[Release]\n Jamming\n";
characters = ["\nbblb\nb l b\n  b\nbb bb\n"];
options = {
  theme: "dark",
  isPlayingBgm: true,
  isReplayEnabled: true,
  isDrawingScoreFront: true,
  seed: 6
};
var robot;
var missiles;
var nextMissileTicks;
var explosions;
var stars;
var multiplier;
function update() {
  if (!ticks) {
    robot = {
      pos: vec(50, 50),
      vel: vec(),
      radius: 0
    };
    missiles = [];
    nextMissileTicks = 0;
    explosions = [];
    stars = times(30, function () {
      return {
        pos: vec(rnd(99), rnd(99)),
        spRatio: rnd(0.2, 0.3),
        color: ["light_cyan", "light_purple", "light_yellow"][rndi(3)]
      };
    });
    multiplier = 1;
  }
  var scr = vec(50, 50).sub(robot.pos).mul(0.05 * sqrt(difficulty));
  stars.forEach(function (s) {
    s.pos.add(vec(scr).mul(s.spRatio)).wrap(0, 99, 0, 99);
    color(s.color);
    rect(s.pos, 1, 1);
  });
  color("red");
  remove(explosions, function (e) {
    e.radius += sqrt(difficulty) * e.vr * 0.5;
    if (e.radius > e.targetRadius && e.vr > 0) {
      e.vr = -1;
    }
    arc(e.pos, e.radius, 5);
    return e.radius < 1;
  });
  robot.vel.mul(0.98);
  robot.pos.add(robot.vel).add(scr);
  color("black");
  char("a", robot.pos, {
    mirror: {
      x: robot.vel.x < 0 ? -1 : 1
    }
  });
  if (input.isJustPressed) {
    play("select");
  }
  if (input.isPressed || input.isJustReleased) {
    robot.radius *= 1 + 0.01 * sqrt(difficulty);
    robot.vel.mul(0.9);
    color("cyan");
  } else {
    robot.radius = clamp(robot.radius + sqrt(difficulty) * 0.5, 0, 15);
    color("light_cyan");
  }
  arc(robot.pos, robot.radius, 2);
  if (input.isJustReleased || robot.radius > 50) {
    play("laser");
    multiplier = 1;
    var mc = 0;
    missiles.forEach(function (m) {
      if (m.pos.distanceTo(robot.pos) < robot.radius + 1 && m.explosionRadius < 0) {
        mc++;
      }
    });
    missiles.forEach(function (m) {
      if (m.pos.distanceTo(robot.pos) < robot.radius + 1 && m.explosionRadius < 0) {
        m.angle = robot.pos.angleTo(m.pos);
        m.explosionRadius = clamp(mc * sqrt(mc), 1, 25);
        m.angleVel = 0;
        m.speed /= 2;
        addScore(multiplier, m.pos);
        multiplier++;
      }
    });
    robot.radius = mc;
  }
  nextMissileTicks--;
  if (nextMissileTicks < 0) {
    var c = floor(rnd(6, 9) * difficulty);
    times(c, function () {
      var pos = vec(50, 50).addWithAngle(rnd(PI * 2), 99);
      var angle = pos.angleTo(rnd(40, 60), rnd(40, 60));
      var angleVel = rnd(1, sqrt(difficulty)) * 0.005;
      var speed = sqrt(difficulty) * 0.4;
      missiles.push({
        pos: pos,
        angle: angle,
        angleVel: angleVel,
        speed: speed,
        explosionRadius: -1
      });
    });
    nextMissileTicks = rnd(60, 70);
  }
  var nm;
  var nmDist = 50;
  remove(missiles, function (m) {
    var ta = m.pos.angleTo(robot.pos);
    var oa = wrap(m.angle - ta, -PI, PI);
    if (oa > m.angleVel) {
      m.angle -= m.angleVel;
    } else if (oa < -m.angleVel) {
      m.angle += m.angleVel;
    } else {
      m.angle = ta;
    }
    m.pos.addWithAngle(m.angle, m.speed).add(scr);
    color(m.explosionRadius < 0 ? "purple" : "cyan");
    var c = bar(m.pos, 3, 3, m.angle).isColliding;
    color("red");
    particle(m.pos, 1, m.speed, m.angle + PI, 1);
    if (c.rect.red) {
      if (m.explosionRadius > 1) {
        play("powerUp");
        explosions.push({
          pos: m.pos,
          radius: 1,
          targetRadius: m.explosionRadius,
          vr: 1
        });
      } else {
        play("coin");
        particle(m.pos, 9, 2);
      }
      addScore(multiplier, m.pos);
      multiplier++;
      return true;
    }
    if (c["char"].a) {
      play("explosion");
      end();
    }
    var d = m.pos.distanceTo(robot.pos);
    if (d < nmDist) {
      nmDist = d;
      nm = m;
    }
    return !m.pos.isInRect(-100, -100, 200, 200);
  });
  remove(missiles, function (m) {
    if (m.explosionRadius > 0) {
      color("transparent");
      if (bar(m.pos, 3, 3, m.angle).isColliding.rect.purple) {
        play("powerUp");
        explosions.push({
          pos: m.pos,
          radius: 1,
          targetRadius: m.explosionRadius,
          vr: 1
        });
        color("red");
        particle(m.pos, 9, 2);
        addScore(multiplier, m.pos);
        multiplier++;
        return true;
      }
    }
  });
  if (nm != null) {
    robot.vel.addWithAngle(nm.pos.angleTo(robot.pos) + PI / 3, sqrt(difficulty) * 0.01);
  }
}

