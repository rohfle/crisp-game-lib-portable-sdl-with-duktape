title = "LIGHT DARK";
description = "\n[Tap] Jump\n[Hold] Fly\n";
characters = ["\n    ll\n   l\n  l\n  ll\n l  l\nl    l\n", "\n  ll\n  l\n  l\n  ll\n  ll\n l  l\n", "\n  ll\n  ll\n llll\n llll\nllllll\nllllll\n"];
options = {
  viewSize: {
    x: 200,
    y: 100
  },
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 6
};
var objs;
var objDists;
var objTypes;
var pos;
var vel;
var state;
var side;
var multiplier;
var scx;
function update() {
  if (!ticks) {
    objs = [];
    for (var i = 0; i < 10; i++) {
      objs.push({
        x: i < 5 ? 25 + i * 9 : 99 + i * 9,
        type: "coin",
        side: i < 5 ? "light" : "dark"
      });
    }
    objDists = [200, 300];
    objTypes = ["coin", "spike"];
    pos = vec(9, 0);
    side = "light";
    vel = vec(2);
    state = "ground";
    multiplier = 1;
    scx = 0;
  }
  var scr = vel.x * difficulty;
  color("light_black");
  rect(0, 50, 200, 50);
  if (state === "ground") {
    if (input.isJustPressed) {
      side = side === "light" ? "dark" : "light";
      play(side === "light" ? "jump" : "laser");
      vel.y = 3 * sqrt(difficulty);
      pos.y = 7;
      state = "jump";
      scx = 0;
    }
  } else {
    if (input.isJustPressed) {
      play("hit");
      side = side === "light" ? "dark" : "light";
    }
    vel.y -= (input.isPressed ? 0.1 : 0.5) * difficulty;
    pos.y += vel.y;
    if (pos.y < 0) {
      pos.y = 0;
      state = "ground";
    }
  }
  var y = side === "light" ? 47 - pos.y : 53 + pos.y;
  color(side === "light" ? "black" : "white");
  var ch = state === "jump" ? "b" : addWithCharCode("a", floor(ticks * difficulty / 10) % 2);
  var c = char(ch, pos.x, y, side === "light" ? {} : {
    mirror: {
      y: -1
    }
  }).isColliding;
  objs = objs.filter(function (o) {
    var y = o.side === "light" ? 46 : 54;
    color(o.side === "light" ? "black" : "white");
    var c;
    if (o.type === "spike") {
      c = char("c", o.x, y, o.side === "light" ? {} : {
        mirror: {
          y: -1
        }
      }).isColliding;
    } else {
      c = text("o", o.x, y, o.side === "light" ? {} : {
        mirror: {
          y: -1
        }
      }).isColliding;
    }
    if (c["char"].a || c["char"].b) {
      if (o.type === "spike") {
        play("explosion");
        end();
      } else {
        play(o.side === "light" ? "coin" : "select");
        addScore(multiplier, o.x + scx * 7, y);
        multiplier++;
        scx++;
        return false;
      }
    }
    o.x -= scr;
    if (o.x < -3) {
      if (o.type === "coin" && multiplier > 1) {
        multiplier--;
      }
      return false;
    }
    return true;
  });
  for (var _i = 0; _i < 2; _i++) {
    objDists[_i] -= scr;
    var _side = _i === 0 ? "light" : "dark";
    var o = objTypes[_i] === "coin" ? 9 : 6;
    var _c = objTypes[_i] === "coin" ? rndi(4, 8) : rndi(5, 15);
    if (objDists[_i] < 0) {
      for (var j = 0; j < _c; j++) {
        objs.push({
          x: 200 + j * o,
          type: objTypes[_i],
          side: _side
        });
      }
      objDists[_i] = _c * o + rnd(40, 120);
      objTypes[_i] = objTypes[_i] === "coin" ? "spike" : "coin";
    }
  }
}

