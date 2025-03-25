title = "SCAFFOLD";
description = "\n[Tap]\n Change angle\n[Hold]\n Scaffold \n";
characters = ["\n    ll\n   lll\n  ll\n ll\nll\nl\n", "\n\n\n\n\nllllll\nllllll\n", "\nl\nll\n ll\n  ll\n   lll\n    ll\n", "\nllllll\nll l l\nll l l\nllllll\n l  l\n l  l\n  ", "\nllllll\nll l l\nll l l\nllllll\nll  ll\n  "];
options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 100
};
var floors;
var nextFloorPos;
var nextFloorType;
var tv;
var pressedCount;
var wall;
var objs;
var nextObjDist;
var player;
var multiplier;
function update() {
  if (!ticks) {
    floors = times(9, function (i) {
      return {
        pos: vec(i * 6 + 3, 52),
        type: 1
      };
    });
    nextFloorPos = vec(9 * 6 + 3, 52);
    nextFloorType = 0;
    tv = 1;
    pressedCount = 0;
    wall = vec(-9, 0);
    objs = [];
    nextObjDist = 0;
    player = vec(5, 50);
    multiplier = 1;
  }
  var scr = difficulty * 0.05;
  if (nextFloorPos.x > 40) {
    scr += (nextFloorPos.x - 40) * 0.1;
  }
  wall.x -= scr;
  color("red");
  if (wall.x < -6) {
    var wy = 47;
    for (var i = 0; i < 9; i++) {
      var y = 47 + rndi(-9, 9) * 4;
      if (abs(y - nextFloorPos.y) < 25) {
        wy = y;
        break;
      }
    }
    wall.set(6 - nextFloorPos.x % 6 + 120, wy);
    objs.push({
      pos: vec(wall.x + 4, wall.y + 4),
      vy: 0.1,
      d: 2,
      distance: 4,
      type: "gold"
    });
    color("purple");
    rect(100, 0, 40, 100);
    color("red");
    nextObjDist += 30;
  }
  rect(wall.x + 3, 0, 2, wall.y - 12);
  rect(wall.x + 3, wall.y + 18, 2, 100 - 18 - wall.y);
  rect(0, -7, 100, 9);
  rect(0, 98, 100, 9);
  if (input.isJustReleased) {
    play("laser");
    if (nextFloorType === 0 && tv === -1 || nextFloorType === 2 && tv === 1) {
      tv *= -1;
    }
    nextFloorType += tv;
  }
  if (input.isPressed) {
    pressedCount++;
    if (pressedCount > 15 / sqrt(difficulty)) {
      play("select");
      floors.push({
        pos: vec(nextFloorPos.x, nextFloorPos.y + (nextFloorType === 2 ? 4 : 0)),
        type: nextFloorType
      });
      nextFloorPos.add(6, nextFloorType * 4 - 4);
      pressedCount = 0;
    }
  } else {
    pressedCount = 0;
  }
  color("black");
  remove(floors, function (f) {
    f.pos.x -= scr;
    char(addWithCharCode("a", f.type), f.pos);
    return f.pos.x < -3;
  });
  color("cyan");
  nextFloorPos.x -= scr;
  char(addWithCharCode("a", nextFloorType), nextFloorPos.x, nextFloorPos.y + (nextFloorType === 2 ? 4 : 0));
  var vx = 0;
  if (player.x < 20) {
    vx += (20 - player.x) * 0.2;
  }
  player.x += vx - scr;
  if (char(addWithCharCode("d", floor(ticks / 15) % 2), player).isColliding.rect.red) {
    play("explosion");
    end();
  }
  color("transparent");
  var type;
  for (var _i = 0; _i < 9; _i++) {
    var c = box(player.x + 4, player.y, 1, 6).isColliding["char"];
    if (c.a) {
      type = 0;
      player.y--;
    } else if (c.b) {
      type = 1;
      player.y--;
    } else if (c.c) {
      type = 2;
      player.y--;
    } else {
      if (type != null) {
        break;
      }
      player.y++;
    }
  }
  if (type === 0) {
    player.y += 4;
  }
  nextObjDist -= scr;
  if (nextObjDist < 0) {
    var _type = rnd() < 0.5 ? "gold" : "spike";
    var distance = rnd(20, 60) / (_type === "gold" ? 4 : 1.5);
    var _wy = rnds(20) * (_type === "gold" ? 1 : 1.5);
    objs.push({
      pos: vec(120, clamp(nextFloorPos.y + rnds(20), 10, 90)),
      d: distance / 2,
      distance: distance,
      vy: rnds(1, sqrt(difficulty)) * 0.3,
      type: _type
    });
    nextObjDist = rnd(15, 25);
  }
  remove(objs, function (o) {
    o.pos.x -= scr;
    o.pos.y += o.vy;
    o.d -= abs(o.vy);
    if (o.d < 0) {
      o.d = o.distance;
      o.vy *= -1;
    }
    color(o.type === "gold" ? "yellow" : "red");
    var c = text(o.type === "gold" ? "$" : "x", o.pos).isColliding;
    if (o.distance > 4 && c.rect.purple) {
      return true;
    }
    if (c["char"].d || c["char"].e) {
      if (o.type === "gold") {
        play("coin");
        addScore(multiplier, o.pos);
        multiplier++;
        return true;
      } else {
        play("explosion");
        end();
      }
    }
    if (o.pos.x < -3) {
      if (o.type === "gold" && multiplier > 1) {
        play("hit");
        multiplier--;
      }
      return true;
    }
  });
}

