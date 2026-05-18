import { createBat, updateBat, drawBat, killBat, getBatCapsule, BAT_CONFIG, drawBatDebug } from './bat.js';
import {
    createObstacles, updateObstacles, drawObstacles,
    checkObstacleCollision, OBSTACLE_CONFIG, drawObstaclesDebug,
} from './obstacles.js';
import { consumeFlap } from './input.js';

const DEBUG = false;
const STATE = { MENU: 'menu', PLAYING: 'playing', DYING: 'dying', GAME_OVER: 'game_over' };

export function createEngine(ctx, canvas, { onGameOver } = {}) {
    let bat = createBat(canvas.height);
    let obstacles = createObstacles(canvas.width, canvas.height);
    let score = 0;
    let scrollSpeed = OBSTACLE_CONFIG.scrollSpeed;
    let spawnDistance = OBSTACLE_CONFIG.spawnDistance;
    let gapHeight = OBSTACLE_CONFIG.gapHeight;
    let state = STATE.MENU;
    let dyingTimer = 0;
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
        if (state === STATE.DYING || state === STATE.GAME_OVER) return;
        killBat(bat);
        state = STATE.DYING;
        dyingTimer = 0;
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
        if (state === STATE.DYING) {
            dyingTimer += dt;
            if (bat.deathType === 'zoom' && dyingTimer >= 1.2) {
                bat.deathType = 'spin';
                bat.vy = 0;
            }
            updateBat(bat, dt, false);
            if (dyingTimer >= 2.1) {
                state = STATE.GAME_OVER;
                if (onGameOver) onGameOver(score);
            }
            return;
        }
        updateBat(bat, dt, flapped);
        ({ scrollSpeed, spawnDistance, gapHeight } = updateObstacles(
            obstacles, dt, canvas.width, canvas.height,
            scrollSpeed, spawnDistance, gapHeight
        ));
        checkBoundaries();
        updateScore();
        if (checkObstacleCollision(getBatCapsule(bat), obstacles, canvas.height)) {
            endGame();
        }
    }

    function draw() {
        ctx.fillStyle = '#1a1428';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (state === STATE.DYING && bat.deathType === 'zoom') {
            ctx.save();
            ctx.translate(bat.x, bat.y);
            ctx.scale(bat.deathScale, bat.deathScale);
            ctx.translate(-bat.x, -bat.y);
        }

        drawObstacles(ctx, obstacles, canvas.height);
        drawBat(ctx, bat);

        if (state === STATE.DYING && bat.deathType === 'zoom') {
            ctx.restore();
        }

        // HUD
        ctx.fillStyle = '#eee';
        ctx.font = '20px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(String(score), 16, 16);

        if (state === STATE.MENU) {
            drawCenteredText('WINGBEAT', canvas.width / 2, canvas.height / 2 - 20, 36);
            drawCenteredText('Press Space to Start', canvas.width / 2, canvas.height / 2 + 20, 14);
        }
        if (state === STATE.GAME_OVER) {
            drawCenteredText('GAME OVER', canvas.width / 2, canvas.height / 2 - 20, 28);
            drawCenteredText('Press Space to Restart', canvas.width / 2, canvas.height / 2 + 20, 14);
        }

        if (DEBUG) {
            drawObstaclesDebug(ctx, obstacles, canvas.height);
            drawBatDebug(ctx, bat);
        }
    }

    function drawCenteredText(text, x, y, fontSize) {
        ctx.fillStyle = '#eee';
        ctx.font = `${fontSize}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, x, y);
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
        returnToMenu() { state = STATE.MENU; },
    };
}