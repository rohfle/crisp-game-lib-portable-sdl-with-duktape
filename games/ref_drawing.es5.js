title = "";
description = "\n";
characters = ["\nllllll\nll l l\nll l l\nllllll\n l  l\n l  l\n"];
options = {
  isShowingScore: false,
  viewSize: {
    x: 200,
    y: 100
  }
};
var drawingButtons;
var currentDrawing;
var currentColor;
var colorButtons;
var drawingFunctions = {
  box: box,
  rect: rect,
  bar: bar,
  line: line,
  arc: arc,
  text: text,
  "char": char
};
function update() {
  if (ticks === 0) {
    currentDrawing = "box";
    currentColor = "red";
    drawingButtons = Object.keys(drawingFunctions).map(function (d, i) {
      return getButton({
        pos: vec(115, 10 + i * 9),
        size: vec(38, 7),
        text: d,
        isToggle: true,
        onClick: function onClick() {
          currentDrawing = d;
        }
      });
    });
    drawingButtons.forEach(function (db) {
      return db.toggleGroup = drawingButtons;
    });
    drawingButtons[0].isSelected = true;
    colorButtons = ["red", "green", "yellow", "blue", "purple", "cyan", "black"].map(function (c, i) {
      return getButton({
        pos: vec(160, 10 + i * 9),
        size: vec(38, 7),
        text: c,
        isToggle: true,
        onClick: function onClick() {
          currentColor = c;
        }
      });
    });
    colorButtons.forEach(function (cb) {
      return cb.toggleGroup = colorButtons;
    });
    colorButtons[0].isSelected = true;
  }
  var params;
  if (currentDrawing === "box") {
    params = [50, 50, floor((input.pos.x - 50) * 2), floor((input.pos.y - 50) * 2)];
  } else if (currentDrawing === "rect") {
    params = [50, 50, floor(input.pos.x - 50), floor(input.pos.y - 50)];
  } else if (currentDrawing === "bar") {
    params = [50, 50, floor(input.pos.distanceTo(50, 50) * 2), 5, floor(input.pos.angleTo(50, 50) * 100) / 100, 0.5];
  } else if (currentDrawing === "line") {
    params = [50, 50, floor(input.pos.x), floor(input.pos.y), 5];
  } else if (currentDrawing === "arc") {
    var ip = vec(input.pos).sub(50, 50);
    params = [50, 50, floor(ip.length), 5, 0, floor(ip.angle * 10) / 10];
  } else {
    params = ["a", floor(input.pos.x), floor(input.pos.y)];
  }
  color(currentColor);
  drawingFunctions[currentDrawing].apply(this, params);
  color("blue");
  text("drawing", 115, 5, {
    isSmallText: true
  });
  text("color", 160, 5, {
    isSmallText: true
  });
  drawingButtons.forEach(function (db) {
    return updateButton(db);
  });
  colorButtons.forEach(function (cb) {
    return updateButton(cb);
  });
  color("black");
  text("color(\"".concat(currentColor, "\");"), 5, 5, {
    isSmallText: true
  });
  text("".concat(currentDrawing, "("), 5, 12, {
    isSmallText: true
  });
  if (params.length <= 4) {
    var l = params.map(function (p, i) {
      var q = (currentDrawing === "text" || currentDrawing === "char") && i === 0 ? "\"" : "";
      return "".concat(q).concat(p).concat(q).concat(i < params.length - 1 ? ", " : "");
    }).join("");
    text("".concat(l), 12, 19, {
      isSmallText: true
    });
    text(");", 5, 26, {
      isSmallText: true
    });
  } else {
    var l1 = "",
      l2 = "";
    params.forEach(function (p, i) {
      if (i < 4) {
        l1 += "".concat(p, ", ");
      } else {
        l2 += "".concat(p).concat(i < params.length - 1 ? ", " : "");
      }
    });
    text(l1, 12, 19, {
      isSmallText: true
    });
    text("".concat(l2), 12, 26, {
      isSmallText: true
    });
    text(");", 5, 33, {
      isSmallText: true
    });
  }
}

