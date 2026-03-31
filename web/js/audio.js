// Audio engine — plays a test tone at the current volume level
let ctx, osc, gain, playing = false;
let currentVolume = 50;
let activeCardId = null;

export function getVolume() { return currentVolume; }

export function setActiveCard(id) { activeCardId = id; }
export function getActiveCard() { return activeCardId; }

export function setVolume(v, cardId) {
    // Only accept volume changes from the active card
    if (cardId !== undefined && cardId !== activeCardId) return;
    currentVolume = Math.max(0, Math.min(100, Math.round(v)));
    if (gain) gain.gain.value = currentVolume / 100 * 0.3;
    document.getElementById('vol-display').textContent = currentVolume + '%';
    document.getElementById('vol-bar').style.width = currentVolume + '%';
}

export function toggleAudio() {
    if (!ctx) {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        osc = ctx.createOscillator();
        gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 440;
        gain.gain.value = currentVolume / 100 * 0.3;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        playing = true;
    } else if (playing) {
        ctx.suspend();
        playing = false;
    } else {
        ctx.resume();
        playing = true;
    }
    return playing;
}
