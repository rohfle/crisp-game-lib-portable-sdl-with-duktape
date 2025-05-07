title = "TWIN JUMPERS";
description = "\n[Tap] Jump\n";
characters = ["\n bb\n bb\nbbbb\nbbbb\nb  b\nb  b\n", "\n gggg\ngggggg\ngggggg\ngg  gg\n"];
options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  audioSeed: 9
};
var jumpers;
var jumpPower;
var platforms;
var scrollSpeed;
var nextPlatformDistance;
function update() {
  if (!ticks) {
    jumpers = [{
      pos: vec(20, 70),
      vx: 1,
      vy: 0,
      onPlatformTicks: 0
    }, {
      pos: vec(80, 70),
      vx: 1,
      vy: 0,
      onPlatformTicks: 0
    }];
    jumpPower = 1;
    platforms = [{
      pos: vec(50, 80),
      width: 100
    }];
    scrollSpeed = 0.1;
    nextPlatformDistance = 0;
    times(3, function (i) {
      platforms.push({
        pos: vec(rnd(0, 40), 70 - i * 30),
        width: rnd(20, 50)
      });
      platforms.push({
        pos: vec(rnd(60, 100), 70 - i * 30),
        width: rnd(20, 50)
      });
    });
  }
  scrollSpeed = 0.1 * sqrt(difficulty);
  var my = Math.max(jumpers[0].pos.y, jumpers[1].pos.y);
  if (my < 60) {
    scrollSpeed += (60 - my) * 0.05;
  }
  addScore(scrollSpeed);
  if (input.isJustPressed) {
    jumpers.forEach(function (jumper, i) {
      if (jumper.onPlatformTicks > 0) {
        play("jump", {
          volume: 0.5
        });
        jumper.vy = (i === 0 ? -3 : -2.5) * jumpPower;
      }
    });
    jumpPower *= 0.8;
  } else {
    jumpPower = clamp(jumpPower + 0.01, 0, 1);
  }
  jumpers.forEach(function (jumper) {
    jumper.pos.y += jumper.vy;
    jumper.vy += input.isPressed ? 0.1 : 0.2;
    jumper.pos.x += jumper.vx * 0.6;
    jumper.onPlatformTicks--;
    if (jumper.pos.x < 3 && jumper.vx < 0 || jumper.pos.x > 97 && jumper.vx > 0) {
      jumper.vx = -jumper.vx;
    }
    if (jumper.pos.y < 0 && jumper.vy < 0) {
      jumper.pos.y = 0;
      jumper.vy *= -0.5;
    }
  });
  remove(platforms, function (p) {
    p.pos.y += scrollSpeed;
    return p.pos.y > 109;
  });
  nextPlatformDistance -= scrollSpeed;
  if (nextPlatformDistance <= 0) {
    platforms.push({
      pos: vec(rnd(0, 50), -rnd(20) - 5),
      width: rnd(30, 50)
    });
    platforms.push({
      pos: vec(rnd(50, 100), -rnd(20) - 5),
      width: rnd(30, 50)
    });
    nextPlatformDistance = rnd(20, 30);
  }
  color("black");
  char("a", jumpers[0].pos);
  char("b", jumpers[1].pos);
  color("yellow");
  platforms.forEach(function (p) {
    var c = box(p.pos, p.width, 4).isColliding["char"];
    if (c.a && jumpers[0].vy > 0) {
      if (jumpers[0].vy > 2) {
        play("click");
      }
      jumpers[0].pos.y = p.pos.y - 4;
      jumpers[0].vy = 0;
      jumpers[0].onPlatformTicks = 9;
    }
    if (c.b && jumpers[1].vy > 0) {
      if (jumpers[0].vy > 2) {
        play("click");
      }
      jumpers[1].pos.y = p.pos.y - 3;
      jumpers[1].vy = 0;
      jumpers[1].onPlatformTicks = 9;
    }
  });
  if (jumpers.some(function (char) {
    return char.pos.y > 102;
  })) {
    play("explosion");
    end();
  }
}

