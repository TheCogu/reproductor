/* =====================================================
   ELEMENTOS
===================================================== */

const player =
document.getElementById("player");

const video =
document.getElementById("video");

const audio =
document.getElementById("audioPlayer");

const playBtn =
document.getElementById("playBtn");

const centerPlay =
document.getElementById("centerPlay");

const backBtn =
document.getElementById("backBtn");

const forwardBtn =
document.getElementById("forwardBtn");

const progress =
document.getElementById("progress");

const volume =
document.getElementById("volume");

const muteBtn =
document.getElementById("muteBtn");

const audioSelect =
document.getElementById("audioSelect");

const subtitleSelect =
document.getElementById("subtitleSelect");

const settings =
document.getElementById("settings");

const settingsBtn =
document.getElementById("settingsBtn");

const settingsMenu =
document.getElementById("settingsMenu");

const fullscreenBtn =
document.getElementById("fullscreenBtn");

const time =
document.getElementById("time");

const speedButtons =
document.querySelectorAll(
    "#settingsMenu button[data-speed]"
);


let videoHls = null;

let audioHls = null;

let hideControls;

let currentSpeed = 1;


/* =====================================================
   ICONO PLAY / PAUSA
===================================================== */

function setPlayIcon(isPlaying) {

    if (isPlaying) {

        playBtn.classList.remove(
            "play-icon"
        );

        playBtn.classList.add(
            "pause-icon"
        );

        playBtn.setAttribute(
            "aria-label",
            "Pausar"
        );

        playBtn.setAttribute(
            "title",
            "Pausar"
        );

    }

    else {

        playBtn.classList.remove(
            "pause-icon"
        );

        playBtn.classList.add(
            "play-icon"
        );

        playBtn.setAttribute(
            "aria-label",
            "Reproducir"
        );

        playBtn.setAttribute(
            "title",
            "Reproducir"
        );
    }
}


/* =====================================================
   ESTADO DEL REPRODUCTOR
===================================================== */

function setPlayingState(
    isPlaying
) {

    setPlayIcon(
        isPlaying
    );


    if (isPlaying) {

        player.classList.remove(
            "paused"
        );

    }

    else {

        player.classList.add(
            "paused"
        );
    }
}


/* =====================================================
   VELOCIDAD
===================================================== */

function setPlaybackSpeed(
    speed
) {

    currentSpeed =
    parseFloat(speed);


    /* Video */

    video.playbackRate =
    currentSpeed;


    /* Audio separado */

    audio.playbackRate =
    currentSpeed;


    /* Marcar velocidad */

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

            }

            else {

                button.classList.remove(
                    "active"
                );
            }

        }
    );
}


/* =====================================================
   MENÚ CONFIGURACIÓN
===================================================== */

settingsBtn.addEventListener(
    "click",
    function(event) {

        event.preventDefault();

        event.stopPropagation();


        settings.classList.toggle(
            "open"
        );


        player.classList.add(
            "show-controls"
        );


        if (!video.paused) {

            startControlsTimer();
        }
    }
);


/* =====================================================
   VELOCIDADES
===================================================== */

speedButtons.forEach(
    function(button) {

        button.addEventListener(
            "click",
            function(event) {

                event.preventDefault();

                event.stopPropagation();


                const speed =
                parseFloat(
                    this.dataset.speed
                );


                setPlaybackSpeed(
                    speed
                );


                settings.classList.remove(
                    "open"
                );


                player.classList.add(
                    "show-controls"
                );


                if (!video.paused) {

                    startControlsTimer();
                }
            }
        );
    }
);


/* =====================================================
   CARGAR VIDEO
===================================================== */

function loadVideo() {

    if (Hls.isSupported()) {

        videoHls =
        new Hls({

            enableWorker: true,

            lowLatencyMode: false

        });


        videoHls.loadSource(
            VIDEO_URL
        );


        videoHls.attachMedia(
            video
        );


        videoHls.on(
            Hls.Events.ERROR,
            function(event, data) {

                console.error(
                    "Error HLS video:",
                    data
                );

            }
        );

    }

    else if (
        video.canPlayType(
            "application/vnd.apple.mpegurl"
        )
    ) {

        video.src =
        VIDEO_URL;
    }
}


/* =====================================================
   CARGAR AUDIO
===================================================== */

function loadAudio(
    index,
    startTime = 0
) {

    const track =
    AUDIO_TRACKS[index];


    const wasPlaying =
    !video.paused;


    if (audioHls) {

        audioHls.destroy();

        audioHls = null;
    }


    audio.pause();


    if (Hls.isSupported()) {

        audioHls =
        new Hls({

            enableWorker: true,

            lowLatencyMode: false

        });


        audioHls.loadSource(
            track.url
        );


        audioHls.attachMedia(
            audio
        );


        audioHls.on(
            Hls.Events.MANIFEST_PARSED,
            function() {

                /* Mantener velocidad */

                audio.playbackRate =
                currentSpeed;


                setAudioTime(
                    startTime
                );


                if (wasPlaying) {

                    audio
                    .play()
                    .catch(
                        function(){}
                    );
                }

            }
        );

    }

    else if (
        audio.canPlayType(
            "application/vnd.apple.mpegurl"
        )
    ) {

        audio.src =
        track.url;

        audio.load();


        audio.addEventListener(
            "loadedmetadata",
            function() {

                audio.playbackRate =
                currentSpeed;


                setAudioTime(
                    startTime
                );


                if (wasPlaying) {

                    audio
                    .play()
                    .catch(
                        function(){}
                    );
                }

            },
            {
                once: true
            }
        );
    }
}


