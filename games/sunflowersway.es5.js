title = "SUNFLOWER SWAY";
description = "\n[Hold] Sunny\n";
characters = ["\n yyyy\nylllly\nylllly\nylllly\nylllly\n yyyy\n", "\n  l\n lll\nl lll\nl lll\n lll\n", "\nl ll l\n l  l\nl ll l\nllllll\n llll\nl ll l\n", "\n   ll\n  lll\n llll\nlllll\n  ll\n ll\n", "\n llll\nllllll\nllllll\nllllll\nllllll\n llll\n"];
options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  audioSeed: 1,
  isCapturing: true
};
var sunflower;
var dewdrops;
var insects;
var sunX;
var nextDewdropTicks;
var nextInsectTicks;
function update() {
  if (!ticks) {
    sunflower = {
      pos: vec(30, 95),
      height: 40,
      angle: 0,
      swayVelocity: 0.001,
      leafPositions: [0.2, 0.4, 0.6]
    };
    dewdrops = [];
    insects = [];
    sunX = 120;
    nextDewdropTicks = 30;
    nextInsectTicks = 60;
  }
  color("yellow");
  rect(0, 90, 100, 10);
  if (input.isPressed) {
    sunflower.swayVelocity += 0.005;
    sunX += (80 - sunX) * 0.1;
  } else {
    sunX += (120 - sunX) * 0.1;
  }
  if (input.isJustPressed) {
    play("select");
  }
  sunflower.swayVelocity *= 0.97;
  sunflower.angle += sunflower.swayVelocity;
  sunflower.swayVelocity -= sunflower.angle * 0.01;
  if (sunX < 110) {
    drawSun(sunX);
  }
  sunflower.height -= 0.045 * difficulty;
  if (sunflower.height > 70) {
    sunflower.height = 70;
  }
  if (sunflower.height < 9) {
    play("explosion");
    end();
  }
  color("green");
  var stemTop = vec(sunflower.pos).addWithAngle(sunflower.angle - PI / 2, sunflower.height);
  line(sunflower.pos, stemTop);
  sunflower.leafPositions.forEach(function (leafPos, i) {
    var leafPoint = vec(sunflower.pos).addWithAngle(sunflower.angle - PI / 2, sunflower.height * leafPos);
    var ox = i % 2 === 0 ? 1 : -1;
    char("d", leafPoint.x + ox * 3, leafPoint.y, {
      mirror: {
        x: ox
      }
    });
  });
  color("black");
  char("a", stemTop, {
    scale: {
      x: 2,
      y: 2
    }
  });
  nextDewdropTicks--;
  if (nextDewdropTicks <= 0) {
    dewdrops.push({
      pos: vec(rnd(99), -3),
      speed: rnd(0.5, 1) * difficulty
    });
    nextDewdropTicks = rnd(30, 40) / difficulty;
  }
  remove(dewdrops, function (d) {
    d.pos.y += d.speed;
    color("light_blue");
    var isColliding = char("b", d.pos).isColliding["char"];
    if (isColliding.a) {
      play("coin");
      addScore(sunflower.height, stemTop);
      sunflower.height += 7;
      return true;
    }
    return d.pos.y > 90;
  });
  nextInsectTicks--;
  if (nextInsectTicks <= 0) {
    insects.push({
      pos: vec(rnd() < 0.25 ? rnd(20) : rnd(40, 99), -3),
      speed: rnd(0.3, 0.8) * difficulty
    });
    nextInsectTicks = rnd(60, 70) / difficulty;
  }
  remove(insects, function (i) {
    i.pos.y += i.speed;
    color("red");
    var isColliding = char("c", i.pos).isColliding["char"];
    if (isColliding.a) {
      play("hit");
      sunflower.height -= 15;
      return true;
    }
    return i.pos.y > 90;
  });
}
var p1 = vec();
var p2 = vec();
function drawSun(x) {
  color("yellow");
  p1.set(x, 10);
  char("e", p1);
  for (var i = 0; i < 7; i++) {
    var a = ticks * 0.05 + i * PI * 2 / 7;
    var l = abs(sin(i + ticks * 0.05) * 5) + 10;
    p1.set(x, 10).addWithAngle(a, 7);
    p2.set(x, 10).addWithAngle(a, l);
    line(p1, p2);
  }
}

