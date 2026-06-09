(function () {
  const form = document.querySelector('[data-search-form]');
  const input = document.querySelector('[data-search-input]');
  const results = document.querySelector('[data-search-results]');
  const status = document.querySelector('[data-search-status]');
  const defaultBlock = document.querySelector('[data-search-default]');

  if (!form || !input || !results || !status || !window.SEARCH_MOVIES) {
    return;
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function createCard(movie) {
    return [
      '<article class="movie-card poster">',
      '<a class="movie-poster" href="' + escapeHtml(movie.url) + '" aria-label="' + escapeHtml(movie.title) + ' 在线观看">',
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="poster-shade"></span>',
      '<span class="play-pill">播放</span>',
      '</a>',
      '<div class="movie-info">',
      '<a class="movie-title" href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a>',
      '<p>' + escapeHtml(movie.oneLine) + '</p>',
      '<div class="movie-meta">',
      '<span>' + escapeHtml(movie.year) + '</span>',
      '<span>' + escapeHtml(movie.region) + '</span>',
      '<span>' + escapeHtml(movie.type) + '</span>',
      '</div>',
      '<div class="tag-row"><span>' + escapeHtml(movie.genre) + '</span></div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function runSearch(query) {
    const value = normalize(query);
    input.value = query || '';

    if (!value) {
      results.innerHTML = '';
      status.textContent = '';
      if (defaultBlock) {
        defaultBlock.style.display = '';
      }
      return;
    }

    const matched = window.SEARCH_MOVIES.filter(function (movie) {
      return normalize([
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.tags,
        movie.oneLine
      ].join(' ')).includes(value);
    });

    if (defaultBlock) {
      defaultBlock.style.display = 'none';
    }

    status.textContent = '搜索结果：' + matched.length + ' 个';
    results.innerHTML = matched.slice(0, 240).map(createCard).join('');
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    const query = input.value.trim();
    const url = new URL(window.location.href);
    if (query) {
      url.searchParams.set('q', query);
    } else {
      url.searchParams.delete('q');
    }
    window.history.replaceState(null, '', url.toString());
    runSearch(query);
  });

  const params = new URLSearchParams(window.location.search);
  runSearch(params.get('q') || '');
})();
