// スクロールでイラストを登場させる（IntersectionObserver）
(function () {
  var targets = document.querySelectorAll('.hero-art, .cmedia');
  if (!('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('in-view'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('in-view');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.25, rootMargin: '0px 0px -8% 0px' });
  targets.forEach(function (el) { io.observe(el); });
})();

// 「一緒に始めましょう」ボタン：上から星がキラキラ降ってくる
(function () {
  var PALETTE = ['#DB8A4B', '#C2702F', '#F6E3CE', '#1F5B57', '#FFFFFF'];
  var STAR = '<svg viewBox="0 0 24 24" aria-hidden="true">'
    + '<path d="M12 0 L14.6 9.4 L24 12 L14.6 14.6 L12 24 L9.4 14.6 L0 12 L9.4 9.4 Z" fill="currentColor"/>'
    + '</svg>';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var PER_CLICK = reduce ? 14 : 32;   // 1クリックで降る星の数
  var MAX_STARS = 150;                // これを超えると「パーン！」と散る

  var layer;
  var buttons = [];
  var active = 0;        // 画面上の星の総数
  var bursting = false;  // 散らしている最中はクリックを受け付けない

  function rand(min, max) { return Math.random() * (max - min) + min; }

  function getLayer() {
    if (!layer) {
      layer = document.createElement('div');
      layer.className = 'spark-layer';
      document.body.appendChild(layer);
    }
    return layer;
  }

  function onSparkEnd() {
    this.remove();
    active--;
    if (active < 0) { active = 0; }
    if (bursting && active === 0) {
      bursting = false;
      setButtonsDisabled(false);
    }
  }

  function setButtonsDisabled(state) {
    buttons.forEach(function (b) { b.disabled = state; });
  }

  function rainStars() {
    var root = getLayer();
    for (var i = 0; i < PER_CLICK; i++) {
      var s = document.createElement('span');
      s.className = 'spark';
      var size = rand(10, 26);
      s.style.left = rand(0, 100) + '%';
      s.style.width = size + 'px';
      s.style.height = size + 'px';
      s.style.color = PALETTE[Math.floor(rand(0, PALETTE.length))];
      s.style.setProperty('--dur', rand(2.2, 3.8) + 's');
      s.style.setProperty('--delay', rand(0, 0.9) + 's');
      s.style.setProperty('--rot', rand(-540, 540) + 'deg');
      s.style.setProperty('--drift', rand(-70, 70) + 'px');
      s.innerHTML = STAR;
      s.addEventListener('animationend', onSparkEnd);
      root.appendChild(s);
      active++;
    }
  }

  // 増えすぎた星を、今いる位置から放射状にパーンと散らす
  function burst() {
    if (!layer || bursting) { return; }
    bursting = true;
    setButtonsDisabled(true);

    var sparks = layer.querySelectorAll('.spark');
    sparks.forEach(function (s) {
      // 落下中の見た目の位置をそのまま固定（ジャンプさせない）
      var r = s.getBoundingClientRect();
      var ang = rand(0, Math.PI * 2);
      var dist = rand(140, 520);
      s.style.left = r.left + 'px';
      s.style.top = r.top + 'px';
      s.style.setProperty('--bx', Math.cos(ang) * dist + 'px');
      s.style.setProperty('--by', Math.sin(ang) * dist + 'px');
      s.style.setProperty('--brot', rand(-720, 720) + 'deg');
      // 落下アニメを破裂アニメに差し替え（少しだけ時間差をつける）
      s.style.animation = 'starburst ' + rand(0.55, 0.75).toFixed(3)
        + 's cubic-bezier(.2,.7,.3,1) ' + rand(0, 0.12).toFixed(3) + 's both';
    });
  }

  buttons = Array.prototype.slice.call(document.querySelectorAll('.btn'));
  buttons.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      if (bursting) { return; }
      rainStars();
      if (active > MAX_STARS) { burst(); }
    });
  });
})();

