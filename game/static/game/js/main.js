import { createEngine } from './engine.js';
import { initInput } from './input.js';
import { initArcadeInput } from './arcade-input.js';
import { loadBatSprite, loadDeadBatSprite } from './bat.js';

const container = document.getElementById('game-container');
if (container.dataset.batSprite) loadBatSprite(container.dataset.batSprite);
if (container.dataset.deadBatSprite) loadDeadBatSprite(container.dataset.deadBatSprite);

const canvas = document.createElement('canvas');
canvas.id = 'game';
canvas.width = 640;
canvas.height = 600;
document.getElementById('game-container').prepend(canvas);

const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

const overlay = document.getElementById('score-submit-overlay');
const finalScoreEl = document.getElementById('final-score');
const scoreInput = document.getElementById('score-input');
const hiddenInitials = document.getElementById('player-initials-hidden');

const arcadeInput = initArcadeInput(overlay, hiddenInitials);

document.getElementById('score-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const csrfToken = e.target.querySelector('[name=csrfmiddlewaretoken]').value;
    try {
        const response = await fetch('/scores/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-CSRFToken': csrfToken,
            },
            body: new URLSearchParams({
                score: scoreInput.value,
                player_initials: hiddenInitials.value,
            }),
        });
        const html = await response.text();
        document.getElementById('leaderboard').innerHTML = html;
    } catch (_) {
        // score didn't save, that's ok — game continues
    } finally {
        arcadeInput.deactivate();
        overlay.setAttribute('hidden', '');
    }
});

initInput(canvas);

const engine = createEngine(ctx, canvas, {
    onGameOver(score) {
        finalScoreEl.textContent = score;
        scoreInput.value = score;
        arcadeInput.activate();
        overlay.removeAttribute('hidden');
    },
});

engine.start();

document.getElementById('close-overlay').addEventListener('click', () => {
    arcadeInput.deactivate();
    overlay.setAttribute('hidden', '');
    engine.returnToMenu();
});