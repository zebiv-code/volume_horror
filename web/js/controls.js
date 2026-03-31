// Volume Horror UX — the world's worst volume controls
import { setVolume, getVolume, getActiveCard } from './audio.js';

// Guarded setVolume — only works if this card is active
function sv(v, id) { setVolume(v, id); }

// === 1. RADIO BUTTONS ===
function radioButtons(el, id) {
    el.innerHTML = '<div class="radio-grid"></div>';
    const grid = el.querySelector('.radio-grid');
    for (let i = 0; i <= 100; i++) {
        const btn = document.createElement('button');
        btn.className = 'radio-btn';
        btn.textContent = i;
        btn.addEventListener('click', () => {
            grid.querySelectorAll('.radio-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            sv(i, id);
        });
        grid.appendChild(btn);
    }
}

// === 2. MATH EQUATION ===
function mathEquation(el, id) {
    function newProblem() {
        const a = Math.floor(Math.random() * 50) + 1;
        const b = Math.floor(Math.random() * 50) + 1;
        const ops = ['+', '-', '*'];
        const op = ops[Math.floor(Math.random() * ops.length)];
        const answer = op === '+' ? a+b : op === '-' ? a-b : a*b;
        el.innerHTML = `<p class="math-problem">${a} ${op} ${b} = ?</p>
            <p class="math-hint">Answer sets your volume (0-100)</p>
            <input type="number" id="math-input-${id}" placeholder="???">
            <button id="math-submit-${id}">SUBMIT</button>
            <p id="math-result-${id}"></p>`;
        el.querySelector(`#math-submit-${id}`).addEventListener('click', () => {
            const val = parseInt(el.querySelector(`#math-input-${id}`).value);
            const result = el.querySelector(`#math-result-${id}`);
            if (val === answer) {
                const v = Math.abs(answer) % 101;
                sv(v, id);
                result.textContent = `CORRECT! Volume set to ${v}%`;
                result.style.color = '#4f4';
                setTimeout(newProblem, 2000);
            } else {
                result.textContent = 'WRONG! Try again.';
                result.style.color = '#f44';
            }
        });
    }
    newProblem();
}

// === 3. DICE ROLL ===
function diceRoll(el, id) {
    el.innerHTML = `<div class="dice-area">
        <div class="dice-pair"><div class="dice" data-d="1">?</div><div class="dice" data-d="2">?</div></div>
        <button class="dice-roll-btn">ROLL THE DICE</button>
        <p class="dice-result">Roll to set your volume</p>
    </div>`;
    el.querySelector('.dice-roll-btn').addEventListener('click', () => {
        const d1 = el.querySelector('[data-d="1"]'), d2 = el.querySelector('[data-d="2"]');
        const result = el.querySelector('.dice-result');
        d1.classList.add('rolling'); d2.classList.add('rolling');
        let count = 0;
        const interval = setInterval(() => {
            d1.textContent = Math.floor(Math.random() * 6) + 1;
            d2.textContent = Math.floor(Math.random() * 6) + 1;
            if (++count > 15) {
                clearInterval(interval);
                d1.classList.remove('rolling'); d2.classList.remove('rolling');
                const v = parseInt(d1.textContent + '' + d2.textContent);
                sv(Math.min(v, 100), id);
                result.textContent = `Rolled ${d1.textContent}${d2.textContent} → Volume: ${Math.min(v,100)}%`;
            }
        }, 80);
    });
}

// === 4. RAPID TAPPING ===
function rapidTapping(el, id) {
    el.innerHTML = `<div class="tap-area">
        <button class="tap-btn tap-up">TAP FOR +1%</button>
        <button class="tap-btn tap-down">TAP FOR -1%</button>
        <p>Taps this session: <span class="tap-count">0</span></p>
    </div>`;
    let taps = 0;
    el.querySelector('.tap-up').addEventListener('click', () => {
        taps++; el.querySelector('.tap-count').textContent = taps;
        sv(getVolume() + 1, id);
    });
    el.querySelector('.tap-down').addEventListener('click', () => {
        taps++; el.querySelector('.tap-count').textContent = taps;
        sv(getVolume() - 1, id);
    });
}

// === 5. COLORING GRID ===
function coloringGrid(el, id) {
    el.innerHTML = '<canvas class="color-canvas" width="200" height="200"></canvas><p>Paint cells to set volume</p>';
    const can = el.querySelector('canvas');
    const ctx = can.getContext('2d');
    const grid = 10, cellW = 20, cellH = 20;
    const cells = Array(100).fill(false);

    function draw() {
        ctx.fillStyle = '#222'; ctx.fillRect(0, 0, 200, 200);
        cells.forEach((c, i) => {
            ctx.fillStyle = c ? '#4af' : '#333';
            ctx.fillRect((i%grid)*cellW+1, Math.floor(i/grid)*cellH+1, cellW-2, cellH-2);
        });
    }

    let painting = false;
    can.addEventListener('mousedown', () => painting = true);
    can.addEventListener('mouseup', () => painting = false);
    can.addEventListener('mouseleave', () => painting = false);
    function paint(e) {
        const rect = can.getBoundingClientRect();
        const x = Math.floor((e.clientX-rect.left)/rect.width*grid);
        const y = Math.floor((e.clientY-rect.top)/rect.height*grid);
        const idx = y*grid+x;
        if (idx >= 0 && idx < 100) { cells[idx] = true; sv(cells.filter(c=>c).length, id); draw(); }
    }
    can.addEventListener('mousemove', e => { if (painting) paint(e); });
    can.addEventListener('click', e => {
        const rect = can.getBoundingClientRect();
        const x = Math.floor((e.clientX-rect.left)/rect.width*grid);
        const y = Math.floor((e.clientY-rect.top)/rect.height*grid);
        const idx = y*grid+x;
        if (idx >= 0 && idx < 100) { cells[idx] = !cells[idx]; sv(cells.filter(c=>c).length, id); draw(); }
    });
    draw();
}

// === 6. PROJECTILE LAUNCH ===
function projectileLaunch(el, id) {
    el.innerHTML = '<canvas class="proj-canvas" width="300" height="150"></canvas><p>Hold mouse to charge, release to launch!</p>';
    const can = el.querySelector('canvas');
    const ctx = can.getContext('2d');
    let ball = null, holdStart = 0;

    function draw() {
        ctx.fillStyle = '#111'; ctx.fillRect(0, 0, 300, 150);
        ctx.fillStyle = '#333'; ctx.fillRect(0, 130, 300, 20);
        ctx.fillStyle = '#666'; ctx.font = '9px monospace';
        for (let i = 0; i <= 100; i += 10) {
            const x = i/100*280+10;
            ctx.fillRect(x, 125, 1, 5);
            ctx.fillText(i, x-5, 145);
        }
        ctx.fillStyle = '#f44'; ctx.fillRect(0, 100, 15, 30);
        if (ball) { ctx.fillStyle = '#ff0'; ctx.beginPath(); ctx.arc(ball.x, ball.y, 5, 0, Math.PI*2); ctx.fill(); }
    }

    function animate() {
        if (!ball) return;
        ball.x += ball.vx; ball.y += ball.vy; ball.vy += 0.3;
        if (ball.y >= 125) {
            ball.y = 125;
            sv(Math.round(Math.max(0, Math.min(100, (ball.x-10)/280*100))), id);
            ball = null;
        }
        draw();
        if (ball) requestAnimationFrame(animate);
    }

    can.addEventListener('mousedown', () => { holdStart = Date.now(); });
    can.addEventListener('mouseup', () => {
        const held = Math.min((Date.now()-holdStart)/50, 10);
        ball = { x: 15, y: 110, vx: held, vy: -4-held*0.5 };
        animate();
    });
    draw();
}

// === 7. SNAKE GAME ===
function snakeGame(el, id) {
    el.innerHTML = '<canvas class="snake-canvas" width="200" height="200"></canvas><p>Score = Volume%. Arrow keys to play.</p>';
    const can = el.querySelector('canvas');
    const ctx = can.getContext('2d');
    const sz = 10, cols = 20, rows = 20;
    let snake = [{x:10,y:10}], dir = {x:1,y:0}, food = {x:15,y:10}, score = 0, alive = true;

    function place() { food = {x:Math.floor(Math.random()*cols), y:Math.floor(Math.random()*rows)}; }

    function draw() {
        ctx.fillStyle = '#111'; ctx.fillRect(0, 0, 200, 200);
        ctx.fillStyle = '#4f4';
        for (const s of snake) ctx.fillRect(s.x*sz, s.y*sz, sz-1, sz-1);
        ctx.fillStyle = '#f44'; ctx.fillRect(food.x*sz, food.y*sz, sz-1, sz-1);
        ctx.fillStyle = '#fff'; ctx.font = '12px monospace'; ctx.fillText(`Score: ${score}`, 5, 195);
    }

    function step() {
        if (!alive) return;
        const head = {x:(snake[0].x+dir.x+cols)%cols, y:(snake[0].y+dir.y+rows)%rows};
        if (snake.some(s => s.x===head.x && s.y===head.y)) {
            alive = false; score = 0; snake = [{x:10,y:10}]; dir = {x:1,y:0};
            setTimeout(() => { alive = true; }, 1000);
        }
        snake.unshift(head);
        if (head.x===food.x && head.y===food.y) { score = Math.min(100, score+5); sv(score, id); place(); }
        else snake.pop();
        draw();
    }

    document.addEventListener('keydown', e => {
        if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) {
            e.preventDefault();
            if (e.key === 'ArrowUp' && dir.y !== 1) dir = {x:0,y:-1};
            if (e.key === 'ArrowDown' && dir.y !== -1) dir = {x:0,y:1};
            if (e.key === 'ArrowLeft' && dir.x !== 1) dir = {x:-1,y:0};
            if (e.key === 'ArrowRight' && dir.x !== -1) dir = {x:1,y:0};
        }
    });
    setInterval(step, 120);
    draw();
}

