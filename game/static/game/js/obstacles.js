
// Obstacle.js
export const OBSTACLE_CONFIG = {
    width: 60,
    gapHeight: 280,         // starting gap size (px)
    gapDeceleration: 8,     // gap shrink per second
    minGapHeight: 180,
    spawnDistance: 450,     // starting gap between obstacles (px)
    spawnDeceleration: 7,   // distance decrease per second
    minSpawnDistance: 250,
    scrollSpeed: 180,       // starting speed (px/s)
    scrollAcceleration: 6,  // speed increase per second
    maxScrollSpeed: 420,
    minGapY: 80,
    minGapBottom: 80,
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

// Capsule-vs-rect collision. Returns true if the capsule touches the rect.
export function checkObstacleCollision(capsule, obstacles, canvasHeight) {
    const { ax, ay, bx, by, r } = capsule;
    const { width } = OBSTACLE_CONFIG;
    for (const obs of obstacles) {
        const gapTop    = obs.gapY - obs.gapHeight / 2;
        const gapBottom = obs.gapY + obs.gapHeight / 2;
        if (
            capsuleHitsRect(ax, ay, bx, by, r, obs.x, 0, width, gapTop) ||
            capsuleHitsRect(ax, ay, bx, by, r, obs.x, gapBottom, width, canvasHeight - gapBottom)
        ) {
            return true;
        }
    }
    return false;
}

function capsuleHitsRect(ax, ay, bx, by, r, rx, ry, rw, rh) {
    const r2 = r * r;
    const dx = bx - ax, dy = by - ay;
    const len2 = dx * dx + dy * dy;

    function dist2AtT(t) {
        const px = ax + t * dx;
        const py = ay + t * dy;
        const cx = Math.max(rx, Math.min(px, rx + rw));
        const cy = Math.max(ry, Math.min(py, ry + rh));
        return (px - cx) ** 2 + (py - cy) ** 2;
    }

    // Candidate t values: endpoints, rect boundary crossings, and
    // closest-point-on-segment to each rect corner (covers corner Voronoi regions).
    const candidates = [0, 1];
    if (len2 > 0) {
        if (dx !== 0) { candidates.push((rx - ax) / dx, (rx + rw - ax) / dx); }
        if (dy !== 0) { candidates.push((ry - ay) / dy, (ry + rh - ay) / dy); }
        for (const [cx, cy] of [[rx, ry], [rx + rw, ry], [rx, ry + rh], [rx + rw, ry + rh]]) {
            candidates.push(((cx - ax) * dx + (cy - ay) * dy) / len2);
        }
    }

    for (const t of candidates) {
        if (t >= 0 && t <= 1 && dist2AtT(t) <= r2) return true;
    }
    return false;
}

export function drawObstacles(ctx, obstacles, canvasHeight) {
    const { width } = OBSTACLE_CONFIG;
    ctx.fillStyle = '#3a2a52';
    for (const obs of obstacles) {
        const gapTop = obs.gapY - obs.gapHeight / 2;
        const gapBottom = obs.gapY + obs.gapHeight / 2;
        ctx.fillRect(obs.x, 0, width, gapTop);
        ctx.fillRect(obs.x, gapBottom, width, canvasHeight - gapBottom);
    }
}

export function drawObstaclesDebug(ctx, obstacles, canvasHeight) {
    const { width } = OBSTACLE_CONFIG;
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 1;
    for (const obs of obstacles) {
        const gapTop = obs.gapY - obs.gapHeight / 2;
        const gapBottom = obs.gapY + obs.gapHeight / 2;
        ctx.strokeRect(obs.x, 0, width, gapTop);
        ctx.strokeRect(obs.x, gapBottom, width, canvasHeight - gapBottom);
    }
}
