title = "UNCTRL";
description = "\n[Tap]  Fire\n[Hold] Go up\n";
characters = ["\nl ll ll\n lll\nl  lll\nl  lll\n lll\nl ll ll\n", "\n ll ll\n lll\nl  lll\nl  lll\n lll\n ll ll\n", "\nll ll l\n lll\nl  lll\nl  lll\n lll\nll ll l\n"];
options = {
  viewSize: {
    x: 150,
    y: 100
  },
  theme: "crt",
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 15
};
var tanks;
var nextTankTicks;
var bullets;
var shot;
var animTicks;
var multiplier;
var grounds;
var pos = vec(10, 50);
var shotPos = vec(8, 50);
function update() {
  if (!ticks) {
    tanks = [];
    bullets = [];
    nextTankTicks = 0;
    shot = {
      pos: vec(),
      vel: vec(),
      state: "ready"
    };
    animTicks = 0;
    setNextShot();
    grounds = times(20, function () {
      return vec(rnd(150), rnd(100));
    });
  }
  color("light_purple");
  grounds.forEach(function (g) {
    box(g, 5, 2);
    g.x = wrap(g.x - 0.1 * sqrt(difficulty), -3, 153);
  });
  color(shot.state === "ready" ? "light_blue" : "blue");
  if (shot.state === "ready") {
    if (input.isJustPressed) {
      play("select");
      shot.state = "fired";
    }
  } else {
    if (input.isJustPressed) {
      play("hit");
    }
    if (input.isJustReleased) {
      play("laser");
    }
    shot.vel.y += input.isPressed ? -0.1 : 0.1;
    shot.pos.add(shot.vel);
    particle(shot.pos, 1, 1, shot.vel.angle + PI, 1);
    if (!shot.pos.isInRect(0, 0, 150, 100)) {
      setNextShot();
    }
  }
  bar(shot.pos, 6, 4, shot.vel.angle, -0.5);
  if (tanks.length === 0) {
    nextTankTicks = 0;
  }
  nextTankTicks--;
  if (nextTankTicks < 0) {
    tanks.push({
      pos: vec(153, rnds(20, 40) + 50),
      bulletAngle: rnds(PI * 0.3) + PI,
      fireTicks: rnd(60),
      animTicks: 0
    });
    nextTankTicks = 200 / sqrt(difficulty);
  }
  remove(tanks, function (t) {
    t.animTicks += sqrt(difficulty) * (t.pos.x < 70 ? 4 : 1);
    t.pos.x -= sqrt(difficulty) * (t.pos.x < 70 ? 0.4 : 0.1);
    color("red");
    if (char(addWithCharCode("a", floor(t.animTicks / 20) % 3), t.pos, {
      mirror: {
        x: -1
      }
    }).isColliding.rect.blue) {
      play("powerUp");
      particle(t.pos, 19, 3);
      addScore(multiplier * 10, t.pos);
      setNextShot();
      return true;
    }
    t.fireTicks -= difficulty;
    if (t.pos.x > 70) {
      if (t.fireTicks < 0) {
        bullets.push({
          pos: vec(t.pos.x - 3, t.pos.y),
          vel: vec().addWithAngle(t.bulletAngle, 0.3 * difficulty)
        });
        t.fireTicks = 60;
        t.bulletAngle = rnds(PI * 0.3) + PI;
      } else {
        color("light_red");
        bar(t.pos.x - 3, t.pos.y, 4, 2, t.bulletAngle, -0.5);
      }
    }
    return t.pos.x < -3;
  });
  color("red");
  remove(bullets, function (b) {
    b.pos.add(b.vel);
    var c = bar(b.pos, 4, 2, b.vel.angle, -0.5).isColliding;
    if (c.rect.blue) {
      play("coin");
      addScore(multiplier, b.pos);
      particle(b.pos, 9);
      if (multiplier < 64) {
        multiplier *= 2;
      }
      return true;
    }
    return !b.pos.isInRect(0, 0, 150, 100);
  });
  color("blue");
  animTicks += difficulty;
  if (char(addWithCharCode("a", floor(animTicks / 20) % 3), pos).isColliding.rect.red) {
    play("lucky");
    end();
  }
  function setNextShot() {
    shot.pos.set(shotPos);
    shot.vel.set(0.5, 0.2);
    shot.state = "ready";
    multiplier = 1;
  }
}

