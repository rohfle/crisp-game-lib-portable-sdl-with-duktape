title = "SNAKE 1";
description = "\n[Tap] Turn\n";
characters = [];
options = {
  theme: "crt",
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 9
};
var head;
var headMoveTicks;
var isHeadGettingDollar;
var isHeadTurning;
var bodies;
var dollars;
var wallChars;
var edgeWallChars;
var angleOfs = [[1, 0], [0, 1], [-1, 0], [0, -1]];
var headChar = [">", "v", "<", "^"];
function update() {
  if (!ticks) {
    color("green");
    head = {
      pos: vec(8, 8),
      angle: 0,
      rotation: 1
    };
    headMoveTicks = 0;
    isHeadGettingDollar = false;
    isHeadTurning = false;
    bodies = times(4, function (i) {
      return vec(4 + i, 8);
    });
    dollars = [vec(12, 8)];
    wallChars = times(16, function () {
      return "#";
    }).join("");
    edgeWallChars = "#".concat(times(14, function () {
      return " ";
    }).join(""), "#");
  }
  text(wallChars, 3, 9);
  for (var y = 1; y <= 13; y++) {
    text(edgeWallChars, 3, 9 + y * 6);
  }
  text(wallChars, 3, 9 + 14 * 6);
  if (!isHeadTurning && input.isJustPressed) {
    play("select");
    isHeadTurning = true;
  }
  headMoveTicks--;
  if (headMoveTicks < 0) {
    play("laser");
    if (!isHeadGettingDollar) {
      bodies.shift();
    } else {
      isHeadGettingDollar = false;
    }
    bodies.push(vec(head.pos));
    if (isHeadTurning) {
      head.angle = wrap(head.angle + head.rotation, 0, 4);
      isHeadTurning = false;
    }
    var ao = angleOfs[head.angle];
    head.pos.add(ao[0], ao[1]);
    headMoveTicks = 20 / difficulty;
  }
  bodies.forEach(function (b) {
    text("o", b.x * 6 + 3, b.y * 6 + 3);
  });
  var c = text(headChar[wrap(head.angle + head.rotation, 0, 4)], head.pos.x * 6 + 3, head.pos.y * 6 + 3).isColliding.text;
  if (c.o || c["#"]) {
    play("explosion");
    color("white");
    rect(head.pos.x * 6, head.pos.y * 6, 6, 6);
    color("green");
    text("X", head.pos.x * 6 + 3, head.pos.y * 6 + 3);
    end();
  }
  var ig = false;
  dollars = dollars.filter(function (d) {
    var c = text("$", d.x * 6 + 3, d.y * 6 + 3).isColliding.text;
    if (c.v || c[">"] || c["<"] || c["^"]) {
      ig = true;
      return false;
    }
    return true;
  });
  if (ig) {
    play("coin");
    addScore(1);
    isHeadGettingDollar = true;
    head.rotation *= -1;
    color("transparent");
    for (var i = 0; i < 2; i++) {
      for (var j = 0; j < 99; j++) {
        var x = rndi(2, 14);
        var _y = rndi(3, 14);
        var _c = text("$", x * 6 + 3, _y * 6 + 3).isColliding.text;
        if (_c.v || _c[">"] || _c["<"] || _c["^"] || _c.o) {} else {
          dollars.push(vec(x, _y));
          break;
        }
      }
    }
    color("green");
  }
}

