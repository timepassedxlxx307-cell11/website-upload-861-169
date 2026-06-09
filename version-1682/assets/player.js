import { H as Hls } from './hls-vendor-dru42stk.js';

var players = Array.prototype.slice.call(document.querySelectorAll('video.movie-player'));

players.forEach(function (video) {
  var videoUrl = video.getAttribute('src');
  var overlay = video.closest('.player-shell') ? video.closest('.player-shell').querySelector('.player-overlay') : null;
  var hlsInstance = null;

  if (videoUrl && Hls && Hls.isSupported()) {
    video.removeAttribute('src');
    hlsInstance = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    });
    hlsInstance.loadSource(videoUrl);
    hlsInstance.attachMedia(video);
    hlsInstance.on(Hls.Events.ERROR, function (event, data) {
      if (!data || !data.fatal) {
        return;
      }
      if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
        hlsInstance.startLoad();
      } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
        hlsInstance.recoverMediaError();
      } else {
        hlsInstance.destroy();
      }
    });
  } else if (videoUrl && video.canPlayType('application/vnd.apple.mpegurl')) {
    video.setAttribute('src', videoUrl);
  }

  var startPlayback = function () {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
    var playResult = video.play();
    if (playResult && typeof playResult.catch === 'function') {
      playResult.catch(function () {});
    }
  };

  if (overlay) {
    overlay.addEventListener('click', startPlayback);
  }

  video.addEventListener('play', function () {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  });

  video.addEventListener('pause', function () {
    if (overlay && video.currentTime === 0) {
      overlay.classList.remove('is-hidden');
    }
  });
});
