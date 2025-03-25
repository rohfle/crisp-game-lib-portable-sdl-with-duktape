title = "RAID";
description = "\n[Hold]\n Speed up\n[Release]\n Bomb\n";
characters = ["\nll\nlllll\nllllll\n", "\nlll\nlll\nlll\nlll\n l\n"];
options = {
  theme: "dark",
  isPlayingBgm: true,
  isReplayEnabled: true,
  isDrawingScoreFront: true,
  seed: 400
};
var ship;
var bomb;
var buildings;
var fallings;
var clouds;
var nextCloudDist;
function update() {
  if (!ticks) {
    ship = {
      pos: vec(50, 15),
      vel: vec(1, 0),
      speed: 1,
      downDist: 0,
      bombVy: 0
    };
    bomb = undefined;
    buildings = times(8, function (i) {
      return {
        height: rnd(10, 60)
      };
    });
    fallings = [];
    clouds = [];
    times(3, function () {
      addClouds(rnd(10, 90));
    });
    nextCloudDist = 0;
  }
  var scr = 0;
  if (ship.pos.y > 15) {
    scr += (ship.pos.y - 15) * 0.05;
  }
  nextCloudDist -= scr * 0.3;
  if (nextCloudDist < 0) {
    addClouds();
    nextCloudDist = rnd(20, 40);
  }
  color("light_blue");
  remove(clouds, function (c) {
    c.pos.y -= scr * 0.3;
    box(c.pos, c.size);
    return c.pos.y < -9;
  });
  if (input.isPressed) {
    ship.speed += 0.01;
  } else {
    ship.speed += (1 - ship.speed) * 0.2;
    if (bomb == null && ticks > 30 && input.isJustReleased) {
      play("powerUp");
      bomb = {
        pos: vec(ship.pos),
        vel: vec(ship.vel).mul(ship.speed)
      };
      ship.bombVy = 0.33;
    }
  }
  ship.pos.add(vec(ship.vel).mul(ship.speed));
  if (ship.vel.y === 0) {
    if (ship.pos.x < 10 && ship.vel.x < 0 || ship.pos.x > 90 && ship.vel.x > 0) {
      play("select");
      ship.vel.y = 0.1;
      ship.downDist = difficulty;
    }
  } else {
    ship.vel.x += ((ship.pos.x < 50 ? 1 : -1) - ship.vel.x) * 0.05;
    ship.downDist -= ship.vel.y * ship.speed;
    if (ship.downDist < 0) {
      ship.vel.set(ship.pos.x < 50 ? 1 : -1, 0);
    }
  }
  ship.pos.y += ship.bombVy - scr;
  ship.bombVy *= 0.8;
  color("black");
  char(ship.vel.y === 0 ? "a" : "b", ship.pos, {
    mirror: {
      x: ship.vel.x < 0 ? -1 : 1
    }
  });
  if (bomb != null) {
    bomb.vel.y += 0.1;
    bomb.vel.mul(0.99);
    bomb.pos.add(bomb.vel);
    bomb.pos.y -= scr;
    color("red");
    bar(bomb.pos, 3, 3, bomb.vel.angle);
    if (bomb.pos.x < 0 && bomb.vel.x < 0 || bomb.pos.x > 99 && bomb.vel.x > 0) {
      bomb.vel.x *= -1;
    }
    if (bomb.pos.y > 99) {
      bomb = undefined;
    }
  }
  color("light_black");
  fallings.forEach(function (f) {
    f.vy += 0.1;
    f.pos.y += f.vy - scr;
    rect(f.pos, 9, 10);
    return f.pos.y > 110;
  });
  buildings.forEach(function (b, i) {
    b.height += scr;
    var x = i * 10 + 10;
    var c = ceil(b.height / 10);
    var y = 100 - b.height + c * 10;
    var isDestroyed = false;
    var multiplier = 1;
    times(c, function () {
      if (isDestroyed) {
        play("hit");
        fallings.push({
          pos: vec(x, y),
          vy: -multiplier * 0.5
        });
        addScore(multiplier, x + 5, y);
        multiplier++;
        y -= 10;
        return;
      }
      color(["green", "yellow", "purple", "cyan"][i * 17 % 4]);
      var c = rect(x, y, 9, 10).isColliding;
      color("white");
      rect(x + 1, y + 1, 7, 3);
      rect(x + 1, y + 6, 7, 3);
      if (c.rect.red) {
        play("explosion");
        addScore(multiplier, x + 5, y);
        multiplier++;
        isDestroyed = true;
        b.height = 100 - y;
        color("red");
        particle(x + 5, y + 5, 19, 2);
        bomb = undefined;
      }
      if (c.rect.light_black) {
        play("hit");
        b.height = 100 - y;
        color("red");
        particle(x + 5, y + 5);
      }
      if (c["char"].a || c["char"].b) {
        play("explosion");
        end();
      }
      y -= 10;
    });
  });
  function addClouds() {
    var y = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 110;
    var x = rnd(-10, 90);
    var c = rndi(2, 5);
    times(c, function () {
      var size = rnd(7, 12);
      clouds.push({
        pos: vec(x, y + rnds(3)),
        size: size
      });
      x += size * rnd(0.4, 0.6);
    });
  }
}

