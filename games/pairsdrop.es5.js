title = "PAIRS DROP";
description = "\n[Tap] Open\n";
characters = ["\nl  l\nl l l\nl l l\nl l l\nl  l\n", "\nl l l\n l l \nl l l\n l l \nl l l\n"];
options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 101
};
var cards;
var nextCardPos;
var scr;
var openedCards;
var openedTicks;
var multiplier;
function update() {
  if (!ticks) {
    cards = [];
    nextCardPos = vec(20, -6);
    scr = 0;
    openedCards = [];
    openedTicks = 0;
    multiplier = 1;
  }
  var minY = 99;
  var maxY = 0;
  openedTicks--;
  if (openedTicks === 0) {
    remove(openedCards, function (c) {
      c.isOpen = false;
      return true;
    });
  }
  var isOpening = false;
  remove(cards, function (c) {
    var cl = c.isOpen ? openedTicks > 0 ? "green" : "cyan" : "blue";
    color(cl);
    rect(c.pos.x - 4, c.pos.y - 5, 9, 11);
    color("white");
    rect(c.pos.x - 3, c.pos.y - 4, 7, 9);
    color(cl);
    c.pos.y += scr + c.vy;
    if (c.vy > 0) {
      c.vy += 0.1;
    }
    if (c.isOpen) {
      if (c.n === 0) {
        text("A", c.pos);
      } else if (c.n < 9) {
        text("".concat(c.n + 1), c.pos);
      } else if (c.n === 9) {
        char("a", c.pos);
      } else {
        text("".concat(["J", "Q", "K"][c.n - 10]), c.pos);
      }
    } else {
      char("b", c.pos);
      if (c.vy === 0 && input.isJustPressed && abs(c.pos.x - input.pos.x) < 5 && abs(c.pos.y - input.pos.y) < 6) {
        play("hit");
        if (openedTicks >= 0) {
          remove(openedCards, function (c) {
            c.isOpen = false;
            return true;
          });
          openedTicks = 0;
        }
        isOpening = true;
        c.isOpen = true;
        openedCards.push(c);
      }
    }
    if (c.pos.y < minY) {
      minY = c.pos.y;
    }
    if (c.pos.y > maxY) {
      maxY = c.pos.y;
    }
    if (c.vy === 0 && c.pos.y > 95) {
      play("explosion");
      color("red");
      text("X", c.pos);
      end();
    }
    if (c.pos.y > 99) {
      play("coin");
      addScore(multiplier, c.pos);
      multiplier++;
      return true;
    }
  });
  if (openedTicks < 0 && openedCards.length === 2) {
    if (openedCards[0].n === openedCards[1].n) {
      play("powerUp");
      fallCards(openedCards[0]);
      fallCards(openedCards[1]);
      openedCards = [];
      multiplier = 1;
    } else {
      play("laser");
    }
    openedTicks = 60;
  }
  nextCardPos.y += scr;
  scr += (difficulty * 0.0015 - scr) * 0.2 + (isOpening ? 0.15 : 0);
  if (maxY < 50) {
    scr += (50 - maxY) * 0.01;
  }
  if (minY > -6) {
    addCards();
  }
  function fallCards(rc) {
    var p = rc.pos;
    cards.forEach(function (c) {
      if (c.pos.x === p.x && c.pos.y >= p.y) {
        c.vy = 1;
      }
    });
  }
  function addCards() {
    var ns = times(26, function (i) {
      return i % 13;
    });
    times(99, function () {
      var i1 = rndi(26);
      var i2 = rndi(26);
      var tn = ns[i1];
      ns[i1] = ns[i2];
      ns[i2] = tn;
    });
    ns.forEach(function (n) {
      cards.push({
        pos: vec(nextCardPos),
        n: n,
        isOpen: false,
        vy: 0
      });
      nextCardPos.x += 10;
      if (nextCardPos.x > 80) {
        nextCardPos.x = 20;
        nextCardPos.y -= 12;
      }
    });
  }
}

