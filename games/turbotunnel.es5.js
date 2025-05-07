title = "TURBO TUNNEL";
description = "\n[Tap] Turn\n";
characters = [];
options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  audioSeed: 2
};
var car;
var tunnel;
var obstacles;
var multiplier;
function update() {
  if (!ticks) {
    tunnel = {
      radius: 30,
      width: 40
    };
    car = {
      angle: PI / 2,
      pos: vec(),
      radius: tunnel.radius,
      vr: 1
    };
    obstacles = [];
    multiplier = 1;
  }
  var isSpawningObstacle = false;
  if (input.isJustPressed) {
    play("laser");
    car.vr *= -1;
    isSpawningObstacle = true;
  }
  car.angle += 0.015 * difficulty / (car.radius * 0.03);
  car.radius += car.vr * 0.4;
  car.pos = vec(50, 50).add(vec(car.radius, 0).rotate(car.angle));
  var distanceFromCenter = car.pos.distanceTo(vec(50, 50));
  if (distanceFromCenter > tunnel.radius + tunnel.width / 2 && car.vr > 0 || distanceFromCenter < tunnel.radius - tunnel.width / 2 && car.vr < 0) {
    car.vr *= -1;
    isSpawningObstacle = true;
  }
  color("blue");
  arc(50, 50, tunnel.radius + tunnel.width / 2, 4);
  arc(50, 50, tunnel.radius - tunnel.width / 2, 4);
  color("light_red");
  bar(car.pos, 1, 3, car.angle + PI / 2);
  color("red");
  box(car.pos, 1);
  var hasDestroyed = false;
  remove(obstacles, function (o) {
    o.angle += o.va / (o.radius * 0.03);
    o.pos = vec(50, 50).add(vec(o.radius, 0).rotate(o.angle));
    if (o.destroyedTicks > 0) {
      hasDestroyed = true;
      o.destroyedTicks -= difficulty;
      if (o.destroyedTicks <= 0) {
        play("powerUp");
        addScore(multiplier, o.pos);
        multiplier++;
        particle(o.pos, {
          count: 9,
          speed: 3
        });
        return true;
      }
    }
    color(o.destroyedTicks > 0 ? "purple" : "yellow");
    var a = o.angle + PI / 2 + (o.destroyedTicks + 1) * 0.5;
    var isColliding = bar(o.pos, 1, 3, a).isColliding.rect;
    if (o.destroyedTicks < 0 && isColliding.yellow) {
      o.destroyedTicks = 30;
    }
    if (o.destroyedTicks < 0 && isColliding.red) {
      play("explosion");
      end();
    }
  });
  color("transparent");
  obstacles.forEach(function (o) {
    var isColliding = box(o.pos, 5).isColliding.rect;
    if (o.destroyedTicks < 0 && isColliding.purple) {
      play("coin");
      o.destroyedTicks = 30;
      hasDestroyed = true;
    }
  });
  if (!hasDestroyed) {
    multiplier = 1;
  }
  if (isSpawningObstacle) {
    var o = {
      angle: car.angle + (PI * 2 - 3 / car.radius),
      va: -rnd(0.01, 0.03) * difficulty,
      radius: car.radius,
      destroyedTicks: -1,
      pos: vec()
    };
    o.pos = vec(50, 50).add(vec(o.radius, 0).rotate(o.angle));
    color("transparent");
    var c = box(o.pos, 9).isColliding.rect;
    if (!c.yellow && !c.purple) {
      play("laser");
      obstacles.push(o);
    }
  }
}

