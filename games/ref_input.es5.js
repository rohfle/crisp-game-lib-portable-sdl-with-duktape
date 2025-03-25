title = "";
description = "\n";
characters = [];
options = {
  isShowingScore: false
};
function update() {
  if (ticks === 0) {}
  color("black");
  text("input.", 5, 5, {
    isSmallText: true
  });
  text("pos", 5, 12, {
    isSmallText: true
  });
  text("isPressed", 5, 26, {
    isSmallText: true
  });
  text("isJustPressed", 5, 40, {
    isSmallText: true
  });
  text("isJustReleased", 5, 54, {
    isSmallText: true
  });
  color("blue");
  text("{x:".concat(floor(input.pos.x), ",y:").concat(floor(input.pos.y), "}"), 5, 19, {
    isSmallText: true
  });
  text("".concat(input.isPressed), 5, 33, {
    isSmallText: true
  });
  text("".concat(input.isJustPressed), 5, 47, {
    isSmallText: true
  });
  text("".concat(input.isJustReleased), 5, 61, {
    isSmallText: true
  });
}

