function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
title = "CARD Q";
description = "\n[Tap]\n Pull out a card\n";
characters = ["\nl  l\nl l l\nl l l\nl l l\nl l l\nl  l\n"];
options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 3
};
var numChars = ["", "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
var playerCards;
var enemyCards;
var placedCards;
var placedCardNumbers;
var centerY;
var targetCenterY;
var playerPrevMoveIndex;
var enemyPrevMoveIndex;
var enemyNextMoveIndex;
var enemyNextMoveTicks;
var shuffleTicks;
var shuffleCount;
var penaltyIndex;
var penaltyTicks;
var multiplier;
var cardIntervalX = 15;
var cardRowCount = 5;
var cardColumnCount = 5;
function update() {
  if (!ticks) {
    placedCardNumbers = [2, 12];
    placedCards = times(2, function (i) {
      var pos = vec(calcPlacedCardX(i), 0);
      var tPos = vec(pos);
      return {
        num: placedCardNumbers[i],
        pos: pos,
        tPos: tPos
      };
    });
    playerCards = times(cardColumnCount * cardRowCount, function (i) {
      var gPos = vec(i % cardColumnCount, floor(i / cardColumnCount));
      var num = gPos.y === 0 ? [1, 3, 3, 11, 13][gPos.x] : rndi(1, 14);
      var pos = calcPlayerCardPos(gPos);
      var tPos = vec(pos);
      return {
        num: num,
        pos: pos,
        tPos: tPos,
        gPos: gPos
      };
    });
    enemyCards = times(cardColumnCount * cardRowCount, function (i) {
      var gPos = vec(i % cardColumnCount, floor(i / cardColumnCount));
      var num = rndi(1, 14);
      var pos = calcEnemyCardPos(gPos);
      var tPos = vec(pos);
      return {
        num: num,
        pos: pos,
        tPos: tPos,
        gPos: gPos
      };
    });
    centerY = targetCenterY = 40;
    playerPrevMoveIndex = enemyPrevMoveIndex = 0;
    enemyNextMoveIndex = undefined;
    enemyNextMoveTicks = 120;
    shuffleTicks = shuffleCount = 0;
    penaltyTicks = -1;
    multiplier = 1;
  }
  shuffleTicks++;
  if (shuffleTicks > 60) {
    var isPlacable = false;
    var isPlayerPlacable = false;
    for (var i = 0; i < cardColumnCount; i++) {
      var _checkPlacedIndex = checkPlacedIndex(i, playerPrevMoveIndex, playerCards),
        _checkPlacedIndex2 = _slicedToArray(_checkPlacedIndex, 3),
        pi = _checkPlacedIndex2[0],
        cn = _checkPlacedIndex2[1],
        ci = _checkPlacedIndex2[2];
      if (pi >= 0) {
        isPlacable = isPlacable = true;
        break;
      }
      var _checkPlacedIndex3 = checkPlacedIndex(i, enemyPrevMoveIndex, enemyCards),
        _checkPlacedIndex4 = _slicedToArray(_checkPlacedIndex3, 3),
        epi = _checkPlacedIndex4[0],
        ecn = _checkPlacedIndex4[1],
        eci = _checkPlacedIndex4[2];
      if (epi >= 0) {
        isPlacable = true;
        break;
      }
    }
    if (!isPlayerPlacable) {
      enemyNextMoveTicks *= 0.3;
    }
    shuffleCount++;
    if (!isPlacable || shuffleCount > 2) {
      play("powerUp");
      placedCards.forEach(function (c) {
        c.tPos.x = c.pos.x < 50 ? -50 : 150;
      });
      placedCardNumbers = times(2, function () {
        return rndi(1, 14);
      });
      placedCardNumbers.forEach(function (n, i) {
        placedCards.push({
          num: n,
          pos: vec(i === 0 ? -5 : 105, 0),
          tPos: vec(calcPlacedCardX(i), 0)
        });
      });
      shuffleCount = 0;
    }
    shuffleTicks = 0;
  }
  var pci = floor((input.pos.x - 50) / cardIntervalX + cardColumnCount / 2);
  if (input.isJustPressed) {
    if (pci >= 0 && pci < cardColumnCount) {
      var _pi = placeCard(pci, playerPrevMoveIndex, playerCards);
      if (_pi < 0) {
        play("hit");
        penaltyIndex = pci;
        penaltyTicks = 60;
        targetCenterY += 5;
        multiplier = 1;
        shuffleTicks = shuffleCount = 0;
      } else {
        play("coin");
        playerPrevMoveIndex = _pi;
        targetCenterY -= 5;
        addScore(multiplier, _pi === 0 ? 8 : 92, centerY);
        multiplier++;
      }
    }
  }
  enemyNextMoveTicks--;
  if (enemyNextMoveTicks < 0) {
    enemyNextMoveTicks = rnd(50, 70) / sqrt(difficulty);
    if (enemyNextMoveIndex != null) {
      var _checkPlacedIndex5 = checkPlacedIndex(enemyNextMoveIndex, enemyPrevMoveIndex, enemyCards),
        _checkPlacedIndex6 = _slicedToArray(_checkPlacedIndex5, 3),
        _pi2 = _checkPlacedIndex6[0],
        _cn = _checkPlacedIndex6[1],
        _ci = _checkPlacedIndex6[2];
      if (_pi2 < 0) {
        enemyNextMoveTicks *= 3;
      } else {
        play("select");
        placeCard(enemyNextMoveIndex, enemyPrevMoveIndex, enemyCards);
        enemyPrevMoveIndex = _pi2;
        targetCenterY += 5;
        multiplier = 1;
      }
    }
    enemyNextMoveIndex = undefined;
    var ni = rndi(cardColumnCount);
    for (var _i = 0; _i < cardColumnCount; _i++) {
      var _checkPlacedIndex7 = checkPlacedIndex(ni, enemyPrevMoveIndex, enemyCards),
        _checkPlacedIndex8 = _slicedToArray(_checkPlacedIndex7, 3),
        _pi3 = _checkPlacedIndex8[0],
        _cn2 = _checkPlacedIndex8[1],
        _ci2 = _checkPlacedIndex8[2];
      if (_pi3 >= 0) {
        if (_pi3 !== enemyPrevMoveIndex) {
          enemyNextMoveTicks *= 1.5;
        }
        enemyNextMoveIndex = ni;
        break;
      }
      ni = wrap(ni + 1, 0, cardColumnCount);
    }
  }
  centerY += (targetCenterY - centerY) * 0.1;
  playerCards.forEach(function (c) {
    movePos(c.pos, c.tPos, 0.2);
    var ec = c.gPos.y === 0 && c.gPos.x === pci ? "green" : undefined;
    drawCard(c.pos.x, c.pos.y + centerY, c.num, c.gPos.y, ec);
  });
  enemyCards.forEach(function (c) {
    movePos(c.pos, c.tPos, 0.2);
    var ec = c.gPos.y === 0 && c.gPos.x === enemyNextMoveIndex ? "red" : undefined;
    drawCard(c.pos.x, c.pos.y + centerY, c.num, c.gPos.y, ec);
  });
  placedCards.forEach(function (c) {
    movePos(c.pos, c.tPos, 0.2);
    drawCard(c.pos.x, c.pos.y + centerY, c.num, 0);
  });
  if (placedCards.length > 19) {
    placedCards.shift();
  }
  if (penaltyTicks > 0) {
    penaltyTicks--;
    color("red");
    text("X", calcCardX(penaltyIndex), centerY + 6);
    color("black");
  }
  if (targetCenterY < 16) {
    targetCenterY += (16 - targetCenterY) * 0.1;
  }
  if (centerY > 94) {
    play("explosion");
    end();
  }
  function placeCard(idx, ppi, cards) {
    var _checkPlacedIndex9 = checkPlacedIndex(idx, ppi, cards),
      _checkPlacedIndex10 = _slicedToArray(_checkPlacedIndex9, 3),
      pi = _checkPlacedIndex10[0],
      cn = _checkPlacedIndex10[1],
      ci = _checkPlacedIndex10[2];
    if (pi === -1) {
      return -1;
    }
    placedCardNumbers[pi] = cn;
    var c = cards.splice(ci, 1)[0];
    placedCards.push({
      num: c.num,
      pos: c.pos,
      tPos: vec(calcPlacedCardX(pi), 0)
    });
    cards.forEach(function (c) {
      if (c.gPos.x === idx) {
        c.gPos.y--;
        c.tPos = cards === playerCards ? calcPlayerCardPos(c.gPos) : calcEnemyCardPos(c.gPos);
      }
    });
    var gPos = vec(idx, cardRowCount - 1);
    var pos = cards === playerCards ? calcPlayerCardPos(gPos) : calcEnemyCardPos(gPos);
    var tPos = vec(pos);
    cards.push({
      num: rndi(1, 14),
      pos: pos,
      tPos: tPos,
      gPos: gPos
    });
    shuffleTicks = shuffleCount = 0;
    return pi;
  }
  function checkPlacedIndex(idx, ppi, cards) {
    var cn;
    var ci;
    cards.forEach(function (c, i) {
      if (c.gPos.y === 0 && c.gPos.x === idx) {
        cn = c.num;
        ci = i;
      }
    });
    var pi = -1;
    placedCardNumbers.forEach(function (c, i) {
      if ((ppi === 1 || pi === -1) && (cn === wrap(c - 1, 1, 14) || cn === wrap(c + 1, 1, 14))) {
        pi = i;
      }
    });
    return [pi, cn, ci];
  }
  function drawCard(x, y, n, gy) {
    var edgeColor = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
    if (y < -5 || y > 105) {
      return;
    }
    var ec = edgeColor != null ? edgeColor : gy === 0 ? "black" : "light_black";
    color(ec);
    box(x, y, 9, 10);
    color("white");
    box(x, y, 7, 8);
    var nc = gy === 0 ? "black" : "light_black";
    color(nc);
    if (n === 10) {
      char("a", x, y);
    } else {
      text(numChars[n], x, y);
    }
  }
  function calcPlayerCardPos(p) {
    return vec(calcCardX(p.x), (p.y + 1) * 11);
  }
  function calcEnemyCardPos(p) {
    return vec(calcCardX(p.x), (p.y + 1) * -11);
  }
  function calcPlacedCardX(i) {
    return 50 + (i - 0.5) * 25;
  }
  function calcCardX(i) {
    return 50.5 + (i - cardColumnCount / 2 + 0.5) * cardIntervalX;
  }
  function movePos(p, tp, ratio) {
    p.add(vec(tp).sub(p).mul(ratio));
    if (p.distanceTo(tp) < 1) {
      p.set(tp);
    }
  }
}

