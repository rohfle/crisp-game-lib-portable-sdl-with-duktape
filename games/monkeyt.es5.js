title = "MONKEY T";
description = "\n[Hold]\n  Compress\n[Release]\n  Launch\n";
characters = ["\nl  ll\nl l  l\nl  ll\n lll l\nlll  l\n  ", "\n  lll\n   l\n  l l\n  l l l\n l l l\nl l l \n  ", "\nllll\n llll\n  llll\n lll\nll  l\n  "];
options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 1
};
var monkeyPosition;
var monkeyVelocity;
var monkeyCollectingCount;
var trampolineCompression;
var trampolineLaunchPower;
var collectibles;
var hazards;
var multiplier;
function update() {
  if (!ticks) {
    monkeyPosition = vec(50, 90);
    monkeyVelocity = vec(0.3, 0);
    monkeyCollectingCount = 0;
    trampolineCompression = 0;
    trampolineLaunchPower = 0;
    addCollectables();
    hazards = times(3, function (i) {
      return {
        position: vec(rnd(10, 90), rnd(10, 70)),
        speed: 0.5 + i * 0.1
      };
    });
    multiplier = 1;
  }
  if (input.isJustPressed) {
    trampolineLaunchPower = trampolineCompression = 0;
  }
  if (input.isPressed) {
    trampolineCompression = Math.min(trampolineCompression + 1, 30);
  }
  if (input.isJustReleased) {
    trampolineLaunchPower = trampolineCompression;
    trampolineCompression = 0;
    monkeyCollectingCount = 0;
  }
  var trampolineHeight = 90 + trampolineCompression * 0.25 + trampolineLaunchPower * 0.25;
  color("black");
  line(25, trampolineHeight, 75, trampolineHeight, 2);
  monkeyVelocity.y += 0.1;
  monkeyPosition.add(monkeyVelocity.x * difficulty, monkeyVelocity.y);
  if (monkeyPosition.x < 25 && monkeyVelocity.x < 0 || monkeyPosition.x > 75 && monkeyVelocity.x > 0) {
    monkeyVelocity.x = -monkeyVelocity.x;
  }
  color("red");
  var isMonkeyCollided = char("a", monkeyPosition, {
    mirror: {
      x: monkeyVelocity.x > 0 ? 1 : -1
    }
  }).isColliding.rect;
  if (isMonkeyCollided.black && monkeyVelocity.y > 0) {
    monkeyPosition.y = trampolineHeight - 5;
    monkeyVelocity.y = -monkeyVelocity.y * 0.2 - trampolineLaunchPower * 0.13;
    if (trampolineLaunchPower > 1) {
      play("jump");
      trampolineLaunchPower = 0;
    }
  }
  if (monkeyPosition.y > 99) {
    monkeyPosition.y = 80;
  }
  color("yellow");
  remove(collectibles, function (c) {
    var isBananaCollected = char("b", c.position).isColliding["char"];
    if (isBananaCollected["a"]) {
      play("coin");
      multiplier += monkeyCollectingCount;
      monkeyCollectingCount++;
      addScore(multiplier, monkeyPosition);
      particle(c.position);
      return true;
    }
  });
  if (collectibles.length === 0) {
    addCollectables();
  }
  color("black");
  remove(hazards, function (h) {
    h.position.x += h.speed * (h.position.x < 10 && h.speed > 0 || h.position.x > 90 && h.speed < 0 ? 0.5 : 1);
    if (h.position.x < -10 && h.speed < 0 || h.position.x > 110 && h.speed > 0) {
      h.position.y = rnd(10, 70);
      h.speed = -h.speed;
    }
    var isHazardCollided = char("c", h.position, {
      mirror: {
        x: h.speed > 0 ? 1 : -1
      }
    }).isColliding["char"];
    if (isHazardCollided["a"]) {
      play("explosion");
      end();
    }
  });
  text("x".concat(multiplier), 3, 10);
}
function addCollectables() {
  collectibles = times(5, function () {
    return {
      position: vec(rnd(30, 70), rnd(20, 70))
    };
  });
}

