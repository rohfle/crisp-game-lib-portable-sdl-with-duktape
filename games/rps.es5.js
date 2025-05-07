title = "RPS";
description = "\n[Tap]\n Go right &\n Change rock\n        paper\n        scissors\n";
characters = ["\n lll\nlllll\nllllll\nlllll\n lll\n lll\n", "\nllll\nllll\nllll l\nllllll\nlllll\n lll\n", "\n l l\n l l\nll l\nllllll\n llll\n lll\n"];
options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 60
};
var hands;
var lanes;
var myHand;
var multiplier;
function update() {
  if (!ticks) {
    hands = [];
    lanes = times(4, function (i) {
      return {
        x: i * 20 + 20,
        handType: rndi(3),
        nextTicks: rnd(99)
      };
    });
    myHand = {
      laneIndex: 0,
      pos: vec(20, 97),
      ty: 97,
      vy: -1,
      type: 0,
      freezeTicks: 0
    };
    multiplier = 1;
  }
  color("light_black");
  lanes.forEach(function (l) {
    l.nextTicks--;
    if (l.nextTicks < 0) {
      var my = rnd(1, difficulty) * 0.1;
      hands.push({
        lane: l,
        y: -9,
        my: my,
        baseMy: my,
        type: l.handType,
        isDestroyed: false
      });
      l.nextTicks = rnd(200, 300) / sqrt(difficulty);
      if (rnd() < 0.4) {
        l.handType = rndi(3);
      }
    }
    rect(l.x - 5, 0, 1, 100);
    rect(l.x + 4, 0, 1, 100);
  });
  remove(hands, function (h) {
    color(["cyan", "purple", "yellow"][h.type]);
    if (h.isDestroyed) {
      particle(h.lane.x, h.y);
      return true;
    }
    h.y += h.my;
    h.my += (h.baseMy * (h.y > 90 ? 2 : 1) - h.my) * 0.1;
    hands.forEach(function (oh) {
      if (oh !== h && oh.lane === h.lane && abs(oh.y - h.y) < 6) {
        var cy = (oh.y + h.y) / 2;
        var t = oh.my;
        oh.my = h.my * 0.4 - oh.my * 0.2;
        h.my = t * 0.4 - h.my * 0.2;
        if (oh.y < h.y) {
          oh.y = cy - 3;
          h.y = cy + 3;
        } else {
          oh.y = cy + 3;
          h.y = cy - 3;
        }
      }
    });
    char(addWithCharCode("a", h.type), h.lane.x, h.y, {
      rotation: 2
    });
    if (h.y > 99) {
      play("explosion");
      end();
    }
  });
  myHand.freezeTicks--;
  if (myHand.freezeTicks < 0 && input.isJustPressed) {
    play("select");
    myHand.laneIndex = wrap(myHand.laneIndex + 1, 0, 4);
    myHand.type = wrap(myHand.type + 1, 0, 3);
    myHand.ty = 97;
    myHand.vy = -sqrt(difficulty);
  }
  myHand.vy += ((myHand.freezeTicks < 0 ? -sqrt(difficulty) : 0) - myHand.vy) * 0.05;
  myHand.ty = clamp(myHand.ty + myHand.vy, 10, 97);
  var ox = lanes[myHand.laneIndex].x - myHand.pos.x;
  myHand.pos.x += ox * 0.5;
  if (ox < 1) {
    myHand.pos.x = lanes[myHand.laneIndex].x;
  }
  myHand.pos.y += (myHand.ty - myHand.pos.y) * 0.5;
  color(["cyan", "purple", "yellow"][myHand.type]);
  char(addWithCharCode("a", myHand.type), myHand.pos);
  hands.forEach(function (h) {
    if (h.lane === lanes[myHand.laneIndex] && abs(myHand.ty - h.y) < 5) {
      var o = wrap(myHand.type - h.type, 0, 3);
      if (o === 0) {
        play("laser");
        myHand.vy = 0;
        h.my -= sqrt(difficulty) * 4;
        h.y = myHand.ty - 3;
      } else if (o === 1) {
        play("coin");
        addScore(multiplier, myHand.pos);
        multiplier++;
        h.isDestroyed = true;
      } else if (o === 2) {
        play("hit");
        multiplier = 1;
        myHand.vy = sqrt(difficulty) * 5;
        h.my -= sqrt(difficulty) * 0.5;
        myHand.ty = h.y + 3;
        myHand.freezeTicks = 60 / sqrt(difficulty);
      }
    }
  });
}

