title = "MIRROR FLOOR";
description = "\n[Tap]  Jump\n[Hold] Speed up\n";
characters = ["\nllllll\nll l l\nll l l\nllllll\n l  l\n l  l\n ", "\nllllll\nll l l\nll l l\nllllll\nll  ll\n ", "\n llll\nll lll\nll lll\nll lll\nll lll\n llll\n "];
options = {
  theme: "dark",
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 5
};
var floors;
var nextFloorDist;
var coins;
var player;
var multiplier = 1;
var playerX = 9;
function update() {
  if (!ticks) {
    floors = [{
      pos: vec(10, 50),
      width: 80
    }];
    nextFloorDist = 0;
    coins = [vec(60, 47)];
    player = {
      y: 10,
      my: 0,
      vy: 0,
      speed: 1,
      side: 1,
      state: "jump"
    };
    multiplier = 1;
  }
  var scr = difficulty * 0.5 * player.speed;
  if (player.state === "run") {
    if (input.isJustPressed) {
      play("powerUp");
      player.vy = -1.5 * sqrt(difficulty) * player.side;
      player.state = "jump";
    }
  }
  if (player.state === "jump") {
    player.vy += 0.07 * difficulty * player.side;
    player.y += player.vy;
  }
  if (input.isPressed) {
    player.speed += (2 - player.speed) * 0.05;
  } else {
    player.speed += (1 - player.speed) * 0.2;
  }
  if (player.y < 0 && player.side === -1 || player.y > 99 && player.side === 1) {
    play("lucky");
    end();
  }
  color("black");
  char(addWithCharCode("a", floor(ticks / 15) % 2), playerX, player.y, {
    mirror: {
      y: player.side
    }
  });
  nextFloorDist -= scr;
  if (nextFloorDist < 0) {
    var f = {
      pos: vec(100, rnd(10, 90)),
      width: rnd(45, 75)
    };
    floors.push(f);
    var cx = rnd(20, 25);
    while (cx < f.width - 20) {
      coins.push(vec(100 + cx, f.pos.y - 3));
      cx += rnd(15, 30);
    }
    nextFloorDist += f.width + rnd(10, 20);
  }
  var isOnFloor = false;
  remove(floors, function (f) {
    f.pos.x -= scr;
    color(player.side === 1 ? "cyan" : "light_cyan");
    var c1 = rect(f.pos, f.width, 1).isColliding["char"];
    color(player.side === -1 ? "cyan" : "light_cyan");
    var c2 = rect(f.pos.x, f.pos.y + 1, f.width, 1).isColliding["char"];
    if ((c1.a || c1.b || c2.a || c2.b) && player.vy * player.side > 0) {
      play("laser");
      player.state = "run";
      player.y = f.pos.y + (player.side === 1 ? -3 : 5);
    }
    if (f.pos.x - 3 < playerX && playerX < f.pos.x + f.width + 3) {
      player.my = f.pos.y - (player.y - f.pos.y) + 2;
      color("light_black");
      char(addWithCharCode("a", floor(ticks / 15) % 2), playerX, player.my, {
        mirror: {
          y: -player.side
        }
      });
      isOnFloor = true;
    }
    return f.pos.x < -f.width;
  });
  if (!isOnFloor) {
    player.state = "jump";
  }
  remove(coins, function (c) {
    c.x -= scr;
    color(player.side === 1 ? "yellow" : "light_yellow");
    var cl = char("c", c).isColliding["char"];
    color(player.side === 1 ? "light_yellow" : "yellow");
    char("c", c.x, c.y + 8);
    if (cl.a || cl.b) {
      play("coin");
      addScore(multiplier, c);
      multiplier++;
      player.side *= -1;
      player.vy *= -1;
      player.y = player.my;
      return true;
    }
    if (c.x < -3) {
      if (multiplier > 1) {
        multiplier--;
      }
      return true;
    }
  });
}

