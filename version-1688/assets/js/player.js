(function () {
    window.initializePlayer = function (streamUrl) {
        var video = document.getElementById('movie-player');
        var cover = document.getElementById('player-cover');
        var started = false;
        if (!video) {
            return;
        }
        var attach = function () {
            if (started) {
                return;
            }
            started = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        };
        var play = function () {
            attach();
            if (cover) {
                cover.classList.add('is-hidden');
            }
            var request = video.play();
            if (request && typeof request.catch === 'function') {
                request.catch(function () {});
            }
        };
        if (cover) {
            cover.addEventListener('click', play);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
    };
}());
