(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-button]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-form]"));
    panels.forEach(function (panel) {
      var root = panel.closest("section") || document;
      var cards = Array.prototype.slice.call(root.querySelectorAll("[data-movie-card]"));
      var empty = root.querySelector("[data-empty-state]");
      var keyword = panel.querySelector("[data-filter-keyword]");
      var category = panel.querySelector("[data-filter-category]");
      var year = panel.querySelector("[data-filter-year]");
      var clear = panel.querySelector("[data-filter-clear]");

      function normalize(value) {
        return String(value || "").trim().toLowerCase();
      }

      function apply() {
        var q = normalize(keyword && keyword.value);
        var c = normalize(category && category.value);
        var y = normalize(year && year.value);
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = normalize([
            card.dataset.title,
            card.dataset.region,
            card.dataset.genre,
            card.dataset.type,
            card.dataset.category,
            card.dataset.year
          ].join(" "));
          var pass = true;
          if (q && haystack.indexOf(q) === -1) {
            pass = false;
          }
          if (c && normalize(card.dataset.category) !== c) {
            pass = false;
          }
          if (y && normalize(card.dataset.year).indexOf(y) === -1) {
            pass = false;
          }
          card.hidden = !pass;
          if (pass) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      [keyword, category, year].forEach(function (input) {
        if (input) {
          input.addEventListener("input", apply);
          input.addEventListener("change", apply);
        }
      });
      if (clear) {
        clear.addEventListener("click", function () {
          if (keyword) {
            keyword.value = "";
          }
          if (category) {
            category.value = "";
          }
          if (year) {
            year.value = "";
          }
          apply();
        });
      }
      var params = new URLSearchParams(window.location.search);
      if (keyword && params.get("q")) {
        keyword.value = params.get("q");
      }
      apply();
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-play-url]"));
    players.forEach(function (shell) {
      var video = shell.querySelector("video");
      var overlay = shell.querySelector(".player-overlay");
      var url = shell.getAttribute("data-play-url");
      var loaded = false;
      var hls = null;

      function prepare() {
        if (!video || !url || loaded) {
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hls.loadSource(url);
          hls.attachMedia(video);
        } else {
          video.src = url;
        }
        loaded = true;
      }

      function play() {
        prepare();
        if (!video) {
          return;
        }
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {});
        }
      }

      if (overlay) {
        overlay.addEventListener("click", play);
      }
      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            play();
          } else {
            video.pause();
          }
        });
        video.addEventListener("play", function () {
          if (overlay) {
            overlay.classList.add("is-hidden");
          }
        });
        video.addEventListener("pause", function () {
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
        });
        video.addEventListener("loadedmetadata", function () {
          if (overlay && !video.paused) {
            overlay.classList.add("is-hidden");
          }
        });
      }
      window.addEventListener("pagehide", function () {
        if (hls && typeof hls.destroy === "function") {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
