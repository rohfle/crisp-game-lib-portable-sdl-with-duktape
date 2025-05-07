title = "ZIP FALL";
description = "\n[Tap] Fall\n";
characters = ["\nb bb b\n bbbb\nbbbbbb\n b  b\n b  b\n", "\nr rr r\nrrrrrr\n r  r\n", "\n  yy\n yyyy\ny yy y\ny yy y\n yyyy\n  yy\n"];
options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  audioSeed: 3,
  isCapturing: true
};
var backpacker;
var zipLines;
var objects;
var scrollSpeed;
var nextZipDist;
var nextObjectTicks;
var multiplier;
function update() {
  if (!ticks) {
    zipLines = [{
      y: 20
    }, {
      y: 50
    }, {
      y: 75
    }];
    backpacker = {
      pos: vec(20, 20),
      vel: vec(1),
      currentZip: zipLines[0]
    };
    objects = [];
    scrollSpeed = 1;
    nextZipDist = 0;
    nextObjectTicks = 0;
    multiplier = 1;
  }
  scrollSpeed = 0.05 * difficulty;
  if (backpacker.pos.y > 30) {
    scrollSpeed -= (30 - backpacker.pos.y) * 0.1;
  }
  updateBackpacker();
  updateZipLines();
  updateObjects();
  color("black");
  text("x".concat(floor(multiplier)), 2, 10, {
    isSmallText: true
  });
}
function updateBackpacker() {
  if (input.isJustPressed) {
    play("powerUp");
    backpacker.pos.y += 5;
    backpacker.vel.y = 1;
    backpacker.currentZip = undefined;
  }
  if (backpacker.currentZip == null) {
    backpacker.vel.y += 0.1;
    backpacker.pos.y += backpacker.vel.y * difficulty - scrollSpeed;
  } else {
    backpacker.pos.y = backpacker.currentZip.y + 3;
    backpacker.pos.x += backpacker.vel.x * difficulty;
  }
  if (backpacker.pos.x < 20 && backpacker.vel.x < 0 || backpacker.pos.x > 80 && backpacker.vel.x > 0) {
    backpacker.vel.x = -backpacker.vel.x;
    if (multiplier >= 2) {
      multiplier--;
    }
  }
  if (backpacker.pos.y < 3) {
    play("explosion");
    end();
  }
  color("blue");
  char("a", backpacker.pos);
}
function updateZipLines() {
  color("black");
  remove(zipLines, function (z) {
    if (box(50, z.y, 60, 2).isColliding["char"].a && backpacker.currentZip == null) {
      play("click");
      backpacker.currentZip = z;
    }
    z.y -= scrollSpeed;
    return z.y < 0;
  });
  nextZipDist -= scrollSpeed;
  if (nextZipDist < 0) {
    zipLines.push({
      y: 100
    });
    nextZipDist = rnd(20, 40);
  }
}
function updateObjects() {
  nextObjectTicks -= difficulty;
  if (nextObjectTicks <= 0) {
    var type = rnd() < 0.6 ? "obstacle" : "item";
    var vx = rnd(0.5, 1) * (rnd() < 0.5 ? -1 : 1);
    var pos = vec(vx > 0 ? -3 : 103, rnd(0, 120));
    objects.push({
      pos: pos,
      vx: vx,
      type: type
    });
    nextObjectTicks = rnd(20, 30);
  }
  remove(objects, function (obj) {
    obj.pos.y -= scrollSpeed;
    obj.pos.x += obj.vx * difficulty;
    if (obj.type === "obstacle") {
      color("red");
      if (char("b", obj.pos).isColliding["char"].a) {
        play("explosion");
        end();
      }
    } else {
      color("yellow");
      if (char("c", obj.pos).isColliding["char"].a) {
        play("coin");
        addScore(multiplier, obj.pos);
        multiplier += difficulty * 3;
        return true;
      }
    }
    return obj.pos.x < -5 || obj.pos.x > 105;
  });
}