// === 8. PONG ===
function pongGame(el, id) {
    el.innerHTML = '<canvas class="pong-canvas" width="300" height="200"></canvas><p>Your score (left) = Volume%</p>';
    const can = el.querySelector('canvas');
    const ctx = can.getContext('2d');
    let bx=150,by=100,bvx=2,bvy=1.5,paddle=80,aiP=80,score=0;
    const pw=8,ph=40;

    can.addEventListener('mousemove', e => {
        const rect = can.getBoundingClientRect();
        paddle = (e.clientY-rect.top)/rect.height*200-ph/2;
    });

    function step() {
        aiP += (by-aiP-ph/2)*0.06;
        bx += bvx; by += bvy;
        if (by <= 0 || by >= 200) bvy = -bvy;
        if (bx <= pw+5 && by > paddle && by < paddle+ph) bvx = Math.abs(bvx);
        if (bx >= 300-pw-5 && by > aiP && by < aiP+ph) bvx = -Math.abs(bvx);
        if (bx >= 300) { score = Math.min(100, score+10); sv(score, id); bx=150; by=100; }
        if (bx <= 0) { bx=150; by=100; }

        ctx.fillStyle = '#111'; ctx.fillRect(0,0,300,200);
        ctx.fillStyle = '#4f4'; ctx.fillRect(2, paddle, pw, ph);
        ctx.fillStyle = '#f44'; ctx.fillRect(300-pw-2, aiP, pw, ph);
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(bx,by,4,0,Math.PI*2); ctx.fill();
        ctx.font = '14px monospace'; ctx.fillText(score+'%', 130, 15);
        requestAnimationFrame(step);
    }
    step();
}

