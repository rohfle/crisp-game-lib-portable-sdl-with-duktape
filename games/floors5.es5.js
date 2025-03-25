title = "FLOORS 5";
description = "\n[Tap]  Jump / Double Jump\n[Hold] Fly\n";
characters = ["\n\n\n\n l  l\nl ll l\n l  l\n", "\n lll\nl l ll\nllllll\nl ll l\n\n\n", "\n llll\nllllll\nllllll\nllllll\nllllll\n llll\n", "\n llll\nl    l\nl    l\nl    l\nl    l\n llll\n"];
options = {
  viewSize: {
    x: 200,
    y: 100
  },
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 7
};
var floors;
var colors = ["red", "green", "blue", "yellow", "purple"];
var car;
var landedColors;
var multiplier;
function update() {
  if (!ticks) {
    floors = times(5, function (i) {
      return {
        pos: vec([25, 52, 105, 160, 220][i], [30, 50, 70, 60, 40][i]),
        width: [10, 35, 30, 30, 50][i],
        index: i,
        paintFrom: 0,
        paintTo: 0
      };
    });
    car = {
      pos: vec(10, 10),
      vel: vec(1, 0),
      floor: undefined,
      by: 0,
      bvy: 0,
      fallTicks: -99,
      jumpCount: 0
    };
    landedColors = times(5, function () {
      return false;
    });
    multiplier = 1;
  }
  floors.forEach(function (f, i) {
    if (f.pos.x + f.width < 0) {
      f.pos.set(rnd(200, 250), rnd(30, 90));
      f.width = rnd(20, 60);
      f.paintFrom = f.paintTo = 0;
    }
    color(colors[i]);
    f.pos.x -= car.vel.x;
    rect(f.pos, f.width, 6);
    color("white");
    rect(f.pos.x + 1, f.pos.y + 1, f.width - 2, 4);
    color(colors[i]);
    rect(f.pos.x + f.paintFrom, f.pos.y + 1, f.paintTo - f.paintFrom, 4);
  });
  car.vel.x += difficulty * 0.02;
  if (car.floor == null) {
    car.vel.y += input.isPressed ? 0.03 : 0.18;
  }
  car.pos.y += car.vel.y;
  car.bvy -= car.by * 0.1;
  car.by += car.bvy;
  car.by *= 0.9;
  car.fallTicks--;
  color("black");
  var cr = char("a", car.pos.x, clamp(car.pos.y, 0, 999)).isColliding.rect;
  var crb = char("b", car.pos.x, car.pos.y + car.by).isColliding.rect;
  if (car.floor == null) {
    colors.forEach(function (c, i) {
      if (cr[c] || crb[c]) {
        if (car.vel.y >= 0) {
          play("select");
          car.floor = floors[i];
          car.pos.y = car.floor.pos.y - 3;
          car.vel.y = 0;
          car.vel.x = sqrt(difficulty);
          car.floor.paintFrom = clamp(car.pos.x - 5 - car.floor.pos.x, 0, 999);
          car.jumpCount = 0;
          landedColors[i] = true;
        } else {
          play("hit");
          car.pos.y = floors[i].pos.y + 9 - car.by;
          car.vel.y *= -0.7;
        }
      }
    });
    if (car.floor == null && (car.fallTicks > -9 || car.jumpCount < 2) && input.isJustPressed) {
      play("jump");
      car.vel.y = -2;
      car.vel.x = sqrt(difficulty);
      car.bvy = -2;
      car.jumpCount++;
    }
  } else {
    if (input.isJustPressed) {
      play("jump");
      addFloorScore(car.floor);
      car.floor.pos.x = -999;
      car.floor = undefined;
      car.vel.y = -2;
      car.vel.x = sqrt(difficulty);
      car.bvy = -2;
      car.jumpCount++;
    } else if (car.floor.pos.x + car.floor.width < car.pos.x - 3) {
      addFloorScore(car.floor);
      car.floor.pos.x = -999;
      car.floor = undefined;
      car.vel.x = sqrt(difficulty);
      car.fallTicks = 0;
      car.jumpCount = 0;
    } else {
      car.floor.paintTo = clamp(car.pos.x + 5 - car.floor.pos.x, 0, car.floor.width);
    }
  }
  var isAll = true;
  landedColors.forEach(function (lc, i) {
    color(colors[i]);
    char(lc ? "c" : "d", i * 7 + 3, 96);
    isAll = lc && isAll;
  });
  if (isAll) {
    play("coin");
    multiplier++;
    landedColors = times(5, function () {
      return false;
    });
  }
  if (multiplier > 1) {
    color("black");
    text("x".concat(multiplier), 45, 96);
  }
  if (car.pos.y > 99) {
    play("explosion");
    end();
  }
  function addFloorScore(f) {
    play("powerUp");
    var w = f.paintTo - f.paintFrom;
    var m = w >= f.width ? 3 : 1;
    var y = f.pos.y - (m > 1 ? 7 : 0);
    var s = clamp(floor(w) * multiplier, 0, 999);
    for (var i = 0; i < m; i++) {
      addScore(s, f.pos.x + f.width + 15, y);
      y += 7;
    }
  }
}

