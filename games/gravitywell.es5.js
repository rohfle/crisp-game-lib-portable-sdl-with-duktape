title = "GRAVITY WELL";
description = "\n[Tap] Anti Gravity Pulse\n";
options = {
  theme: "dark",
  isPlayingBgm: true,
  isReplayEnabled: true,
  audioSeed: 5
};
var planet;
var nextScoreAddingDist;
var blackHoles;
var nextBlackHoleDist;
var pulses;
var stars;
var scrollingSpeed;
function update() {
  if (!ticks) {
    planet = {
      pos: vec(50, 50),
      velocity: vec(0, 0),
      radius: 9
    };
    nextScoreAddingDist = 0;
    blackHoles = [];
    nextBlackHoleDist = 0;
    pulses = [];
    stars = times(20, function () {
      return {
        pos: vec(rnd(0, 100), rnd(0, 100)),
        vx: -rnd(0.1, 0.2)
      };
    });
    scrollingSpeed = vec();
  }
  scrollingSpeed.x = -0.5 * sqrt(difficulty);
  nextScoreAddingDist += scrollingSpeed.x;
  if (nextScoreAddingDist < 0) {
    addScore(floor(planet.radius), planet.pos);
    nextScoreAddingDist += 30;
  }
  color("black");
  stars.forEach(function (star) {
    star.pos.x += star.vx;
    if (star.pos.x < 0) {
      star.pos.x += 100;
    }
    box(star.pos, 1);
  });
  blackHoles.forEach(function (bh) {
    bh.pos.add(scrollingSpeed);
  });
  nextBlackHoleDist += scrollingSpeed.x;
  if (nextBlackHoleDist < 0) {
    var radius = rnd(5, 9);
    blackHoles.push({
      pos: vec(100 + radius, rnd(10, 90)),
      radius: radius,
      strength: 0.1
    });
    nextBlackHoleDist += rnd(30, 40);
  }
  remove(blackHoles, function (bh) {
    return bh.pos.x < -10;
  });
  planet.pos.add(planet.velocity);
  var o = planet.pos.x + 10;
  planet.velocity.x += 1 / o / o;
  o = 110 - planet.pos.x;
  planet.velocity.x -= 1 / o / o;
  o = planet.pos.y + 10;
  planet.velocity.y += 1 / o / o;
  o = 105 - planet.pos.y;
  planet.velocity.y -= 1 / o / o;
  planet.velocity.mul(0.99);
  blackHoles.forEach(function (bh) {
    var direction = vec(bh.pos).sub(planet.pos);
    var distance = direction.length;
    if (distance > 0) {
      var force = bh.strength / distance;
      planet.velocity.add(vec(direction).normalize().mul(force));
    }
  });
  if (input.isJustPressed && planet.radius > 2) {
    play("laser");
    planet.radius -= 1;
    pulses.push({
      pos: vec(planet.pos),
      radius: 0,
      strength: 0.5
    });
  }
  pulses.forEach(function (pulse) {
    pulse.pos.set(planet.pos);
    pulse.radius += 1;
    blackHoles.forEach(function (bh) {
      var direction = vec(bh.pos).sub(pulse.pos);
      var distance = direction.length;
      if (distance < pulse.radius + bh.radius) {
        var force = pulse.strength / sqrt(distance);
        planet.velocity.add(vec(direction).normalize().mul(-force));
        bh.pos.add(vec(direction).normalize().mul(force));
      }
    });
  });
  remove(pulses, function (pulse) {
    return pulse.radius > 20;
  });
  blackHoles.forEach(function (bh) {
    color("white");
    box(bh.pos, bh.radius * 2);
    color("purple");
    arc(bh.pos, bh.radius);
  });
  color("cyan");
  pulses.forEach(function (pulse) {
    arc(pulse.pos, pulse.radius);
  });
  color("yellow");
  var collision = arc(planet.pos, planet.radius);
  if (collision.isColliding.rect.purple) {
    play("hit");
    planet.radius -= 0.2;
  } else {
    planet.radius = clamp(planet.radius + 0.05, 1, 9);
  }
  if (planet.radius < 1) {
    play("explosion");
    end();
  }
  if (planet.pos.x < 0 && planet.velocity.x < 0 || planet.pos.x > 100 && planet.velocity.x > 0) {
    planet.velocity.x *= -1;
  }
  if (planet.pos.y < 0 && planet.velocity.y < 0 || planet.pos.y > 100 && planet.velocity.y > 0) {
    planet.velocity.y *= -1;
  }
}