// === 9. TILT CONTROL ===
function tiltControl(el, id) {
    el.innerHTML = `<div class="tilt-area">
        <div class="tilt-device"><div class="tilt-screen">TILT ME</div></div>
        <p class="tilt-info">Angle: 0° → Volume: 50%</p>
    </div>`;
    const device = el.querySelector('.tilt-device');
    const info = el.querySelector('.tilt-info');
    let dragging = false, startX = 0, angle = 0;
    device.addEventListener('mousedown', e => { dragging = true; startX = e.clientX; });
    document.addEventListener('mouseup', () => dragging = false);
    document.addEventListener('mousemove', e => {
        if (!dragging) return;
        angle = Math.max(-90, Math.min(90, (e.clientX-startX)*0.5));
        device.style.transform = `rotate(${angle}deg)`;
        const v = Math.round((angle+90)/180*100);
        sv(v, id);
        info.textContent = `Angle: ${Math.round(angle)}° → Volume: ${v}%`;
    });
}

// === 10. TYPE IT BACKWARDS ===
function backwardsTyping(el, id) {
    el.innerHTML = `<div class="type-area">
        <p>Type your desired volume <strong>backwards</strong>:</p>
        <input type="text" class="back-input" maxlength="3" placeholder="e.g. 05 for 50%">
        <button class="back-submit">SET</button>
        <p class="back-result"></p>
    </div>`;
    el.querySelector('.back-submit').addEventListener('click', () => {
        const raw = el.querySelector('.back-input').value;
        const reversed = raw.split('').reverse().join('');
        const v = parseInt(reversed);
        const result = el.querySelector('.back-result');
        if (isNaN(v) || v < 0 || v > 100) {
            result.textContent = 'Invalid! Must reverse to 0-100.';
            result.style.color = '#f44';
        } else {
            sv(v, id);
            result.textContent = `"${raw}" reversed = ${v}%. Volume set!`;
            result.style.color = '#4f4';
        }
    });
}

