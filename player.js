```javascript
/* =========================================================
   ELEMENTOS
   ========================================================= */

const player = document.getElementById("player");

const video = document.getElementById("video");
const audio = document.getElementById("audioPlayer");

const playBtn = document.getElementById("playBtn");
const centerPlay = document.getElementById("centerPlay");

const backBtn = document.getElementById("backBtn");
const forwardBtn = document.getElementById("forwardBtn");

const progress = document.getElementById("progress");
const volume = document.getElementById("volume");
const muteBtn = document.getElementById("muteBtn");

const audioSelect = document.getElementById("audioSelect");
const subtitleSelect = document.getElementById("subtitleSelect");

const settings = document.getElementById("settings");
const settingsBtn = document.getElementById("settingsBtn");
const settingsMenu = document.getElementById("settingsMenu");

const fullscreenBtn = document.getElementById("fullscreenBtn");

const time = document.getElementById("time");

const speedButtons =
    document.querySelectorAll(
        "#settingsMenu button[data-speed]"
    );


/* =========================================================
   CONFIGURACIÓN DESDE HTML
   ========================================================= */

const VIDEO_URL =
    player.dataset.video.trim();

const AUDIO_URL =
    player.dataset.audio.trim();

const SUBTITLE_URL =
    player.dataset.subtitle.trim();


/* =========================================================
   VARIABLES
   ========================================================= */

let videoHls = null;
let audioHls = null;

let hideControlsTimer = null;

let currentSpeed = 1;


/* =========================================================
   FORMATO DE TIEMPO
   ========================================================= */

function formatTime(seconds) {

    if (!isFinite(seconds)) {
        return "00:00";
    }

    seconds = Math.max(0, Math.floor(seconds));

    const hours =
        Math.floor(seconds / 3600);

    const minutes =
        Math.floor((seconds % 3600) / 60);

    const secs =
        seconds % 60;

    if (hours > 0) {

        return (
            String(hours).padStart(2, "0") +
            ":" +
            String(minutes).padStart(2, "0") +
            ":" +
            String(secs).padStart(2, "0")
        );

    }

    return (
        String(minutes).padStart(2, "0") +
        ":" +
        String(secs).padStart(2, "0")
    );
}


/* =========================================================
   ESTADO PLAY / PAUSE
   ========================================================= */

function setPlayingState(playing) {

    if (playing) {

        player.classList.remove("paused");

        playBtn.classList.remove("play-icon");
        playBtn.classList.add("pause-icon");

        playBtn.setAttribute(
            "aria-label",
            "Pausar"
        );

        centerPlay.classList.remove("play-icon");
        centerPlay.classList.add("pause-icon");

    } else {

        player.classList.add("paused");

        playBtn.classList.remove("pause-icon");
        playBtn.classList.add("play-icon");

        playBtn.setAttribute(
            "aria-label",
            "Reproducir"
        );

        centerPlay.classList.remove("pause-icon");
        centerPlay.classList.add("play-icon");
    }
}


/* =========================================================
   MOSTRAR CONTROLES
   ========================================================= */

function showControls() {

    player.classList.add(
        "controls-visible"
    );

    clearTimeout(hideControlsTimer);

    if (!video.paused) {

        hideControlsTimer =
            setTimeout(function() {

                if (
                    !settings.classList.contains("open")
                ) {

                    player.classList.remove(
                        "controls-visible"
                    );
                }

            }, 2500);
    }
}


/* =========================================================
   REPRODUCIR
   ========================================================= */

async function playMedia() {

    try {

        video.playbackRate =
            currentSpeed;

        audio.playbackRate =
            currentSpeed;

        await video.play();

        try {
            await audio.play();
        } catch (error) {
            console.warn(
                "No se pudo iniciar el audio:",
                error
            );
        }

        setPlayingState(true);

        showControls();

    } catch (error) {

        console.error(
            "Error al reproducir:",
            error
        );

        setPlayingState(false);
    }
}


/* =========================================================
   PAUSAR
   ========================================================= */

function pauseMedia() {

    video.pause();
    audio.pause();

    setPlayingState(false);

    showControls();
}


/* =========================================================
   PLAY / PAUSE
   ========================================================= */

function togglePlay() {

    if (video.paused) {

        playMedia();

    } else {

        pauseMedia();
    }
}

playBtn.addEventListener(
    "click",
    togglePlay
);

centerPlay.addEventListener(
    "click",
    togglePlay
);


/* =========================================================
   AVANZAR / RETROCEDER
   ========================================================= */

function seek(seconds) {

    const duration =
        video.duration;

    if (!isFinite(duration)) {
        return;
    }

    const newTime =
        Math.max(
            0,
            Math.min(
                duration,
                video.currentTime + seconds
            )
        );

    video.currentTime =
        newTime;

    audio.currentTime =
        newTime;

    showControls();
}

backBtn.addEventListener(
    "click",
    function() {
        seek(-10);
    }
);

forwardBtn.addEventListener(
    "click",
    function() {
        seek(10);
    }
);


/* =========================================================
   SINCRONIZACIÓN VIDEO / AUDIO
   ========================================================= */

video.addEventListener(
    "play",
    function() {

        audio.currentTime =
            video.currentTime;

        audio.playbackRate =
            currentSpeed;

        audio.play().catch(function(error) {
            console.warn(
                "Audio no pudo reproducirse:",
                error
            );
        });

        setPlayingState(true);
    }
);

video.addEventListener(
    "pause",
    function() {

        audio.pause();

        setPlayingState(false);
    }
);

video.addEventListener(
    "seeking",
    function() {

        if (
            Math.abs(
                audio.currentTime -
                video.currentTime
            ) > 0.3
        ) {

            audio.currentTime =
                video.currentTime;
        }
    }
);

video.addEventListener(
    "timeupdate",
    function() {

        if (
            Math.abs(
                audio.currentTime -
                video.currentTime
            ) > 0.4
        ) {

            audio.currentTime =
                video.currentTime;
        }
    }
);


/* =========================================================
   PROGRESO
   ========================================================= */

video.addEventListener(
    "loadedmetadata",
    function() {

        progress.max =
            video.duration;

        time.textContent =
            formatTime(video.currentTime) +
            " / " +
            formatTime(video.duration);
    }
);

video.addEventListener(
    "timeupdate",
    function() {

        if (!progress.matches(":active")) {

            progress.value =
                video.currentTime;
        }

        time.textContent =
            formatTime(video.currentTime) +
            " / " +
            formatTime(video.duration);
    }
);

progress.addEventListener(
    "input",
    function() {

        const newTime =
            Number(progress.value);

        video.currentTime =
            newTime;

        audio.currentTime =
            newTime;
    }
);


/* =========================================================
   VOLUMEN
   ========================================================= */

volume.addEventListener(
    "input",
    function() {

        const value =
            Number(volume.value);

        video.volume =
            value;

        audio.volume =
            value;

        if (value === 0) {

            muteBtn.textContent =
                "🔇";

        } else {

            muteBtn.textContent =
                "🔊";
        }
    }
);

muteBtn.addEventListener(
    "click",
    function() {

        if (video.volume > 0) {

            video.dataset.previousVolume =
                video.volume;

            audio.dataset.previousVolume =
                audio.volume;

            video.volume = 0;
            audio.volume = 0;

            volume.value = 0;

            muteBtn.textContent =
                "🔇";

        } else {

            const previousVolume =
                Number(
                    video.dataset.previousVolume ||
                    1
                );

            video.volume =
                previousVolume;

            audio.volume =
                previousVolume;

            volume.value =
                previousVolume;

            muteBtn.textContent =
                "🔊";
        }

        showControls();
    }
);


/* =========================================================
   VELOCIDAD
   ========================================================= */

function setPlaybackSpeed(speed) {

    currentSpeed =
        parseFloat(speed);

    video.playbackRate =
        currentSpeed;

    audio.playbackRate =
        currentSpeed;

    speedButtons.forEach(
        function(button) {

            const buttonSpeed =
                parseFloat(
                    button.dataset.speed
                );

            if (
                buttonSpeed ===
                currentSpeed
            ) {

                button.classList.add(
                    "active"
                );

            } else {

                button.classList.remove(
                    "active"
                );
            }
        }
    );
}

speedButtons.forEach(
    function(button) {

        button.addEventListener(
            "click",
            function() {

                setPlaybackSpeed(
                    button.dataset.speed
                );

                settings.classList.remove(
                    "open"
                );

                showControls();
            }
        );
    }
);


/* =========================================================
   MENÚ CONFIGURACIÓN
   ========================================================= */

settingsBtn.addEventListener(
    "click",
    function(event) {

        event.stopPropagation();

        settings.classList.toggle(
            "open"
        );

        player.classList.add(
            "controls-visible"
        );

        clearTimeout(
            hideControlsTimer
        );
    }
);

settingsMenu.addEventListener(
    "click",
    function(event) {

        event.stopPropagation();
    }
);

document.addEventListener(
    "click",
    function() {

        settings.classList.remove(
            "open"
        );

        showControls();
    }
);


/* =========================================================
   AUDIO HLS
   ========================================================= */

function loadAudio() {

    if (audioHls) {

        audioHls.destroy();

        audioHls = null;
    }

    audio.pause();

    /*
     * Si el navegador soporta HLS
     * directamente
     */

    if (
        audio.canPlayType(
            "application/vnd.apple.mpegurl"
        )
    ) {

        audio.src =
            AUDIO_URL;

        audio.addEventListener(
            "loadedmetadata",
            function() {

                audio.currentTime =
                    video.currentTime;

                audio.playbackRate =
                    currentSpeed;

            },
            {
                once: true
            }
        );

        return;
    }


    /*
     * HLS.js
     */

    if (
        window.Hls &&
        Hls.isSupported()
    ) {

        audioHls =
            new Hls();

        audioHls.loadSource(
            AUDIO_URL
        );

        audioHls.attachMedia(
            audio
        );

        audioHls.on(
            Hls.Events.MANIFEST_PARSED,
            function() {

                audio.currentTime =
                    video.currentTime;

                audio.playbackRate =
                    currentSpeed;
            }
        );
    }
}


/* =========================================================
   VIDEO HLS
   ========================================================= */

function loadVideo() {

    if (
        window.Hls &&
        Hls.isSupported()
    ) {

        videoHls =
            new Hls();

        videoHls.loadSource(
            VIDEO_URL
        );

        videoHls.attachMedia(
            video
        );

    } else if (
        video.canPlayType(
            "application/vnd.apple.mpegurl"
        )
    ) {

        video.src =
            VIDEO_URL;

    } else {

        console.error(
            "Este navegador no soporta HLS."
        );
    }
}


/* =========================================================
   SUBTÍTULOS
   ========================================================= */

function setupSubtitles() {

    if (!SUBTITLE_URL) {
        return;
    }

    const track =
        document.createElement(
            "track"
        );

    track.kind =
        "subtitles";

    track.label =
        "Español";

    track.srclang =
        "es";

    track.src =
        SUBTITLE_URL;

    track.default =
        false;

    video.appendChild(
        track
    );
}

subtitleSelect.addEventListener(
    "change",
    function() {

        const tracks =
            video.textTracks;

        for (
            let i = 0;
            i < tracks.length;
            i++
        ) {

            tracks[i].mode =
                "disabled";
        }

        const selected =
            Number(
                subtitleSelect.value
            );

        if (
            selected >= 0 &&
            tracks[selected]
        ) {

            tracks[selected].mode =
                "showing";
        }

        showControls();
    }
);


/* =========================================================
   CAMBIO DE AUDIO
   ========================================================= */

audioSelect.addEventListener(
    "change",
    function() {

        const selected =
            audioSelect.value;

        /*
         * Actualmente solamente hay
         * una pista de audio.
         *
         * Aquí queda preparado para
         * agregar más pistas.
         */

        if (selected === "0") {

            const currentTime =
                video.currentTime;

            const wasPlaying =
                !video.paused;

            loadAudio();

            audio.addEventListener(
                "loadedmetadata",
                function() {

                    audio.currentTime =
                        currentTime;

                    audio.playbackRate =
                        currentSpeed;

                    if (wasPlaying) {

                        audio.play().catch(
                            function() {}
                        );
                    }

                },
                {
                    once: true
                }
            );
        }

        showControls();
    }
);


/* =========================================================
   PANTALLA COMPLETA
   ========================================================= */

async function enterFullscreen() {

    try {

        if (
            player.requestFullscreen
        ) {

            await player.requestFullscreen();

        } else if (
            player.webkitRequestFullscreen
        ) {

            player.webkitRequestFullscreen();
        }

        /*
         * Intentar poner el teléfono
         * horizontal.
         */

        if (
            screen.orientation &&
            screen.orientation.lock
        ) {

            try {

                await screen.orientation.lock(
                    "landscape"
                );

            } catch (error) {

                console.log(
                    "El navegador no permite bloquear la orientación."
                );
            }
        }

    } catch (error) {

        console.error(
            "No se pudo activar pantalla completa:",
            error
        );
    }
}


async function exitFullscreen() {

    try {

        if (
            document.exitFullscreen
        ) {

            await document.exitFullscreen();

        } else if (
            document.webkitExitFullscreen
        ) {

            document.webkitExitFullscreen();
        }

        if (
            screen.orientation &&
            screen.orientation.unlock
        ) {

            try {
                screen.orientation.unlock();
            } catch (error) {}
        }

    } catch (error) {

        console.error(
            "Error al salir de pantalla completa:",
            error
        );
    }
}


fullscreenBtn.addEventListener(
    "click",
    function() {

        if (
            !document.fullscreenElement &&
            !document.webkitFullscreenElement
        ) {

            enterFullscreen();

        } else {

            exitFullscreen();
        }
    }
);


/* =========================================================
   CAMBIO DE ESTADO FULLSCREEN
   ========================================================= */

document.addEventListener(
    "fullscreenchange",
    function() {

        if (
            !document.fullscreenElement
        ) {

            if (
                screen.orientation &&
                screen.orientation.unlock
            ) {

                try {
                    screen.orientation.unlock();
                } catch (error) {}
            }
        }
    }
);


/* =========================================================
   MOVIMIENTO DEL RATÓN / TÁCTIL
   ========================================================= */

player.addEventListener(
    "mousemove",
    showControls
);

player.addEventListener(
    "touchstart",
    showControls,
    {
        passive: true
    }
);


/* =========================================================
   INICIALIZACIÓN
   ========================================================= */

video.volume = 1;
audio.volume = 1;

volume.value = 1;

setPlaybackSpeed(1);

setupSubtitles();

loadVideo();

loadAudio();

setPlayingState(false);

showControls();
```
