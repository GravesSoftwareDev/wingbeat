export const BAT_CONFIG = {
    gravity: 1400,
    flapImpulse: -375,
    maxFallSpeed: 500,
    radius: 14,
    startX: 120,
};

export function createBat(canvasHeight) {
    return { x: BAT_CONFIG.startX, y: canvasHeight / 2, vy: 0 };
}

export function updateBat(bat, dt, flapped) {
    if (flapped) bat.vy = BAT_CONFIG.flapImpulse;
    bat.vy += BAT_CONFIG.gravity * dt;
    if (bat.vy > BAT_CONFIG.maxFallSpeed) bat.vy = BAT_CONFIG.maxFallSpeed;
    bat.y += bat.vy * dt;
}

export function drawBat(p, bat) {
    p.noStroke();
    p.fill('#9000ff');
    p.circle(bat.x, bat.y, BAT_CONFIG.radius * 2);  // p5 takes diameter, not radius

    p.fill(255);
    p.circle(bat.x + 4, bat.y - 4, 6);
}

export function drawBatDebug(p, bat) {
    p.noFill();
    p.stroke('#ff00ff');
    p.strokeWeight(1);
    p.circle(bat.x, bat.y, BAT_CONFIG.radius * 2);
}