title = "TAPPUMP";
description = "\n[Tap]  Jump\n[Hold] Pump\n";
characters = ["\nr r r\n r r\nrrRrr\n r r\nr r r\n", "\n yyyy\ny yyYy\ny yyYy\ny yyYy\ny yyYy\n yyyy\n"];
options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 7
};
var player;
var spikes;
var nextSpikeDist;
var coins;
var coinY;
var coinVy;
var nextCoinDist;
function update() {
  if (!ticks) {
    player = {
      pos: vec(10, 20),
      vel: vec(),
      radius: 1,
      rv: 0
    };
    spikes = [];
    coins = [];
    coinY = 50;
    coinVy = 0;
    nextSpikeDist = 40;
    nextCoinDist = 0;
  }
  var scr = player.pos.x > 20 ? (player.pos.x - 20) * 0.2 : 0;
  nextSpikeDist -= scr;
  if (nextSpikeDist < 0) {
    play("laser");
    spikes.push(vec(103, rnd(99)));
    nextSpikeDist += rnd(40, 140);
  }
  color("black");
  remove(spikes, function (s) {
    s.x -= scr;
    char("a", s);
    return s.x < -2;
  });
  color("green");
  player.vel.x = difficulty;
  if (input.isJustPressed) {
    play("select");
    player.vel.y -= sqrt(difficulty) * 2;
  }
  player.vel.y -= sqrt(difficulty) * (input.isPressed ? 0.03 : -0.12);
  if (input.isPressed) {
    player.rv += difficulty * 0.08;
    player.radius += player.rv;
  } else {
    player.radius += (1 - player.radius) * 0.04 * difficulty;
    player.rv = 0;
  }
  player.pos.add(player.vel);
  player.pos.x -= scr;
  var c = arc(player.pos, player.radius, 5).isColliding["char"];
  if (c.a || player.pos.y < -5 - player.radius || player.pos.y > 105 + player.radius) {
    play("explosion");
    end();
  }
  color("black");
  nextCoinDist -= scr;
  coinVy += rnds(0.1);
  coinVy *= 0.98;
  coinY += coinVy;
  if (coinY < 10 && coinVy < 0 || coinY > 90 && coinVy > 0) {
    coinVy *= -1;
  }
  if (nextCoinDist < 0) {
    coins.push(vec(103, coinY + rnds(9)));
    nextCoinDist += rnd(6, 9);
  }
  remove(coins, function (c) {
    c.x -= scr;
    var cl = char("b", c).isColliding;
    if (cl.rect.green) {
      var sc = ceil(player.radius);
      play(sc < 20 ? "coin" : "powerUp");
      addScore(sc, c);
      return true;
    }
    return cl["char"].a || c.x < -3;
  });
}

