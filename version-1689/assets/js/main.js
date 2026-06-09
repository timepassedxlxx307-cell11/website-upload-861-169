(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayer();
  });

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var nextIndex = Number(dot.getAttribute("data-hero-dot") || 0);
        show(nextIndex);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFilters() {
    var container = document.querySelector("[data-card-container]");

    if (!container) {
      return;
    }

    var cards = Array.prototype.slice.call(container.querySelectorAll("[data-card]"));
    var searchInput = document.querySelector("[data-search-input]");
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]"));
    var sortSelect = document.querySelector("[data-sort-select]");
    var activeFilters = {};

    filterButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        var field = button.getAttribute("data-filter-field");
        var value = button.getAttribute("data-filter-value");

        if (!field || !value) {
          return;
        }

        activeFilters[field] = value;

        filterButtons.forEach(function (item) {
          if (item.getAttribute("data-filter-field") === field) {
            item.classList.toggle("is-active", item === button);
          }
        });

        applyFilters();
      });
    });

    if (searchInput) {
      searchInput.addEventListener("input", applyFilters);
    }

    if (sortSelect) {
      sortSelect.addEventListener("change", function () {
        sortCards(sortSelect.value);
        applyFilters();
      });
      sortCards(sortSelect.value);
    }

    function applyFilters() {
      var query = searchInput ? searchInput.value.trim().toLowerCase() : "";

      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search") || "").toLowerCase();
        var matchesSearch = !query || text.indexOf(query) !== -1;
        var matchesCategory = true;

        Object.keys(activeFilters).forEach(function (field) {
          var value = activeFilters[field];

          if (value && value !== "all") {
            matchesCategory = matchesCategory && card.getAttribute("data-" + field) === value;
          }
        });

        card.hidden = !(matchesSearch && matchesCategory);
      });
    }

    function sortCards(mode) {
      var sorted = cards.slice().sort(function (a, b) {
        if (mode === "latest") {
          return toNumber(b.getAttribute("data-year")) - toNumber(a.getAttribute("data-year"));
        }

        if (mode === "title") {
          return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-Hans-CN");
        }

        return toNumber(b.getAttribute("data-hot")) - toNumber(a.getAttribute("data-hot"));
      });

      sorted.forEach(function (card) {
        container.appendChild(card);
      });
    }

    function toNumber(value) {
      var number = Number(String(value || "").replace(/[^0-9]/g, ""));
      return Number.isFinite(number) ? number : 0;
    }
  }

  function setupPlayer() {
    var shell = document.querySelector("[data-player]");

    if (!shell) {
      return;
    }

    var video = shell.querySelector("video");
    var button = shell.querySelector("[data-play-button]");
    var source = shell.getAttribute("data-source");
    var started = false;
    var hlsInstance = null;

    function startPlayback() {
      if (!video || !source) {
        return;
      }

      if (!started) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else {
          video.src = source;
        }

        started = true;
      }

      shell.classList.add("is-playing");
      video.controls = true;

      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          shell.classList.remove("is-playing");
        });
      }
    }

    if (button) {
      button.addEventListener("click", startPlayback);
    }

    shell.addEventListener("click", function (event) {
      if (!started && event.target === shell) {
        startPlayback();
      }
    });

    if (video) {
      video.addEventListener("play", function () {
        shell.classList.add("is-playing");
      });

      video.addEventListener("error", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
      });
    }
  }
})();
