title = "BOTTOP";
description = "\n[Tap]  Jump\n[Hold] Fly\n";
characters = ["\n  ll\n  l\n llll\nl l\n l  l\nl  l\n", "\n  ll\n  l\n lll\n  l\n  ll\n ll\n", "\n  ll\nl l  l\n llll\n  l\n l lll\nl   \n", "\nll  ll\n llll\nllllll\nllllll\n  ll\n  ll\n"];
options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 2,
  theme: "pixel"
};
var y;
var vy;
var isJumping;
var spikes;
var spikeAddDist;
var scrolling;
function update() {
  if (!ticks) {
    y = vy = 0;
    isJumping = false;
    spikes = [];
    spikeAddDist = 0;
    scrolling = 1;
  }
  scrolling = difficulty;
  score += scrolling / 10;
  spikeAddDist -= scrolling;
  if (spikeAddDist < 0) {
    var _y = rnd() < 0.33 ? rnd() < 0.5 ? 8 : 92 : rnd(8, 92);
    spikes.push({
      p: vec(103, _y)
    });
    spikeAddDist += rnd(30, 60);
  }
  color("red");
  spikes = spikes.filter(function (s) {
    s.p.x -= scrolling;
    char("d", s.p, {
      rotation: floor(ticks / 10)
    });
    return s.p.x > -3;
  });
  if (!isJumping && input.isPressed) {
    play("powerUp");
    isJumping = true;
    vy = 3;
  }
  if (isJumping) {
    vy -= input.isPressed ? 0.1 : 0.3;
    y += vy;
    if (y < 0) {
      y = 0;
      isJumping = false;
    }
  }
  color("black");
  var c = isJumping ? "c" : addWithCharCode("a", floor(ticks / 15) % 2);
  if (char(c, 9, 8 + y, {
    mirror: {
      y: -1
    }
  }).isColliding["char"].d || char(c, 9, 92 - y).isColliding["char"].d) {
    play("explosion");
    end();
  }
  color("light_blue");
  rect(0, 0, 99, 5);
  rect(0, 95, 99, 5);
}

