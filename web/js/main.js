import { toggleAudio, setVolume, setActiveCard } from './audio.js';
import { ALL_CONTROLS } from './controls.js';

const gallery = document.getElementById('gallery');
const audioBtn = document.getElementById('audio-btn');

audioBtn.addEventListener('click', () => {
    const playing = toggleAudio();
    audioBtn.textContent = playing ? 'MUTE TEST TONE' : 'PLAY TEST TONE';
    audioBtn.classList.toggle('active', playing);
});

ALL_CONTROLS.forEach(({ name, desc, fn }, idx) => {
    const id = 'card-' + idx;
    const card = document.createElement('div');
    card.className = 'control-card';
    card.dataset.cardId = id;
    card.innerHTML = `<h3>${name}</h3><p class="card-desc">${desc}</p><div class="card-widget"></div>`;
    card.addEventListener('click', () => {
        gallery.querySelectorAll('.control-card').forEach(c => c.classList.remove('active-card'));
        card.classList.add('active-card');
        setActiveCard(id);
        setVolume(0, id);
    }, { capture: true });
    gallery.appendChild(card);
    fn(card.querySelector('.card-widget'), id);
});

// Activate first card by default
setActiveCard('card-0');
