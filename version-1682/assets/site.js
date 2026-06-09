(function () {
  var menuButton = document.querySelector('[data-mobile-menu]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');
  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  if (slides.length > 1) {
    var current = 0;
    var showSlide = function (index) {
      current = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    };
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });
    window.setInterval(function () {
      showSlide((current + 1) % slides.length);
    }, 5200);
  }

  var filterPanel = document.querySelector('[data-filter-panel]');
  if (filterPanel) {
    var input = filterPanel.querySelector('[data-filter-input]');
    var regionSelect = filterPanel.querySelector('[data-filter-region]');
    var yearSelect = filterPanel.querySelector('[data-filter-year]');
    var typeSelect = filterPanel.querySelector('[data-filter-type]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var applyFilter = function () {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var region = regionSelect ? regionSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      cards.forEach(function (card) {
        var matchKeyword = !keyword || (card.getAttribute('data-search') || '').indexOf(keyword) !== -1;
        var matchRegion = !region || card.getAttribute('data-region') === region;
        var matchYear = !year || card.getAttribute('data-year') === year;
        var matchType = !type || card.getAttribute('data-type') === type;
        card.style.display = matchKeyword && matchRegion && matchYear && matchType ? '' : 'none';
      });
    };
    [input, regionSelect, yearSelect, typeSelect].forEach(function (element) {
      if (element) {
        element.addEventListener('input', applyFilter);
        element.addEventListener('change', applyFilter);
      }
    });
  }

  var searchInput = document.querySelector('[data-global-search]');
  var searchResults = document.querySelector('[data-search-results]');
  if (searchInput && searchResults && typeof MOVIE_SEARCH_DATA !== 'undefined') {
    var renderResults = function () {
      var keyword = searchInput.value.trim().toLowerCase();
      var list = keyword ? MOVIE_SEARCH_DATA.filter(function (item) {
        return item.search.indexOf(keyword) !== -1;
      }).slice(0, 60) : MOVIE_SEARCH_DATA.slice(0, 24);
      if (!list.length) {
        searchResults.innerHTML = '<div class="empty-state">没有找到匹配影片</div>';
        return;
      }
      searchResults.innerHTML = '<div class="movie-grid">' + list.map(function (item) {
        return '<article class="movie-card">' +
          '<a class="card-cover" href="' + item.url + '" style="--poster-image: url(\'' + item.poster + '\');"><span class="play-badge">播放</span></a>' +
          '<div class="card-body">' +
          '<h2><a href="' + item.url + '">' + item.title + '</a></h2>' +
          '<p class="card-desc">' + item.oneLine + '</p>' +
          '<div class="card-meta"><span>' + item.year + '</span><span>' + item.category + '</span></div>' +
          '<div class="tag-row"><span>' + item.region + '</span><span>' + item.type + '</span></div>' +
          '</div>' +
          '</article>';
      }).join('') + '</div>';
    };
    searchInput.addEventListener('input', renderResults);
    renderResults();
  }
})();
