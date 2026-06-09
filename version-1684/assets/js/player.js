(function () {
  const configElement = document.getElementById('playback-config');
  const video = document.getElementById('movie-video');
  const startButton = document.getElementById('player-start');

  if (!configElement || !video || !startButton) {
    return;
  }

  let config = {};
  try {
    config = JSON.parse(configElement.textContent || '{}');
  } catch (error) {
    config = {};
  }

  const streamUrl = config.url;
  let attached = false;
  let hlsInstance = null;

  function attachStream() {
    if (attached || !streamUrl) {
      return;
    }

    attached = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
      return;
    }

    video.src = streamUrl;
  }

  function beginPlayback() {
    attachStream();
    startButton.classList.add('is-hidden');
    const result = video.play();
    if (result && typeof result.catch === 'function') {
      result.catch(function () {
        startButton.classList.remove('is-hidden');
      });
    }
  }

  startButton.addEventListener('click', beginPlayback);

  video.addEventListener('click', function () {
    if (video.paused) {
      beginPlayback();
    }
  });

  video.addEventListener('play', function () {
    startButton.classList.add('is-hidden');
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
})();
