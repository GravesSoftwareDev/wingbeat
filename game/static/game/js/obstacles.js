
// Obstacle.js
export const OBSTACLE_CONFIG = {
    width: 60,
    gapHeight: 320,         // starting gap size (px)
    gapDeceleration: 8,     // gap shrink per second
    minGapHeight: 140,
    spawnDistance: 450,     // starting gap between obstacles (px)
    spawnDeceleration: 7,   // distance decrease per second
    minSpawnDistance: 250,
    scrollSpeed: 180,       // starting speed (px/s)
    scrollAcceleration: 6,  // speed increase per second
    maxScrollSpeed: 420,
    minGapY: 100,
    minGapBottom: 100,
};

export function createObstacles(canvasWidth, canvasHeight) {
    // Seed one obstacle far enough right to give the player time to react.
    // updateObstacles will queue more as this one approaches.
    return [{
        x: canvasWidth + 200,
        gapY: randomGapY(canvasHeight, OBSTACLE_CONFIG.gapHeight),
        gapHeight: OBSTACLE_CONFIG.gapHeight,
        scored: false,
    }];
}

function randomGapY(canvasHeight, gapHeight) {
    const { minGapY, minGapBottom } = OBSTACLE_CONFIG;
    const min = minGapY + gapHeight / 2;
    const max = canvasHeight - minGapBottom - gapHeight / 2;
    return min + Math.random() * (max - min);
}

// Evolves scrollSpeed, spawnDistance, and gapHeight each frame. Returns all three.
export function updateObstacles(obstacles, dt, canvasWidth, canvasHeight, scrollSpeed, spawnDistance, gapHeight) {
    const {
        width,
        scrollAcceleration, maxScrollSpeed,
        spawnDeceleration, minSpawnDistance,
        gapDeceleration, minGapHeight,
    } = OBSTACLE_CONFIG;

    scrollSpeed   = Math.min(scrollSpeed   + scrollAcceleration * dt, maxScrollSpeed);
    spawnDistance = Math.max(spawnDistance - spawnDeceleration  * dt, minSpawnDistance);
    gapHeight     = Math.max(gapHeight     - gapDeceleration    * dt, minGapHeight);

    for (const obs of obstacles) {
        obs.x -= scrollSpeed * dt;
    }

    // Remove any that have fully scrolled off the left.
    for (let i = obstacles.length - 1; i >= 0; i--) {
        if (obstacles[i].x + width < 0) obstacles.splice(i, 1);
    }

    // Spawn a new obstacle whenever none is queued beyond the right edge.
    const rightmost = obstacles.length
        ? obstacles.reduce((max, o) => (o.x > max ? o.x : max), -Infinity)
        : canvasWidth;
    if (rightmost < canvasWidth + spawnDistance) {
        obstacles.push({
            x: rightmost + spawnDistance,
            gapY: randomGapY(canvasHeight, gapHeight),
            gapHeight,
            scored: false,
        });
    }

    return { scrollSpeed, spawnDistance, gapHeight };
}

// Circle-vs-rect collision. Returns true if bat (circle) touches any obstacle.
export function checkObstacleCollision(bat, obstacles, batRadius, canvasHeight) {
    const { width } = OBSTACLE_CONFIG;
    for (const obs of obstacles) {
        const gapTop    = obs.gapY - obs.gapHeight / 2;
        const gapBottom = obs.gapY + obs.gapHeight / 2;
        if (
            circleHitsRect(bat.x, bat.y, batRadius, obs.x, 0, width, gapTop) ||
            circleHitsRect(bat.x, bat.y, batRadius, obs.x, gapBottom, width, canvasHeight - gapBottom)
        ) {
            return true;
        }
    }
    return false;
}

function circleHitsRect(cx, cy, r, rx, ry, rw, rh) {
    // Find the closest point on the rectangle to the circle center.
    // Then check if that point is within radius.
    const closestX = Math.max(rx, Math.min(cx, rx + rw));
    const closestY = Math.max(ry, Math.min(cy, ry + rh));
    const dx = cx - closestX;
    const dy = cy - closestY;
    return dx * dx + dy * dy < r * r;
}

export function drawObstacles(p, obstacles, canvasHeight) {
    const { width } = OBSTACLE_CONFIG;
    p.noStroke();
    p.fill('#3a2a52');
    for (const obs of obstacles) {
        const gapTop = obs.gapY - obs.gapHeight / 2;
        const gapBottom = obs.gapY + obs.gapHeight / 2;
        p.rect(obs.x, 0, width, gapTop);
        p.rect(obs.x, gapBottom, width, canvasHeight - gapBottom);
    }
}

export function drawObstaclesDebug(p, obstacles, canvasHeight) {
    const { width } = OBSTACLE_CONFIG;
    p.noFill();
    p.stroke('#00ff00');
    p.strokeWeight(1);
    for (const obs of obstacles) {
        const gapTop = obs.gapY - obs.gapHeight / 2;
        const gapBottom = obs.gapY + obs.gapHeight / 2;
        p.rect(obs.x, 0, width, gapTop);
        p.rect(obs.x, gapBottom, width, canvasHeight - gapBottom);
    }
}
