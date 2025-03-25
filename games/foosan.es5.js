title = "FOOSAN";
description = "\n[Tap]  Jump\n[Hold] Fly\n";
characters = ["\nl\nll  ll \nlll ll\nllll\n  l\n   l\n", "\n    ll\n    ll\nllll\nlll\nll l\nl   l\n"];
options = {
  theme: "crt",
  isReplayEnabled: true,
  isRewindEnabled: true,
  isPlayingBgm: true,
  isShowingTime: true,
  seed: 16
};
var balloons;
var balloonAddDist;
var player;
var plAnimIndex;
var plAnimTicks;
var bgLines;
var bgLineAddDist;
var leftDist;
function update() {
  var _frameState = frameState({
    balloons: balloons,
    balloonAddDist: balloonAddDist,
    player: player,
    plAnimIndex: plAnimIndex,
    plAnimTicks: plAnimTicks,
    bgLines: bgLines,
    bgLineAddDist: bgLineAddDist,
    leftDist: leftDist
  });
  balloons = _frameState.balloons;
  balloonAddDist = _frameState.balloonAddDist;
  player = _frameState.player;
  plAnimIndex = _frameState.plAnimIndex;
  plAnimTicks = _frameState.plAnimTicks;
  bgLines = _frameState.bgLines;
  bgLineAddDist = _frameState.bgLineAddDist;
  leftDist = _frameState.leftDist;
  if (!ticks) {
    balloons = [];
    balloonAddDist = 0;
    player = {
      pos: vec(10, 50),
      vel: vec()
    };
    bgLines = [];
    bgLineAddDist = 0;
    leftDist = 999;
    plAnimIndex = 0;
    plAnimTicks = 0;
  }
  var xScroll = 1 + player.vel.x;
  bgLineAddDist -= xScroll;
  if (bgLineAddDist < 0 && leftDist > 30) {
    bgLines.push({
      x: 99
    });
    bgLineAddDist += 17;
  }
  color("light_purple");
  bgLines = bgLines.filter(function (l) {
    l.x -= xScroll;
    rect(l.x, 0, 1, 99);
    return l.x > 0;
  });
  balloonAddDist -= xScroll;
  if (balloonAddDist < 0) {
    balloonAddDist += 30 * ((leftDist + 999) / 999);
    balloons.push({
      pos: vec(99, rnd(20, 80)),
      vel: vec(-rnd(1), rnds(1)),
      radius: 0,
      targetRadius: rnd(5, 15),
      ticks: 0
    });
  }
  color("light_red");
  rect(0, 0, 99, 9);
  rect(0, 90, 99, 9);
  color("red");
  balloons = balloons.filter(function (b) {
    b.ticks++;
    if (b.ticks <= 30) {
      b.radius = b.targetRadius * b.ticks / 30;
    }
    b.pos.add(b.vel.x * 10 / b.targetRadius, b.vel.y * 10 / b.targetRadius);
    if (input.isPressed) {
      var d = player.pos.distanceTo(b.pos);
      b.vel.add(vec(b.pos).sub(player.pos).div(d).div(d).mul(input.isJustPressed ? 99 : 9));
    }
    b.vel.mul(0.95);
    balloons.forEach(function (ab) {
      if (ab !== b && ab.pos.distanceTo(b.pos) < ab.radius + b.radius) {
        var a = ab.pos.angleTo(b.pos);
        b.vel.addWithAngle(a, 1);
      }
    });
    if (b.pos.y - b.radius < 0 && b.vel.y < 0 || b.pos.y + b.radius > 99 && b.vel.y > 0) {
      b.vel.y *= -0.7;
    }
    if (b.pos.x + b.radius > 150 && b.vel.x > 0) {
      b.vel.x *= -0.7;
    }
    b.pos.x -= xScroll;
    arc(b.pos, b.radius);
    return b.pos.x > -b.radius;
  });
  color("black");
  if (input.isJustPressed) {
    play("powerUp");
    player.vel.y -= 1.5;
  }
  player.vel.y += input.isPressed ? 0.01 : 0.1;
  player.vel.y *= 0.99;
  if (input.isPressed) {
    player.vel.x += 0.1;
  }
  player.vel.x *= 0.95;
  player.pos.y += player.vel.y;
  if (input.isJustPressed) {
    plAnimTicks = 0;
    particle(player.pos, 9, 5);
  }
  if (input.isPressed) {
    plAnimTicks--;
    particle(player.pos, 1, 1);
  }
  if (plAnimTicks < 0) {
    plAnimTicks = 4;
    plAnimIndex++;
  }
  var c = char(addWithCharCode("a", plAnimIndex % 2), player.pos).isColliding.rect;
  text("".concat(floor(leftDist), "m"), 3, 95);
  if (c.red || c.light_red) {
    play("explosion");
    rewind();
  }
  leftDist -= xScroll * 0.4;
  if (leftDist < 0) {
    leftDist = 0;
    play("coin");
    complete("GOAL!");
  }
}

