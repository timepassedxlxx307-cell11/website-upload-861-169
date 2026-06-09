(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initializeHeader() {
    var header = document.querySelector(".site-header");
    var toggle = document.querySelector(".nav-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    function onScroll() {
      if (!header) {
        return;
      }
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        var isOpen = mobileNav.hasAttribute("hidden");
        if (isOpen) {
          mobileNav.removeAttribute("hidden");
          toggle.setAttribute("aria-expanded", "true");
        } else {
          mobileNav.setAttribute("hidden", "");
          toggle.setAttribute("aria-expanded", "false");
        }
      });
    }
  }

  function initializeHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    if (!slides.length) {
      return;
    }

    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var previous = document.querySelector(".hero-prev");
    var next = document.querySelector(".hero-next");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function play() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-slide-target")) || 0);
        play();
      });
    });

    if (previous) {
      previous.addEventListener("click", function () {
        show(index - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        play();
      });
    }

    var carousel = document.querySelector(".hero-carousel");
    if (carousel) {
      carousel.addEventListener("mouseenter", stop);
      carousel.addEventListener("mouseleave", play);
    }

    show(0);
    play();
  }

  function initializeFilters() {
    var forms = Array.prototype.slice.call(document.querySelectorAll(".js-card-filter"));
    forms.forEach(function (form) {
      var container = form.parentElement;
      var items = Array.prototype.slice.call(container.querySelectorAll(".filter-item"));
      var empty = container.querySelector(".filter-empty");

      function apply() {
        var queryInput = form.querySelector('[name="q"]');
        var yearInput = form.querySelector('[name="year"]');
        var regionInput = form.querySelector('[name="region"]');
        var query = normalize(queryInput && queryInput.value);
        var year = normalize(yearInput && yearInput.value);
        var region = normalize(regionInput && regionInput.value);
        var visible = 0;

        items.forEach(function (item) {
          var text = normalize([
            item.getAttribute("data-title"),
            item.getAttribute("data-genre"),
            item.getAttribute("data-year"),
            item.getAttribute("data-region")
          ].join(" "));
          var itemYear = normalize(item.getAttribute("data-year"));
          var itemRegion = normalize(item.getAttribute("data-region"));
          var matched = true;

          if (query && text.indexOf(query) === -1) {
            matched = false;
          }
          if (year && itemYear !== year) {
            matched = false;
          }
          if (region && itemRegion !== region) {
            matched = false;
          }

          item.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      form.addEventListener("input", apply);
      form.addEventListener("change", apply);
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        apply();
      });
      apply();
    });
  }

  function initializeSearchPage() {
    var page = document.querySelector(".search-page");
    if (!page || !window.MovieSearchIndex) {
      return;
    }

    var input = document.getElementById("search-input");
    var form = document.querySelector(".search-page-form");
    var results = document.getElementById("search-results");
    var empty = document.getElementById("search-empty");
    var fallback = document.querySelector(".search-fallback");
    var title = document.getElementById("search-title");
    var subtitle = document.getElementById("search-subtitle");
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";

    if (input) {
      input.value = initialQuery;
    }

    function card(item) {
      return [
        '<article class="movie-card">',
        '  <a class="poster-link" href="' + escapeHtml(item.href) + '">',
        '    <img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
        '    <span class="play-mark">▶</span>',
        '  </a>',
        '  <div class="movie-card-body">',
        '    <div class="card-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>',
        '    <h2><a href="' + escapeHtml(item.href) + '">' + escapeHtml(item.title) + '</a></h2>',
        '    <p>' + escapeHtml(item.oneLine) + '</p>',
        '    <div class="tag-row"><span>' + escapeHtml(item.genre) + '</span></div>',
        '  </div>',
        '</article>'
      ].join("");
    }

    function search() {
      var query = normalize(input && input.value);
      var terms = query.split(/\s+/).filter(Boolean);
      var matched = [];

      if (terms.length) {
        matched = window.MovieSearchIndex.filter(function (item) {
          var text = normalize([
            item.title,
            item.year,
            item.region,
            item.type,
            item.genre,
            item.tags,
            item.oneLine
          ].join(" "));
          return terms.every(function (term) {
            return text.indexOf(term) !== -1;
          });
        }).slice(0, 120);
      }

      if (terms.length) {
        if (title) {
          title.textContent = "搜索结果";
        }
        if (subtitle) {
          subtitle.textContent = "按关键词匹配片名、题材、地区与简介。";
        }
        if (fallback) {
          fallback.classList.add("is-hidden");
        }
        results.innerHTML = matched.map(card).join("");
        empty.hidden = matched.length !== 0;
      } else {
        if (title) {
          title.textContent = "推荐片单";
        }
        if (subtitle) {
          subtitle.textContent = "也可以直接浏览下方推荐内容。";
        }
        results.innerHTML = "";
        empty.hidden = true;
        if (fallback) {
          fallback.classList.remove("is-hidden");
        }
      }
    }

    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var query = input ? input.value.trim() : "";
        var url = query ? "?q=" + encodeURIComponent(query) : window.location.pathname;
        window.history.replaceState(null, "", url);
        search();
      });
    }

    if (input) {
      input.addEventListener("input", search);
    }

    search();
  }

  function initializePlayers() {
    var shells = Array.prototype.slice.call(document.querySelectorAll(".player-shell"));
    shells.forEach(function (shell) {
      var video = shell.querySelector("video");
      var cover = shell.querySelector(".player-cover");
      var button = shell.querySelector(".player-start");
      var source = video ? video.getAttribute("data-hls") : "";
      var attached = false;
      var instance = null;

      function attach() {
        if (!video || !source || attached) {
          return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          attached = true;
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          instance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          instance.loadSource(source);
          instance.attachMedia(video);
          attached = true;
          return;
        }

        video.src = source;
        attached = true;
      }

      function play() {
        attach();
        if (cover) {
          cover.classList.add("is-hidden");
        }
        if (video) {
          video.controls = true;
          var pending = video.play();
          if (pending && pending.catch) {
            pending.catch(function () {});
          }
        }
      }

      if (cover) {
        cover.addEventListener("click", play);
      }
      if (button) {
        button.addEventListener("click", play);
      }
      if (video) {
        video.addEventListener("click", function () {
          if (!attached) {
            play();
          }
        });
      }

      window.addEventListener("pagehide", function () {
        if (instance && instance.destroy) {
          instance.destroy();
        }
      });
    });
  }

  ready(function () {
    initializeHeader();
    initializeHero();
    initializeFilters();
    initializeSearchPage();
    initializePlayers();
  });
})();
