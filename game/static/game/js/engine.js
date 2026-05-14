import { createBat, updateBat, drawBat, BAT_CONFIG, drawBatDebug } from './bat.js';
import {
    createObstacles, updateObstacles, drawObstacles,
    checkObstacleCollision, OBSTACLE_CONFIG, drawObstaclesDebug,
} from './obstacles.js';
import { consumeFlap } from './input.js';

const DEBUG = false;
const STATE = { MENU: 'menu', PLAYING: 'playing', GAME_OVER: 'game_over' };

export function createEngine(p, canvas, { onGameOver } = {}) {
    let bat = createBat(canvas.height);
    let obstacles = createObstacles(canvas.width, canvas.height);
    let score = 0;
    let scrollSpeed = OBSTACLE_CONFIG.scrollSpeed;
    let spawnDistance = OBSTACLE_CONFIG.spawnDistance;
    let gapHeight = OBSTACLE_CONFIG.gapHeight;
    let state = STATE.MENU;
    let lastTime = performance.now();
    let running = false;

    function reset() {
        bat = createBat(canvas.height);
        obstacles = createObstacles(canvas.width, canvas.height);
        score = 0;
        scrollSpeed = OBSTACLE_CONFIG.scrollSpeed;
        spawnDistance = OBSTACLE_CONFIG.spawnDistance;
        gapHeight = OBSTACLE_CONFIG.gapHeight;
        state = STATE.PLAYING;
        document.getElementById('score-submit-overlay')?.setAttribute('hidden', '');
    }

    function endGame() {
        if (state === STATE.GAME_OVER) return;
        state = STATE.GAME_OVER;
        if (onGameOver) onGameOver(score);
    }

    function checkBoundaries() {
        if (bat.y + BAT_CONFIG.radius > canvas.height) {
            bat.y = canvas.height - BAT_CONFIG.radius;
            endGame();
        }
        if (bat.y - BAT_CONFIG.radius <= 0) {
            bat.y = BAT_CONFIG.radius;
            if (bat.vy < 0) bat.vy = 0;
        }
    }

    function updateScore() {
        for (const obs of obstacles) {
            if (!obs.scored && obs.x + OBSTACLE_CONFIG.width < bat.x) {
                obs.scored = true;
                score++;
            }
        }
    }

    function update(dt) {
        const flapped = consumeFlap();
        if (state === STATE.MENU || state === STATE.GAME_OVER) {
            if (flapped) reset();
            return;
        }
        updateBat(bat, dt, flapped);
        ({ scrollSpeed, spawnDistance, gapHeight } = updateObstacles(
            obstacles, dt, canvas.width, canvas.height,
            scrollSpeed, spawnDistance, gapHeight
        ));
        checkBoundaries();
        updateScore();
        if (checkObstacleCollision(bat, obstacles, BAT_CONFIG.radius, canvas.height)) {
            endGame();
        }
    }

    function draw() {
        p.background('#1a1428');

        drawObstacles(p, obstacles, canvas.height);
        drawBat(p, bat);

        // HUD
        p.fill('#eee');
        p.noStroke();
        p.textSize(20);
        p.textAlign(p.LEFT, p.TOP);
        p.text(String(score), 16, 16);

        if (state === STATE.MENU) {
            drawCenteredText('WINGBEAT', canvas.width / 2, canvas.height / 2 - 20, 36);
            drawCenteredText('Press Space to Start', canvas.width / 2, canvas.height / 2 + 20, 14);
        }
        if (state === STATE.GAME_OVER) {
            drawCenteredText('GAME OVER', canvas.width / 2, canvas.height / 2 - 20, 28);
            drawCenteredText('Press Space to Restart', canvas.width / 2, canvas.height / 2 + 20, 14);
        }

        if (DEBUG) {
            drawObstaclesDebug(p, obstacles, canvas.height);
            drawBatDebug(p, bat);
        }
    }

    function drawCenteredText(text, x, y, fontSize) {
        p.fill('#eee');
        p.noStroke();
        p.textSize(fontSize);
        p.textAlign(p.CENTER, p.CENTER);
        p.text(text, x, y);
    }

    function loop(now) {
        if (!running) return;
        let dt = (now - lastTime) / 1000;
        if (dt > 0.05) dt = 0.05;
        lastTime = now;
        update(dt);
        draw();
        requestAnimationFrame(loop);
    }

    return {
        start() {
            running = true;
            lastTime = performance.now();
            requestAnimationFrame(loop);
        },
        stop() { running = false; },
    };
}