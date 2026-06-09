(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalise(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.getElementById("mainNav");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function play() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var index = parseInt(dot.getAttribute("data-hero-dot"), 10);
        show(index);
        play();
      });
    });

    root.addEventListener("mouseenter", function () {
      window.clearInterval(timer);
    });

    root.addEventListener("mouseleave", play);
    play();
  }

  function setupFilters() {
    var listings = Array.prototype.slice.call(document.querySelectorAll(".movie-listing"));
    if (!listings.length) {
      return;
    }

    var search = document.querySelector("[data-movie-search]");
    var year = document.querySelector("[data-year-filter]");
    var type = document.querySelector("[data-type-filter]");
    var category = document.querySelector("[data-category-filter]");
    var empty = document.querySelector(".filter-empty");
    var params = new URLSearchParams(window.location.search);

    if (search && params.get("q")) {
      search.value = params.get("q");
    }

    function pass(card) {
      var keyword = normalise(search ? search.value : "");
      var yearValue = normalise(year ? year.value : "");
      var typeValue = normalise(type ? type.value : "");
      var categoryValue = normalise(category ? category.value : "");
      var haystack = normalise([
        card.getAttribute("data-title"),
        card.getAttribute("data-year"),
        card.getAttribute("data-type"),
        card.getAttribute("data-region")
      ].join(" "));
      var cardYear = normalise(card.getAttribute("data-year"));
      var cardType = normalise(card.getAttribute("data-type"));
      var cardCategory = normalise(card.getAttribute("data-category"));
      return (!keyword || haystack.indexOf(keyword) !== -1) &&
        (!yearValue || cardYear === yearValue) &&
        (!typeValue || cardType.indexOf(typeValue) !== -1) &&
        (!categoryValue || cardCategory === categoryValue);
    }

    function apply() {
      var shown = 0;
      listings.forEach(function (listing) {
        var cards = Array.prototype.slice.call(listing.querySelectorAll(".movie-card"));
        cards.forEach(function (card) {
          var visible = pass(card);
          card.hidden = !visible;
          if (visible) {
            shown += 1;
          }
        });
      });
      if (empty) {
        empty.hidden = shown !== 0;
      }
    }

    [search, year, type, category].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    apply();
  }

  function createMoviePlayer(videoId, buttonId, source) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var attached = false;

    if (!video || !button || !source) {
      return;
    }

    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var stream = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        stream.loadSource(source);
        stream.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function start() {
      attach();
      button.classList.add("is-hidden");
      var request = video.play();
      if (request && typeof request.catch === "function") {
        request.catch(function () {
          button.classList.remove("is-hidden");
        });
      }
    }

    button.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
  }

  window.createMoviePlayer = createMoviePlayer;

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
