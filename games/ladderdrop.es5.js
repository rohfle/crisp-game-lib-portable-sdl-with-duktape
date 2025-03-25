function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
title = "LADDER DROP";
description = "\n[Tap] Drop\n";
characters = ["\nllllll\nll l l\nll l l\nllllll\n l  l\n l  l\n  ", "\nllllll\nll l l\nll l l\nllllll\nll  ll\n  ", "\nllllll\nllllll\nllllll\nllllll\n l  l\n l  l\n  ", "\nllllll\nllllll\nllllll\nllllll\nll  ll\n  ", "\nb    b\nbbbbbb\nb    b\nb    b\nbbbbbb\nb    b\n  ", "\nLLLLLL\nr rr r\nr rr r\n\nrr rr\nrr rr\n  ", "\nb    b\nbbbbbb\nb    b\nb    b\nbbbbbb\nb    b\n  ", "\nRRRRRR\nrrrrrr\nrrrrrr\nrrrrrr\nrrrrrr\nrrrrrr\n  ", "\n yyy\nyYYYy\nyYyYy\nyYYYy\n yyy\n  "];
options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 19
};
var panels;
var pvx;
var nextPanelX;
var coinPanelCount;
var player;
var lockCount;
var coins;
var scr;
var totalScr;
var multiplier;
var coinPanelInterval = 4;
function update() {
  if (!ticks) {
    panels = [{
      pos: vec(2, 88),
      size: vec(16, 2),
      lxs: [],
      state: "fix",
      hasCoin: false
    }];
    pvx = 1;
    nextPanelX = 50;
    coinPanelCount = coinPanelInterval;
    addPanel();
    player = {
      pos: vec(9, 91),
      vx: 1,
      state: "walk"
    };
    coins = [];
    scr = totalScr = 0;
    multiplier = 1;
    lockCount = 0;
  }
  color("light_blue");
  rect(0, 0, 2, 100);
  rect(98, 0, 2, 100);
  color("black");
  var minY = 99;
  remove(panels, function (p) {
    if (p.state === "wait") {
      p.pos.x += pvx * sqrt(difficulty) * 1.5;
      nextPanelX = p.pos.x;
      if (p.pos.x < -9) {
        pvx *= -1;
        p.pos.x = -9;
      } else if (p.pos.x > 109 - p.size.x * 6) {
        pvx *= -1;
        p.pos.x = 109 - p.size.x * 6;
      }
      drawPanel(p);
      if (input.isJustPressed) {
        play("select");
        p.state = "drop";
      }
    } else if (p.state === "drop") {
      p.pos.y += 6 * sqrt(difficulty);
      color("transparent");
      var cl = drawPanel(p);
      if (cl.e || cl.f) {
        while (cl.e || cl.f) {
          p.pos.y--;
          cl = drawPanel(p);
        }
        p.pos.y = floor(p.pos.y) + totalScr % 1;
        p.state = "fix";
        if (p.hasCoin) {
          p.hasCoin = false;
          times(p.size.x, function (x) {
            coins.push(vec(p.pos.x + x * 6 + 2, p.pos.y + 2));
          });
        }
        addPanel();
      }
      color("black");
      drawPanel(p);
    } else if (p.state === "fix") {
      p.pos.y += scr;
      color("black");
      drawPanel(p);
      if (p.pos.y < minY) {
        minY = p.pos.y;
      }
    }
    if (p.pos.y > 99) {
      if (p.state === "drop") {
        addPanel();
      }
      return true;
    }
  });
  color("black");
  player.pos.y += scr;
  if (player.state === "walk" || player.state === "downWalk") {
    player.pos.x += player.vx * sqrt(difficulty) * 0.4;
    var c = char(addWithCharCode("a", floor(ticks / 30) % 2), player.pos, {
      mirror: {
        x: player.vx
      }
    }).isColliding["char"];
    if (c.h) {
      play("explosion");
      end();
    }
    if (c.f || player.pos.x < 5 || player.pos.x > 95) {
      play("laser");
      player.vx *= -1;
      player.pos.x += player.vx * 2;
      lockCount++;
      if (lockCount > 8) {
        player.pos.x = clamp(player.pos.x, 10, 90);
        player.pos.y -= 6;
        lockCount = 0;
        player.state = "drop";
      }
    } else {
      lockCount = 0;
    }
    if (c.e) {
      if (player.state === "walk") {
        player.state = "up";
      }
    } else {
      player.state = "walk";
      color("transparent");
      c = char("a", player.pos.x, player.pos.y + 6).isColliding["char"];
      if (!(c.e || c.f)) {
        player.state = "drop";
      }
    }
  } else if (player.state === "up") {
    play("hit");
    player.pos.y -= sqrt(difficulty) * 0.3;
    color("transparent");
    var _c = char("c", player.pos).isColliding["char"];
    if (!_c.e && _c.f) {
      player.state = "down";
    } else if (!_c.e) {
      var py = player.pos.y;
      while (_c.e) {
        py++;
        _c = char("c", player.pos.x, py).isColliding["char"];
      }
      player.pos.y = floor(py) + totalScr % 1;
      player.pos.x += player.vx * sqrt(difficulty) * 0.5;
      player.state = "walk";
    }
    color("black");
    char(addWithCharCode("c", floor(ticks / 30) % 2), player.pos);
  } else if (player.state === "down") {
    play("hit");
    player.pos.y += sqrt(difficulty) * 0.4;
    color("transparent");
    var _c2 = char("c", player.pos.x, player.pos.y + 6).isColliding["char"];
    if (!_c2.e && _c2.f) {
      var _py = player.pos.y + 6;
      while (_c2.f) {
        _py--;
        _c2 = char("c", player.pos.x, _py).isColliding["char"];
      }
      player.pos.y = floor(_py) + totalScr % 1;
      player.state = "downWalk";
    }
    color("black");
    char(addWithCharCode("c", floor(ticks / 30) % 2), player.pos);
  } else {
    player.pos.y += sqrt(difficulty) * 0.5;
    color("transparent");
    var _c3 = char("a", player.pos).isColliding["char"];
    if (_c3.e || _c3.f) {
      var _py2 = player.pos.y;
      while (!(_c3.e || _c3.f)) {
        _py2--;
        _c3 = char("a", player.pos).isColliding["char"];
      }
      player.pos.y = floor(_py2 - 1) + totalScr % 1;
      player.state = "walk";
    }
    color("black");
    char("a", player.pos, {
      mirror: {
        x: player.vx
      }
    });
  }
  if (player.pos.y > 99) {
    play("explosion");
    end();
  }
  color("black");
  remove(coins, function (c) {
    c.y += scr;
    var cl = char("i", c).isColliding["char"];
    if (cl.a || cl.b) {
      play("coin");
      addScore(multiplier, c);
      multiplier++;
      return true;
    }
    if (c.y > 36 && (cl.e || cl.f)) {
      return true;
    }
    if (c.y > 103) {
      if (multiplier > 1) {
        multiplier--;
      }
      return true;
    }
  });
  scr = 0.01 * difficulty;
  if (minY < 30) {
    scr += (30 - minY) * 0.1;
  }
  totalScr += scr;
  function drawPanel(p) {
    var lc = p.state == "fix" ? "e" : "g";
    var fc = p.state == "drop" ? "h" : "f";
    var c;
    var li = 0;
    var cl = {};
    times(p.size.x, function (x) {
      times(p.size.y, function (y) {
        c = undefined;
        if (y === 0 && p.hasCoin) {
          c = "i";
        } else if (y >= 1 && li < p.lxs.length && x === p.lxs[li]) {
          c = lc;
        } else if (y === 1) {
          c = fc;
        }
        if (c != null) {
          var clc = char(c, p.pos.x + x * 6 + 3, p.pos.y + y * 6 + 3).isColliding["char"];
          cl = _objectSpread(_objectSpread({}, cl), clc);
        }
      });
      if (x === p.lxs[li]) {
        li++;
      }
    });
    return cl;
  }
  function addPanel() {
    var size = vec(rndi(4, 8), rndi(3, 6));
    var lx = -1;
    var nd = rndi(1, 5);
    var lxs = [];
    while (lx < size.x) {
      lx += nd;
      lxs.push(lx);
      lx += rndi(2, 5);
    }
    var hasCoin = false;
    coinPanelCount--;
    if (coinPanelCount === 0) {
      coinPanelCount = coinPanelInterval;
      hasCoin = true;
    }
    panels.push({
      pos: vec(clamp(nextPanelX, 2, 98 - size.x * 6), 0),
      size: size,
      lxs: lxs,
      state: "wait",
      hasCoin: hasCoin
    });
  }
}