// === 11. CAPTCHA ===
function captchaVolume(el, id) {
    let cvol = 0;
    function render() {
        const a = Math.floor(Math.random()*10), b = Math.floor(Math.random()*10);
        el.innerHTML = `<div class="captcha-area">
            <p>Solve to increase volume by 10%</p>
            <p class="captcha-q">What is ${a} + ${b}?</p>
            <input type="number" class="captcha-input">
            <button class="captcha-submit">VERIFY</button>
            <p>Current: ${cvol}%</p>
        </div>`;
        el.querySelector('.captcha-submit').addEventListener('click', () => {
            if (parseInt(el.querySelector('.captcha-input').value) === a+b) {
                cvol = Math.min(100, cvol+10);
                sv(cvol, id);
            }
            render();
        });
    }
    render();
}

// === 12. WAITING ROOM ===
function waitingRoom(el, id) {
    let wvol = 0, dir = 1, ticket = Math.floor(Math.random()*900)+100;
    el.innerHTML = `<div class="wait-area">
        <p>YOUR TICKET: #${ticket}</p>
        <p>NOW SERVING: #<span class="wait-num">${ticket}</span></p>
        <p>VOLUME: <span class="wait-vol">0</span>%</p>
        <p class="wait-hint">Please wait patiently...</p>
    </div>`;
    setInterval(() => {
        wvol += dir;
        if (wvol > 100) { wvol = 100; dir = -1; }
        if (wvol < 0) { wvol = 0; dir = 1; }
        sv(wvol, id);
        el.querySelector('.wait-vol').textContent = wvol;
        el.querySelector('.wait-num').textContent = ticket + wvol;
    }, 3000);
}

export const ALL_CONTROLS = [
    { name: 'Radio Buttons', desc: '101 individual buttons. Pick wisely.', fn: radioButtons },
    { name: 'Math Equation', desc: 'Solve math to set volume. Answer mod 101.', fn: mathEquation },
    { name: 'Dice Roll', desc: 'Roll dice. Digits concatenated = volume.', fn: diceRoll },
    { name: 'Rapid Tapping', desc: 'Tap +1%. Want 100%? Tap 100 times.', fn: rapidTapping },
    { name: 'Coloring Grid', desc: 'Paint 100 cells. Each cell = 1%.', fn: coloringGrid },
    { name: 'Projectile Launch', desc: 'Hold to charge, release to fire!', fn: projectileLaunch },
    { name: 'Snake Game', desc: 'Play Snake. Score = volume.', fn: snakeGame },
    { name: 'Pong', desc: 'Beat the AI. Your score = volume.', fn: pongGame },
    { name: 'Tilt Control', desc: 'Drag to tilt. Angle = volume.', fn: tiltControl },
    { name: 'Type It Backwards', desc: 'Type your volume number backwards.', fn: backwardsTyping },
    { name: 'CAPTCHA', desc: 'Solve a CAPTCHA per 10% increment.', fn: captchaVolume },
    { name: 'Waiting Room', desc: '+1% every 3 seconds. Please hold.', fn: waitingRoom },
];
