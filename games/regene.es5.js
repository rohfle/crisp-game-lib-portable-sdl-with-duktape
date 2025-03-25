title = "REGENE";
description = "\n[Slide]\n Erase wall\n";
characters = [];
options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 16
};
var walls;
var removedWalls;
var removeWallCount;
var nextWallsDist;
var balls;
function update() {
  if (!ticks) {
    walls = [];
    removedWalls = [];
    removeWallCount = 9;
    nextWallsDist = 0;
    balls = [{
      pos: vec(20, 50),
      vel: vec(1, 0).rotate(rnds(PI * 0.1) + (rnd() < 0.5 ? 1 : -1) * PI * 0.7),
      hitCount: 0
    }];
  }
  color("light_blue");
  rect(0, 0, 100, 10);
  rect(0, 90, 100, 10);
  rect(0, 10, 10, 80);
  var scr = difficulty * 0.05 * sqrt(balls.length);
  var ip = input.pos.clamp(0, 99, 0, 99);
  if (ip.x > 90) {
    scr += (ip.x - 90) * 0.05;
  }
  nextWallsDist -= scr;
  if (nextWallsDist < 0) {
    var w = rndi(3, 7);
    var h = rnd() < 0.4 ? 0 : rndi(2, 6);
    var hy = rndi(h, 8 - h);
    times(w, function (x) {
      times(8, function (y) {
        if (y < hy || y >= hy + h) {
          walls.push({
            pos: vec(x * 10 + 105 - nextWallsDist, y * 10 + 15),
            isBall: rnd() < 0.1 / sqrt(balls.length)
          });
        }
      });
    });
    nextWallsDist += (w + rndi(3)) * 10;
  }
  color("light_black");
  box(ip, 5);
  remove(removedWalls, function (w) {
    w.x -= scr;
    return w.x < 14;
  });
  remove(walls, function (w) {
    w.pos.x -= scr;
    color(w.isBall ? "light_red" : "purple");
    var c = box(w.pos, w.isBall ? 6 : 8).isColliding.rect;
    if (c.light_black) {
      if (w.isBall) {
        if (w.pos.x < 97) {
          play("powerUp");
          balls.push({
            pos: w.pos,
            vel: vec(1, 0).rotate(rnds(PI * 0.1) + (rnd() < 0.5 ? 1 : -1) * PI * 0.7),
            hitCount: 0
          });
          return true;
        }
      } else {
        play("laser");
        removedWalls.push(w.pos);
        return true;
      }
    }
    return c.light_blue;
  });
  while (removedWalls.length > removeWallCount) {
    walls.push({
      pos: removedWalls.shift(),
      isBall: false
    });
  }
  if (removedWalls.length >= removeWallCount) {
    color("light_purple");
    box(removedWalls[0], 8);
  }
  color("light_blue");
  rect(100, 10, 10, 80);
  remove(balls, function (b) {
    b.pos.x -= scr;
    color("transparent");
    var spd = sqrt(difficulty);
    var isHitX = false;
    var isHitY = false;
    var cx = box(b.pos.x + b.vel.x * spd, b.pos.y, 6).isColliding.rect;
    if (cx.purple || cx.light_blue) {
      isHitX = true;
    }
    var cy = box(b.pos.x, b.pos.y + b.vel.y * spd, 6).isColliding.rect;
    if (cy.purple || cy.light_blue) {
      isHitY = true;
    }
    if (isHitX) {
      b.vel.x *= -1;
      b.pos.x += b.vel.x * spd * 2;
    }
    if (isHitY) {
      b.vel.y *= -1;
      b.pos.y += b.vel.y * spd * 2;
    }
    if (b.pos.x < 14) {
      b.pos.x = 14;
      if (b.vel.x < 0) {
        b.vel.x *= -1;
      }
    }
    color("red");
    if (isHitX || isHitY) {
      if (b.hitCount === 0) {
        addScore(balls.length);
      }
      b.hitCount++;
      if (b.hitCount > 9) {
        particle(b.pos);
        play("hit");
        return true;
      }
    } else {
      b.hitCount = 0;
    }
    b.pos.x += b.vel.x * spd;
    b.pos.y += b.vel.y * spd;
    box(b.pos, 6);
  });
  if (balls.length === 0) {
    play("lucky");
    end();
  }
}

