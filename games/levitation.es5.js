title = "LEVITATION";
description = "\n[Tap] Levitate / Fall\n";
characters = ["\n lll\nll ll  \nll ll  \nll ll  \nll ll  \nll lll\n", "\n llll\nll  ll\nll  ll\nll  ll\nll  ll\n llll\n  "];
options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  audioSeed: 8
};
var caterpillar;
var platforms;
var nextPlatformDist;
var multiplier;
function update() {
  if (!ticks) {
    caterpillar = {
      pos: vec(40, 40),
      vel: vec(1, 0),
      state: "crawl"
    };
    platforms = [{
      pos: vec(0, 60),
      width: 99
    }];
    nextPlatformDist = 0;
    multiplier = 1;
  }
  if (input.isJustPressed) {
    play("select");
    caterpillar.state = caterpillar.state === "crawl" ? "roll" : "crawl";
    multiplier = 1;
  }
  if (caterpillar.state === "crawl") {
    caterpillar.vel.x = -0.4 * difficulty;
    caterpillar.vel.y = 0;
  } else {
    caterpillar.vel.x = 0.2 * difficulty;
    caterpillar.vel.y += 0.2 * sqrt(difficulty);
  }
  caterpillar.vel.y *= 0.99;
  caterpillar.pos.add(caterpillar.vel);
  if (caterpillar.pos.y < 0 && caterpillar.vel.y < 0) {
    caterpillar.pos.y = 0;
    caterpillar.vel.y *= -0.3;
  }
  var scrollSpeed = difficulty * 0.5;
  nextPlatformDist -= scrollSpeed;
  if (nextPlatformDist < 0) {
    var width = rnd(30, 50);
    platforms.push({
      pos: vec(100, rnd(30, 90)),
      width: width
    });
    nextPlatformDist = width + rnd(9);
  }
  if (caterpillar.pos.y > 100 || caterpillar.pos.x < -3 || caterpillar.pos.x > 103) {
    play("explosion");
    end();
  }
  color("green");
  var caterpillarShape = caterpillar.state === "crawl" ? "b" : "a";
  char(caterpillarShape, caterpillar.pos);
  color("light_black");
  remove(platforms, function (p) {
    if (rect(p.pos, p.width, 5).isColliding["char"].a && caterpillar.vel.y >= 0) {
      play("jump");
      addScore(multiplier, caterpillar.pos);
      multiplier++;
      caterpillar.pos.y = p.pos.y - 3;
      caterpillar.vel.y *= -1.5;
    }
    p.pos.x -= scrollSpeed;
    return p.pos.x + p.width < 0;
  });
}

