title = "FEEDING FRENZY";
description = "\n[Hold]\n Dart and Turn\n";
characters = ["\n lll\n  lll\nl ll l\nllllll\nl lll\n  ll\n  "];
options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  isDrawingScoreFront: true,
  seed: 7
};
var shark;
var sharkSpeed = 0.7;
var sharkDartSpeed = 3.9;
var fish;
var fishSpawnTicks;
var seabedRadius = 45;
var multiplier;
function update() {
  if (!ticks) {
    shark = {
      pos: vec(50 + seabedRadius, 50),
      angle: 0,
      isDarting: false
    };
    fish = [];
    fishSpawnTicks = 0;
    multiplier = 1;
  }
  color("light_black");
  arc(50, 50, seabedRadius, 3);
  color("black");
  if (shark.isDarting) {
    if (input.isPressed) {
      shark.angle -= 0.1 * difficulty;
    }
    shark.pos.addWithAngle(shark.angle, sharkDartSpeed * difficulty);
    if (shark.pos.distanceTo(vec(50, 50)) > seabedRadius) {
      shark.isDarting = false;
      var ca = shark.pos.angleTo(50, 50);
      shark.pos.set(50, 50).addWithAngle(ca + PI, seabedRadius);
    }
  } else {
    shark.angle = shark.pos.angleTo(50, 50) + PI / 2;
    shark.pos.addWithAngle(shark.angle, sharkSpeed * difficulty);
    if (input.isJustPressed) {
      play("laser");
      shark.isDarting = true;
      shark.angle -= 0.5;
      multiplier = 1;
    }
  }
  var triangleHeight = 5;
  var triangleWidth = 3;
  var triangleTip = vec(shark.pos).addWithAngle(shark.angle, triangleHeight);
  var triangleLeft = vec(shark.pos).addWithAngle(shark.angle - 2.8, triangleWidth);
  var triangleRight = vec(shark.pos).addWithAngle(shark.angle + 2.8, triangleWidth);
  line(triangleTip, triangleLeft);
  line(triangleLeft, triangleRight);
  line(triangleRight, triangleTip);
  fishSpawnTicks--;
  if (fishSpawnTicks < 0) {
    var angle = rnd(PI * 2);
    var radius = rnd(seabedRadius * 0.8);
    var pos = vec(50, 50).addWithAngle(angle, radius);
    fish.push({
      pos: pos,
      angle: wrap(pos.angleTo(50, 50) + rnds(1), 0, PI * 2),
      speed: rnd(0.03, 0.05) * difficulty,
      color: ["cyan", "blue", "light_blue", "purple"][floor(rnd(4))]
    });
    fishSpawnTicks = 10 * sqrt(fish.length) / difficulty / difficulty;
  }
  remove(fish, function (f) {
    f.pos.addWithAngle(f.angle, f.speed * (shark.isDarting ? 2.5 : 1) * (f.pos.distanceTo(50, 50) > seabedRadius * 1.1 ? 4 : 1));
    color(f.color);
    var c = char("a", f.pos, {
      mirror: {
        x: f.angle > PI / 2 && f.angle < PI / 2 * 3 ? -1 : 1
      }
    }).isColliding.rect;
    if (c.black) {
      play("coin");
      addScore(multiplier, f.pos);
      particle(f.pos);
      multiplier++;
      return true;
    }
    if (!f.pos.isInRect(0, 0, 100, 100)) {
      play("explosion");
      color("red");
      text("X", f.pos);
      end();
    }
  });
}

