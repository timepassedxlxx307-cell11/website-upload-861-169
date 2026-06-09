function qs(selector, scope) {
    return (scope || document).querySelector(selector);
}

function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
}

function escapeHtml(value) {
    return String(value || "").replace(/[&<>"]/g, function (char) {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "\"": "&quot;"
        }[char];
    });
}

function initMenu() {
    var toggle = qs(".nav-toggle");
    var menu = qs(".mobile-menu");
    if (!toggle || !menu) {
        return;
    }
    toggle.addEventListener("click", function () {
        menu.classList.toggle("is-open");
    });
}

function initHero() {
    var slides = qsa(".hero-slide");
    var dots = qsa(".hero-dot");
    if (!slides.length || !dots.length) {
        return;
    }
    var index = 0;
    function show(nextIndex) {
        slides[index].classList.remove("is-active");
        dots[index].classList.remove("is-active");
        index = nextIndex;
        slides[index].classList.add("is-active");
        dots[index].classList.add("is-active");
    }
    dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
            show(dotIndex);
        });
    });
    window.setInterval(function () {
        show((index + 1) % slides.length);
    }, 5200);
}

function initCatalogFilter() {
    var input = qs(".catalog-filter");
    var cards = qsa(".catalog-grid .movie-card");
    if (!input || !cards.length) {
        return;
    }
    function filter(value) {
        var keyword = String(value || "").trim().toLowerCase();
        cards.forEach(function (card) {
            var text = [
                card.getAttribute("data-title"),
                card.getAttribute("data-region"),
                card.getAttribute("data-genre"),
                card.getAttribute("data-tags")
            ].join(" ").toLowerCase();
            card.style.display = !keyword || text.indexOf(keyword) !== -1 ? "" : "none";
        });
    }
    input.addEventListener("input", function () {
        filter(input.value);
    });
    qsa(".filter-chip").forEach(function (chip) {
        chip.addEventListener("click", function () {
            input.value = chip.getAttribute("data-filter") || "";
            filter(input.value);
        });
    });
}

function movieResultCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
        return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return "<article class="movie-card">" +
        "<a class="movie-poster" href="" + escapeHtml(movie.url) + "">" +
        "<img src="" + escapeHtml(movie.cover) + "" alt="" + escapeHtml(movie.title) + "" loading="lazy">" +
        "<span class="poster-shade"></span><span class="play-pill">播放</span></a>" +
        "<div class="movie-info"><div class="meta-line"><span>" + escapeHtml(movie.category) + "</span><span>" + escapeHtml(movie.year) + "</span></div>" +
        "<h3><a href="" + escapeHtml(movie.url) + "">" + escapeHtml(movie.title) + "</a></h3>" +
        "<p>" + escapeHtml(movie.description) + "</p><div class="tag-row">" + tags + "</div></div></article>";
}

function initSearchPage() {
    var results = qs(".search-results");
    var input = qs("#search-input");
    if (!results || !input || !window.MOVIE_INDEX) {
        return;
    }
    var params = new URLSearchParams(window.location.search);
    var keyword = params.get("q") || "";
    input.value = keyword;
    function render(value) {
        var query = String(value || "").trim().toLowerCase();
        if (!query) {
            results.innerHTML = "<div class="empty-state">输入关键词后即可查看匹配的影视内容。</div>";
            return;
        }
        var matched = window.MOVIE_INDEX.filter(function (movie) {
            return [movie.title, movie.region, movie.type, movie.year, movie.genre, (movie.tags || []).join(" ")].join(" ").toLowerCase().indexOf(query) !== -1;
        }).slice(0, 80);
        if (!matched.length) {
            results.innerHTML = "<div class="empty-state">没有找到匹配内容，换个关键词试试。</div>";
            return;
        }
        results.innerHTML = matched.map(movieResultCard).join("");
    }
    render(keyword);
    qsa(".search-tag").forEach(function (tag) {
        tag.addEventListener("click", function () {
            var value = (tag.getAttribute("data-search-tag") || "").replace(/^#/, "");
            input.value = value;
            history.replaceState(null, "", "search.html?q=" + encodeURIComponent(value));
            render(value);
        });
    });
}

document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initHero();
    initCatalogFilter();
    initSearchPage();
});
