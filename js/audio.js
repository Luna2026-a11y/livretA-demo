let audioCtx       = null;
let masterGainNode = null;
let audioActive    = false;
let arpTimer       = null;
let arpIdx         = 0;
let arpTickFn      = null;

function buildAudioEngine() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    masterGainNode = audioCtx.createGain();
    masterGainNode.gain.value = 0;
    masterGainNode.connect(audioCtx.destination);

    const echoDelay    = audioCtx.createDelay(2.0);
    const echoFeedback = audioCtx.createGain();
    const echoOut      = audioCtx.createGain();
    echoDelay.delayTime.value = 0.375;
    echoFeedback.gain.value   = 0.40;
    echoOut.gain.value        = 0.22;
    echoDelay.connect(echoFeedback);
    echoFeedback.connect(echoDelay);
    echoDelay.connect(echoOut);
    echoOut.connect(masterGainNode);

    function makeLFO(freq, amount, target) {
        const lfo  = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        lfo.frequency.value = freq;
        gain.gain.value     = amount;
        lfo.connect(gain);
        gain.connect(target);
        lfo.start();
    }

    // Bass drone — D2 sawtooth avec LFO sur filtre
    const bassFilter = audioCtx.createBiquadFilter();
    bassFilter.type            = 'lowpass';
    bassFilter.frequency.value = 280;
    bassFilter.Q.value         = 4.0;
    bassFilter.connect(masterGainNode);
    makeLFO(0.08, 220, bassFilter.frequency);

    [0, 11].forEach(function (detune) {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.type = 'sawtooth'; o.frequency.value = 73.4; o.detune.value = detune;
        g.gain.value = 0.45;
        o.connect(g); g.connect(bassFilter);
        o.start();
    });

    // Sub-bass — D1 sine pulsant
    const subO    = audioCtx.createOscillator();
    const subGain = audioCtx.createGain();
    subO.type = 'sine'; subO.frequency.value = 36.7;
    subGain.gain.value = 0.28;
    subO.connect(subGain); subGain.connect(masterGainNode);
    makeLFO(0.5, 0.14, subGain.gain);
    subO.start();

    // Pads — accord Dm7
    const padFilter = audioCtx.createBiquadFilter();
    padFilter.type = 'lowpass'; padFilter.frequency.value = 1100; padFilter.Q.value = 0.7;
    padFilter.connect(masterGainNode);
    padFilter.connect(echoDelay);

    [[146.8, 0.10], [174.6, 0.08], [220.0, 0.07], [261.6, 0.06], [293.7, 0.04]].forEach(function (pair) {
        const o1 = audioCtx.createOscillator();
        const o2 = audioCtx.createOscillator();
        const g  = audioCtx.createGain();
        o1.type = 'triangle'; o2.type = 'sine';
        o1.frequency.value = pair[0]; o2.frequency.value = pair[0];
        o1.detune.value = -7; o2.detune.value = 7;
        g.gain.value = pair[1];
        o1.connect(g); o2.connect(g); g.connect(padFilter);
        o1.start(); o2.start();
    });

    // Texture bruit blanc filtré
    const noiseBuf = audioCtx.createBuffer(1, audioCtx.sampleRate * 4, audioCtx.sampleRate);
    const nd = noiseBuf.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    const noiseSrc    = audioCtx.createBufferSource();
    const noiseFilter = audioCtx.createBiquadFilter();
    const noiseGain   = audioCtx.createGain();
    noiseSrc.buffer = noiseBuf; noiseSrc.loop = true;
    noiseFilter.type = 'bandpass'; noiseFilter.frequency.value = 3200; noiseFilter.Q.value = 0.4;
    noiseGain.gain.value = 0.010;
    noiseSrc.connect(noiseFilter); noiseFilter.connect(noiseGain); noiseGain.connect(masterGainNode);
    noiseSrc.start();

    // Arpège Dm7
    const ARP_NOTES = [293.7, 349.2, 440.0, 523.3, 440.0, 349.2, 293.7, 220.0];

    arpTickFn = function () {
        if (!audioActive || !audioCtx) return;
        const freq = ARP_NOTES[arpIdx % ARP_NOTES.length];
        arpIdx++;
        const o = audioCtx.createOscillator();
        const f = audioCtx.createBiquadFilter();
        const g = audioCtx.createGain();
        o.type = 'square'; o.frequency.value = freq;
        f.type = 'lowpass'; f.frequency.value = 1400; f.Q.value = 5;
        const now = audioCtx.currentTime;
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(0.032, now + 0.012);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.20);
        o.connect(f); f.connect(g);
        g.connect(masterGainNode); g.connect(echoDelay);
        o.start(now); o.stop(now + 0.26);
        arpTimer = setTimeout(arpTickFn, 250);
    };

    setTimeout(function () { if (audioActive) arpTickFn(); }, 3000);
}

function toggleAudio() {
    if (!audioCtx) buildAudioEngine();

    audioActive = !audioActive;

    const now = audioCtx.currentTime;
    masterGainNode.gain.cancelScheduledValues(now);
    masterGainNode.gain.setValueAtTime(masterGainNode.gain.value, now);

    if (audioActive) {
        masterGainNode.gain.linearRampToValueAtTime(0.52, now + 2.5);
        setTimeout(function () { if (audioActive) arpTickFn(); }, 3000);
    } else {
        clearTimeout(arpTimer);
        masterGainNode.gain.linearRampToValueAtTime(0, now + 1.5);
    }

    const btn = document.getElementById('btn-audio');
    btn.textContent = audioActive ? '♪ BGM ON' : '♪ BGM OFF';
    btn.classList.toggle('active', audioActive);
    btn.setAttribute('aria-pressed', String(audioActive));
}
