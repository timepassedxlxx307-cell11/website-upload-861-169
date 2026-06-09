(function () {
    function ready(callback) {
        if (document.readyState !== 'loading') {
            callback();
            return;
        }
        document.addEventListener('DOMContentLoaded', callback);
    }

    function all(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function initNavigation() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var panel = document.querySelector('[data-mobile-panel]');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function initGlobalSearch() {
        all('[data-global-search-form]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = form.querySelector('input[name="q"]');
                var query = input ? input.value.trim() : '';
                if (query) {
                    window.location.href = 'library.html?q=' + encodeURIComponent(query);
                } else {
                    window.location.href = 'library.html';
                }
            });
        });
    }

    function initHero() {
        var slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }
        var slides = all('[data-hero-slide]', slider);
        var dots = all('[data-hero-dot]', document);
        var prev = document.querySelector('[data-hero-prev]');
        var next = document.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5600);
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });
        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }
        show(0);
        start();
    }

    function initFilters() {
        var input = document.querySelector('[data-search-input]');
        var categorySelect = document.querySelector('[data-category-filter]');
        var yearSelect = document.querySelector('[data-year-filter]');
        var cards = all('[data-movie-card]');
        var emptyState = document.querySelector('[data-empty-state]');
        if (!cards.length) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        if (input && query) {
            input.value = query;
        }

        function match(card, text, category, year) {
            var haystack = [
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-year'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-tags'),
                card.getAttribute('data-category')
            ].join(' ').toLowerCase();
            var okText = !text || haystack.indexOf(text) !== -1;
            var okCategory = !category || card.getAttribute('data-category') === category;
            var okYear = !year || card.getAttribute('data-year') === year;
            return okText && okCategory && okYear;
        }

        function apply() {
            var text = input ? input.value.trim().toLowerCase() : '';
            var category = categorySelect ? categorySelect.value : '';
            var year = yearSelect ? yearSelect.value : '';
            var visible = 0;
            cards.forEach(function (card) {
                var isMatch = match(card, text, category, year);
                card.style.display = isMatch ? '' : 'none';
                if (isMatch) {
                    visible += 1;
                }
            });
            if (emptyState) {
                emptyState.classList.toggle('is-visible', visible === 0);
            }
        }

        if (input) {
            input.addEventListener('input', apply);
        }
        if (categorySelect) {
            categorySelect.addEventListener('change', apply);
        }
        if (yearSelect) {
            yearSelect.addEventListener('change', apply);
        }
        apply();
    }

    function initPlayer() {
        var video = document.querySelector('[data-movie-player]');
        var shell = document.querySelector('[data-player-shell]');
        var playButton = document.querySelector('[data-play-button]');
        if (!video || !shell || !playButton) {
            return;
        }
        var stream = video.getAttribute('data-stream');
        var fallback = video.getAttribute('data-fallback');
        var isLoaded = false;
        var hlsInstance = null;

        function loadVideo() {
            if (isLoaded) {
                return;
            }
            isLoaded = true;
            if (stream && stream.indexOf('.m3u8') !== -1 && window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
            } else if (stream && video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else if (fallback) {
                video.src = fallback;
            } else if (stream) {
                video.src = stream;
            }
        }

        function playVideo() {
            loadVideo();
            video.controls = true;
            shell.classList.add('is-playing');
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    shell.classList.remove('is-playing');
                });
            }
        }

        playButton.addEventListener('click', function (event) {
            event.preventDefault();
            playVideo();
        });

        video.addEventListener('click', function () {
            if (video.paused) {
                playVideo();
            }
        });

        video.addEventListener('pause', function () {
            if (!video.ended) {
                shell.classList.remove('is-playing');
            }
        });

        video.addEventListener('play', function () {
            shell.classList.add('is-playing');
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    ready(function () {
        initNavigation();
        initGlobalSearch();
        initHero();
        initFilters();
        initPlayer();
    });
}());
