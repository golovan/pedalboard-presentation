'use strict'

var waveform = waveform || !function() {
    var audioContext = new window.AudioContext(),
        analyserNode = audioContext.createAnalyser(),
        processSound,
        error;

    processSound = function(stream) {
        var bufferLength,
            dataArray,
            drawWave,
            toggleAudioSource,
            oscillatorNode,
            liveAudio = true,
            svg = document.createElementNS("http://www.w3.org/2000/svg", "svg"),
            wave = document.createElementNS("http://www.w3.org/2000/svg", 'path'),
            audioSource = audioContext.createMediaStreamSource(stream);
            audioSource.connect(analyserNode);
            // analyserNode.connect(audioContext.destination);

            analyserNode.fftSize = 128;

            bufferLength = analyserNode.frequencyBinCount;

            dataArray = new Uint8Array(bufferLength);

            wave.setAttribute('class', 'waveform__path');

            svg.setAttribute('width', window.innerWidth);
            svg.setAttribute('height', 400);
            svg.setAttribute('class', 'waveform__svg');
            svg.appendChild(wave);

            document.querySelector('.js-waveform').appendChild(svg);

            drawWave = function() {
                var p = 'M';

                analyserNode.getByteTimeDomainData(dataArray);

                dataArray.forEach(function(point, i) {
                    p +=  (((window.innerWidth + (window.innerWidth / bufferLength))/ bufferLength) * i) + ' ' + (200 * (point / 128.0)) + ', ';
                });

                wave.setAttribute('d', p);

                window.requestAnimationFrame(drawWave);
            };

            toggleAudioSource = function() {
                if (liveAudio) {
                    audioSource.disconnect();

                    oscillatorNode = audioContext.createOscillator();
                    oscillatorNode.type = 'sine';
                    oscillatorNode.frequency.value = 800;
                    oscillatorNode.connect(analyserNode);
                    oscillatorNode.start();
                } else {
                    oscillatorNode.stop();
                    oscillatorNode.disconnect();

                    audioSource.connect(analyserNode);
                }

                liveAudio = !liveAudio;
            };

            window.addEventListener('keydown', function(e) {
                if (e.keyCode === 65) {
                    toggleAudioSource();
                }
            });

            window.requestAnimationFrame(drawWave);
    };

    error = function(e) {
        console.error('Something went wrong while accessing the userMedia', e);
    };

    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    navigator.getUserMedia({
        audio: true
    }, processSound, error);
}();
