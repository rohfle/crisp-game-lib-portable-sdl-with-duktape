title = "FISH GRILL";
description = "\n[Hold] Burn up\n";
characters = ["\n  l\nl lll\nllll l\nllllll\nl lll\n  l\n"];
options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  audioSeed: 1
};
var ember;
var fishes;
var updrafts;
var scrollSpeed;
var gravity = 0.1;
var updraftForce = -1;
var initialEnergy = 100;
var minFishSpacing = 50;
var maxFishSpacing = 80;
var minFishWidth = 10;
var maxFishWidth = 20;
function update() {
  if (!ticks) {
    ember = {
      pos: vec(20, 50),
      velocity: vec(0, 0),
      energy: initialEnergy,
      baseEnergy: initialEnergy
    };
    fishes = [{
      pos: vec(100, 50),
      width: 15,
      isBurned: false
    }];
    updrafts = [];
    scrollSpeed = vec(-1, 0);
  }
  ember.velocity.y += gravity;
  ember.pos.add(ember.velocity);
  ember.baseEnergy += 0.1;
  ember.energy += (ember.baseEnergy - ember.energy) * 0.01;
  var emberRadius = 1 + ember.energy / initialEnergy * 2;
  if (input.isPressed) {
    ember.velocity.y = updraftForce;
    updrafts.push({
      pos: vec(ember.pos.x, ember.pos.y + emberRadius),
      timeLeft: 10
    });
  }
  if (input.isJustPressed) {
    play("select");
  }
  color("purple");
  arc(ember.pos, emberRadius);
  remove(updrafts, function (updraft) {
    updraft.timeLeft--;
    color("red");
    for (var i = 0; i < 3; i++) {
      var x = updraft.pos.x + rnd(-2, 2);
      var y = updraft.pos.y + rnd(0, 5);
      var size = rnd(1, 3);
      line(x - size / 2, y + size / 2, x, y - size / 2);
      line(x, y - size / 2, x + size / 2, y + size / 2);
      line(x + size / 2, y + size / 2, x - size / 2, y + size / 2);
    }
    return updraft.timeLeft <= 0;
  });
  remove(fishes, function (fish) {
    fish.pos.add(scrollSpeed);
    color(fish.isBurned ? "black" : "cyan");
    var collision = char("a", fish.pos, {
      scale: {
        x: fish.width / 6
      },
      mirror: {
        x: -1
      }
    });
    if (collision.isColliding.rect.red) {
      ember.energy += 5;
      if (!fish.isBurned) {
        play("powerUp");
        addScore(floor(ember.energy / 10), fish.pos);
        fish.isBurned = true;
      } else {
        addScore(floor(ember.energy / 100));
      }
    }
    if (collision.isColliding.rect.purple) {
      play("explosion");
      end();
    }
    return fish.pos.x + fish.width < 0;
  });
  if (fishes[fishes.length - 1].pos.x < 100) {
    play("click");
    var lastFish = fishes[fishes.length - 1];
    var newX = lastFish.pos.x + rnd(minFishSpacing, maxFishSpacing);
    var newY = rnd(10, 90);
    var newWidth = rnd(minFishWidth, maxFishWidth);
    fishes.push({
      pos: vec(newX, newY),
      width: newWidth,
      isBurned: false
    });
  }
  if (ember.pos.y < -emberRadius || ember.pos.y > 100 + emberRadius) {
    play("explosion");
    end();
  }
}

