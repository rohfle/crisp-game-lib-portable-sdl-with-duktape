title = "BAROLL";
description = "\n[Tap]  Jump\n[Hold] Slow down\n";
characters = ["\n llll\nl    l\nl ll l\nllllll\nllllll\n llll\n", "\n  l\n  l\n lll\n l l\n  l\n l\n", "\n    l\n   l\n lllll\nl ll \n l  l\nl   l\n"];
options = {
  viewSize: {
    x: 200,
    y: 100
  },
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 9
};
var barrels;
var barrelAddingTicks;
var pos;
var vel;
var mode;
var bx;
var anim;
function update() {
  if (!ticks) {
    barrels = [];
    barrelAddingTicks = 0;
    pos = vec(9, 86);
    vel = vec();
    mode = "run";
    bx = 0;
    anim = 0;
  }
  rect(0, 90, 200, 9);
  var df = sqrt(difficulty);
  barrelAddingTicks -= df;
  if (barrelAddingTicks < 0) {
    play("laser");
    barrels.push({
      pos: vec(rnd(mode === "run" ? 10 : 100, 200), -5),
      vy: 0,
      speed: rnd(1, df),
      mode: "fall",
      angle: rnd(99)
    });
    barrelAddingTicks += rndi(30, 90);
  }
  vel.x = df * (input.isPressed ? 1 : 2);
  addScore(vel.x - df);
  barrels = barrels.filter(function (b) {
    if (b.mode === "fall") {
      b.vy += b.speed * 0.2;
      b.vy *= 0.92;
      b.pos.y += b.vy * sqrt(df);
      if (b.pos.y > 85) {
        play("select");
        b.pos.y = 86;
        b.mode = "roll";
      }
    } else {
      b.pos.x -= b.speed * df;
      b.angle += b.speed * df * 0.2;
    }
    b.pos.x -= vel.x;
    char("a", b.pos, {
      rotation: 3 - floor(b.angle % 4)
    });
    return b.pos.x > -5;
  });
  if (mode === "run") {
    if (input.isJustPressed) {
      play("jump");
      mode = "jump";
      vel.y = -3.6;
    }
  } else {
    pos.y += vel.y;
    vel.y += input.isPressed ? 0.1 : 0.2;
    if (pos.y > 85) {
      pos.y = 86;
      if (input.isPressed) {
        play("jump");
        vel.y = -3;
      } else {
        mode = "run";
      }
    }
  }
  anim += df * (input.isPressed ? 0.1 : 0.2) * (mode === "run" ? 1 : 0.5);
  if (char(addWithCharCode("b", floor(anim % 2)), pos).isColliding["char"].a) {
    play("explosion");
    end();
  }
  bx -= vel.x;
  if (bx < -9) {
    bx += 200;
  }
  color("light_black");
  rect(bx, 90, 3, 9);
  color("black");
}