/* =====================================================
   SINCRONIZAR AUDIO
===================================================== */

function setAudioTime(
    position
) {

    try {

        if (
            isFinite(position) &&
            position >= 0
        ) {

            audio.currentTime =
            position;
        }

    }

    catch(error) {

        console.log(
            "Esperando audio..."
        );
    }
}


/* =====================================================
   REPRODUCIR
===================================================== */

async function playMedia() {

    try {

        setAudioTime(
            video.currentTime
        );


        video.playbackRate =
        currentSpeed;


        audio.playbackRate =
        currentSpeed;


        await video.play();


        await audio.play();


        setPlayingState(
            true
        );


        player.classList.add(
            "show-controls"
        );


        startControlsTimer();

    }

    catch(error) {

        console.error(
            "Error reproduciendo:",
            error
        );
    }
}


/* =====================================================
   PAUSAR
===================================================== */

function pauseMedia() {

    video.pause();

    audio.pause();


    setPlayingState(
        false
    );


    player.classList.add(
        "show-controls"
    );


    clearTimeout(
        hideControls
    );
}


/* =====================================================
   PLAY / PAUSA
===================================================== */

function togglePlay() {

    if (video.paused) {

        playMedia();

    }

    else {

        pauseMedia();
    }
}


/* =====================================================
   BOTÓN PLAY
===================================================== */

playBtn.addEventListener(
    "click",
    function(event) {

        event.preventDefault();

        event.stopPropagation();

        togglePlay();
    }
);


/* =====================================================
   BOTÓN PLAY CENTRAL
===================================================== */

centerPlay.addEventListener(
    "click",
    function(event) {

        event.preventDefault();

        event.stopPropagation();

        togglePlay();
    }
);


/* =====================================================
   RETROCEDER
===================================================== */

backBtn.addEventListener(
    "click",
    function() {

        const newTime =
        Math.max(
            0,
            video.currentTime - 10
        );


        video.currentTime =
        newTime;


        setAudioTime(
            newTime
        );
    }
);


/* =====================================================
   ADELANTAR
===================================================== */

forwardBtn.addEventListener(
    "click",
    function() {

        const newTime =
        Math.min(
            video.duration || Infinity,
            video.currentTime + 10
        );


        video.currentTime =
        newTime;


        setAudioTime(
            newTime
        );
    }
);


/* =====================================================
   ACTUALIZAR TIEMPO
===================================================== */

video.addEventListener(
    "timeupdate",
    function() {

        if (audio.readyState) {

            const difference =
            Math.abs(
                audio.currentTime -
                video.currentTime
            );


            if (
                difference > 0.35
            ) {

                setAudioTime(
                    video.currentTime
                );
            }
        }


        updateProgress();
    }
);


/* =====================================================
   CAMBIAR AUDIO
===================================================== */

audioSelect.addEventListener(
    "change",
    function() {

        const position =
        video.currentTime;


        loadAudio(
            parseInt(
                this.value
            ),
            position
        );
    }
);


/* =====================================================
   PROGRESO
===================================================== */

progress.addEventListener(
    "input",
    function() {

        if (!video.duration)
            return;


        const position =
        (this.value / 100) *
        video.duration;


        video.currentTime =
        position;


        setAudioTime(
            position
        );
    }
);


/* =====================================================
   ACTUALIZAR PROGRESO
===================================================== */

function updateProgress() {

    if (
        !video.duration ||
        !isFinite(video.duration)
    ) {

        return;
    }


    progress.value =
    (video.currentTime /
     video.duration) * 100;


    time.textContent =
    formatTime(
        video.currentTime
    )
    +
    " / "
    +
    formatTime(
        video.duration
    );
}


/* =====================================================
   FORMATO TIEMPO
===================================================== */

function formatTime(
    seconds
) {

    if (!isFinite(seconds))
        return "00:00";


    seconds =
    Math.floor(seconds);


    const minutes =
    Math.floor(
        seconds / 60
    );


    const secs =
    seconds % 60;


    return String(minutes)
    .padStart(2, "0")
    +
    ":"
    +
    String(secs)
    .padStart(2, "0");
}


/* =====================================================
   VOLUMEN
===================================================== */

volume.addEventListener(
    "input",
    function() {

        video.volume =
        this.value;


        audio.volume =
        this.value;


        muteBtn.textContent =
        parseFloat(
            this.value
        ) === 0
        ? "🔇"
        : "🔊";
    }
);


