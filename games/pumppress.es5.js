title = "PUMP PRESS";
description = "\n[Tap]  Shot\n[Hold] Speed up\n";
characters = ["\n lll\n lccl\nrrrrrr\nrrrrrr\n llll\n lll\n", "\n    r\nllllrr\n    r\n", "\n  ll\n ll ll\nyyyyy\nyyyyy\n ll ll\n  ll\n"];
options = {
  theme: "pixel",
  viewSize: {
    x: 200,
    y: 50
  },
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 7
};
var enemies;
var nextEnemyDist;
var rocketX;
var isRocketGoing;
var nextRocketDist;
var shipX;
var shipSpeed;
var shotX;
var shotRange;
var pressedCount;
var scr;
function update() {
  if (!ticks) {
    enemies = [];
    nextEnemyDist = 0;
    rocketX = undefined;
    isRocketGoing = false;
    nextRocketDist = 30;
    shipX = 100;
    shipSpeed = 1;
    shotX = undefined;
    shotRange = 0;
    pressedCount = 0;
    scr = 0;
  }
  color("light_purple");
  rect(0, 20, 200, 1);
  rect(0, 29, 200, 1);
  color("black");
  shipX += difficulty * shipSpeed;
  shipSpeed += ((input.isPressed ? 1 : 0.5) - shipSpeed) * 0.1;
  if (input.isPressed) {
    particle(shipX, 25, 1, 2, PI, 0.3);
  }
  scr = difficulty * 0.1;
  if (shipX > 100) {
    scr += (shipX - 100) * 0.1;
  }
  shipX -= scr;
  char("a", shipX, 25);
  if (shotX == null && input.isJustPressed) {
    play("laser");
    shotX = shipX + 6;
    shotRange = 60;
  }
  if (shotX != null) {
    var s = difficulty * 3;
    shotX += s - scr;
    shotRange -= s;
    char("b", shotX, 25);
    if (shotRange < 0) {
      shotX = undefined;
    }
  }
  nextEnemyDist -= scr;
  if (nextEnemyDist < 0) {
    enemies.push({
      x: 205,
      vx: rnd(0.5, 0.4 + 0.1 * sqrt(difficulty)) * difficulty,
      size: 0,
      isPressed: false,
      pressedOfs: vec(rnds(2) - 4, rnds(2))
    });
    nextEnemyDist = rnd(40 - sqrt(difficulty) * 10, 40) / sqrt(difficulty) + 3;
  }
  if (rocketX != null) {
    rocketX -= scr;
    if (isRocketGoing) {
      particle(rocketX, 25, 1, difficulty, 0, 0.4);
      rocketX -= difficulty;
    }
    var c = char("c", rocketX, 25).isColliding["char"];
    if (!isRocketGoing && c.b) {
      isRocketGoing = true;
      shotX = undefined;
    }
    if (rocketX < 5) {
      if (pressedCount > 0) {
        play("explosion");
        addScore((1 + pressedCount) * pressedCount / 2, 20, 20);
        particle(rocketX, 25, pressedCount * 5, sqrt(pressedCount) * 0.5 + 2);
      }
      rocketX = undefined;
      pressedCount = 0;
    }
  } else {
    nextRocketDist -= scr;
    if (nextRocketDist < 0) {
      rocketX = 205;
      isRocketGoing = false;
      nextRocketDist = 100;
    }
  }
  remove(enemies, function (e) {
    var y = 24;
    if (!e.isPressed) {
      if (e.size > 0) {
        e.size -= difficulty * 0.02;
        if (e.size < 0) {
          e.size = 0;
        }
      } else {
        e.x += e.vx * (e.x < shipX ? 1 : -1);
      }
      e.x -= scr;
    } else {
      if (rocketX == null) {
        return true;
      }
      e.x = rocketX + e.pressedOfs.x;
      y += e.pressedOfs.y;
    }
    var s = ceil(e.size) * 2 + 2;
    color("red");
    rect(e.x - s, y - s, s * 2, 2);
    rect(e.x - s, y + s, s * 2, 2);
    rect(e.x - s, y - s, 2, s * 2);
    rect(e.x + s - 2, y - s, 2, s * 2);
    color("yellow");
    var c = rect(e.x - s, y, s * 2, 2).isColliding["char"];
    if (!e.isPressed) {
      if (c.b) {
        shotX = undefined;
        e.size = ceil(e.size) + 1;
        if (e.size > 3) {
          play("explosion");
          color("red");
          particle(e.x, 25);
          return true;
        } else {
          play("hit");
        }
      }
      if (isRocketGoing && c.c) {
        e.isPressed = true;
        pressedCount++;
      }
      if (e.size === 0 && c.a) {
        play("powerUp");
        end();
      }
      return e.x < -5;
    }
  });
}

