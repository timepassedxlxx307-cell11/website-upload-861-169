(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
            return;
        }
        document.addEventListener('DOMContentLoaded', fn);
    }

    ready(function () {
        var toggle = document.querySelector('.nav-toggle');
        var nav = document.querySelector('.site-nav');
        if (toggle && nav) {
            toggle.addEventListener('click', function () {
                var open = nav.classList.toggle('is-open');
                toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
        if (slides.length > 1) {
            var current = 0;
            var setSlide = function (index) {
                current = index;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle('is-active', i === current);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle('is-active', i === current);
                });
            };
            dots.forEach(function (dot, index) {
                dot.addEventListener('click', function () {
                    setSlide(index);
                });
            });
            setInterval(function () {
                setSlide((current + 1) % slides.length);
            }, 5600);
        }

        var keywordInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
        var genre = document.querySelector('[data-filter-genre]');
        var year = document.querySelector('[data-filter-year]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
        var empty = document.querySelector('[data-empty-state]');
        var filter = function () {
            if (!cards.length) {
                return;
            }
            var key = '';
            keywordInputs.some(function (input) {
                var value = input.value.trim().toLowerCase();
                if (value) {
                    key = value;
                    return true;
                }
                return false;
            });
            var genreValue = genre ? genre.value : '';
            var yearValue = year ? year.value : '';
            var shown = 0;
            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title') || '',
                    card.getAttribute('data-genre') || '',
                    card.getAttribute('data-tags') || '',
                    card.getAttribute('data-region') || '',
                    card.getAttribute('data-year') || ''
                ].join(' ').toLowerCase();
                var ok = true;
                if (key && haystack.indexOf(key) === -1) {
                    ok = false;
                }
                if (genreValue && (card.getAttribute('data-genre') || '').indexOf(genreValue) === -1) {
                    ok = false;
                }
                if (yearValue && (card.getAttribute('data-year') || '') !== yearValue) {
                    ok = false;
                }
                card.style.display = ok ? '' : 'none';
                if (ok) {
                    shown += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('is-visible', shown === 0);
            }
        };
        keywordInputs.concat([genre, year]).forEach(function (node) {
            if (node) {
                node.addEventListener('input', filter);
                node.addEventListener('change', filter);
            }
        });
        filter();
    });
}());
