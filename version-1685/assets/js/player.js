function initMoviePlayer(options) {
    var source = options.source;
    var video = document.getElementById(options.videoId);
    var cover = document.getElementById(options.overlayId);
    var hlsInstance = null;
    var started = false;
    if (!video || !cover || !source) {
        return;
    }
    function attachAndPlay() {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            video.play().catch(function () {});
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.play().catch(function () {});
            });
            return;
        }
        video.src = source;
        video.play().catch(function () {});
    }
    function start() {
        if (!started) {
            started = true;
            cover.classList.add("is-hidden");
            attachAndPlay();
            return;
        }
        if (video.paused) {
            video.play().catch(function () {});
        } else {
            video.pause();
        }
    }
    cover.addEventListener("click", start);
    video.addEventListener("click", function () {
        if (!started) {
            start();
        }
    });
    window.addEventListener("pagehide", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