/* =====================================================
   SILENCIO
===================================================== */

muteBtn.addEventListener(
    "click",
    function() {

        if (video.muted) {

            video.muted =
            false;

            audio.muted =
            false;


            muteBtn.textContent =
            "🔊";


            volume.value =
            video.volume;

        }

        else {

            video.muted =
            true;

            audio.muted =
            true;


            muteBtn.textContent =
            "🔇";


            volume.value = 0;
        }
    }
);


/* =====================================================
   SUBTÍTULOS
===================================================== */

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
        parseInt(
            this.value
        );


        if (
            selected >= 0 &&
            tracks[selected]
        ) {

            tracks[selected].mode =
            "showing";
        }
    }
);


/* =====================================================
   PANTALLA COMPLETA
===================================================== */

async function enterFullscreen() {

    try {

        if (
            player.requestFullscreen
        ) {

            await player.requestFullscreen();

        }

        else if (
            player.webkitRequestFullscreen
        ) {

            player.webkitRequestFullscreen();

        }


        /* Intentar girar a horizontal */

        if (
            screen.orientation &&
            screen.orientation.lock
        ) {

            try {

                await screen.orientation.lock(
                    "landscape"
                );

            }

            catch(error) {

                console.log(
                    "Orientación automática no disponible."
                );
            }
        }

    }

    catch(error) {

        console.error(
            "Error pantalla completa:",
            error
        );
    }
}


/* =====================================================
   SALIR FULLSCREEN
===================================================== */

async function exitFullscreen() {

    try {

        if (
            document.exitFullscreen
        ) {

            await document.exitFullscreen();

        }

        else if (
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

            }

            catch(error) {}
        }

    }

    catch(error) {

        console.error(
            "Error saliendo de pantalla completa:",
            error
        );
    }
}


/* =====================================================
   BOTÓN FULLSCREEN
===================================================== */

fullscreenBtn.addEventListener(
    "click",
    function(event) {

        event.preventDefault();

        event.stopPropagation();


        if (
            document.fullscreenElement ||
            document.webkitFullscreenElement
        ) {

            exitFullscreen();

        }

        else {

            enterFullscreen();
        }
    }
);


/* =====================================================
   CAMBIO FULLSCREEN
===================================================== */

document.addEventListener(
    "fullscreenchange",
    function() {

        if (
            document.fullscreenElement
        ) {

            player.classList.add(
                "fullscreen-active"
            );

        }

        else {

            player.classList.remove(
                "fullscreen-active"
            );
        }
    }
);


/* =====================================================
   EVENTO PLAY
===================================================== */

video.addEventListener(
    "play",
    function() {

        setPlayingState(
            true
        );


        video.playbackRate =
        currentSpeed;


        audio.playbackRate =
        currentSpeed;


        setAudioTime(
            video.currentTime
        );


        audio
        .play()
        .catch(
            function(){}
        );


        startControlsTimer();
    }
);


/* =====================================================
   EVENTO PAUSA
===================================================== */

video.addEventListener(
    "pause",
    function() {

        if (!video.ended) {

            audio.pause();
        }


        setPlayingState(
            false
        );


        player.classList.add(
            "show-controls"
        );


        clearTimeout(
            hideControls
        );
    }
);


/* =====================================================
   VIDEO TERMINADO
===================================================== */

video.addEventListener(
    "ended",
    function() {

        audio.pause();


        setPlayingState(
            false
        );


        setAudioTime(
            0
        );


        player.classList.add(
            "show-controls"
        );
    }
);


/* =====================================================
   CONTROLES AUTOMÁTICOS
===================================================== */

function startControlsTimer() {

    clearTimeout(
        hideControls
    );


    hideControls =
    setTimeout(
        function() {

            if (!video.paused) {

                player.classList.remove(
                    "show-controls"
                );


                settings.classList.remove(
                    "open"
                );
            }

        },
        2500
    );
}


/* =====================================================
   MOUSE
===================================================== */

player.addEventListener(
    "mousemove",
    function() {

        player.classList.add(
            "show-controls"
        );


        if (!video.paused) {

            startControlsTimer();
        }
    }
);


/* =====================================================
   TOUCH
===================================================== */

player.addEventListener(
    "touchstart",
    function() {

        player.classList.add(
            "show-controls"
        );


        if (!video.paused) {

            startControlsTimer();
        }

    },
    {
        passive: true
    }
);


/* =====================================================
   CLICK VIDEO
===================================================== */

video.addEventListener(
    "click",
    function() {

        if (video.paused) {

            playMedia();

        }

        else {

            player.classList.add(
                "show-controls"
            );


            startControlsTimer();
        }
    }
);


/* =====================================================
   VELOCIDAD INICIAL
===================================================== */

setPlaybackSpeed(1);


/* =====================================================
   ESTADO INICIAL
===================================================== */

setPlayingState(
    false
);


/* =====================================================
   CARGAR VIDEO Y AUDIO
===================================================== */

loadVideo();

loadAudio(0);
