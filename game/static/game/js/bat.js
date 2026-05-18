const FRAME_COUNT = 7;
const FRAME_SIZE = 40;
const DISPLAY_SCALE = 2;
const ANIM_SPEED_SNAP   = 0.03; // frame 0 — quick snap on flap
const ANIM_SPEED_SMOOTH = 0.05; // remaining frames — smooth follow-through
const GLIDE_FRAME = 5;          // 0-indexed — 2nd from last frame
const DEATH_SCALE_RATE = 1;   // scene zoom units per second during death
const SPIN_SPEED = 5;           // radians per second during spin phase
const DEAD_FRAME_COUNT = 2;
const DEAD_ANIM_SPEED = 0.1;    // seconds per dead frame

let batSprite = null;
let deadBatSprite = null;

export function loadBatSprite(url) {
    batSprite = new Image();
    batSprite.src = url;
}

export function loadDeadBatSprite(url) {
    deadBatSprite = new Image();
    deadBatSprite.src = url;
}

export const BAT_CONFIG = {
    gravity: 1400,
    flapImpulse: -375,
    maxFallSpeed: 500,
    radius: 12,          // used for ceiling/floor boundary checks
    capsuleHalfLen: 18,  // half-length of the pill along the facing axis
    capsuleRadius: 10,   // thickness of the pill
    startX: 120,
};

export function createBat(canvasHeight) {
    return {
        x: BAT_CONFIG.startX,
        y: canvasHeight / 2,
        vy: 0,
        animFrame: GLIDE_FRAME,
        animTimer: 0,
        isFlapping: false,
        dead: false,
        deathType: 'zoom',
        deathScale: 1,
        spinAngle: 0,
        deadAnimFrame: 0,
        deadAnimTimer: 0,
    };
}

export function killBat(bat) {
    bat.dead = true;
    bat.isFlapping = false;
    bat.deathType = 'zoom';
    bat.deathScale = 1;
    bat.spinAngle = 0;
    bat.deadAnimFrame = 0;
    bat.deadAnimTimer = 0;
}

// Returns the two capsule endpoints and radius for the current bat state.
export function getBatCapsule(bat) {
    const angle = Math.atan2(bat.vy, 600);
    const { capsuleHalfLen: hl, capsuleRadius: r } = BAT_CONFIG;
    const cos = Math.cos(angle), sin = Math.sin(angle);
    return {
        ax: bat.x - hl * cos, ay: bat.y - hl * sin,
        bx: bat.x + hl * cos, by: bat.y + hl * sin,
        r,
    };
}

export function updateBat(bat, dt, flapped) {
    if (bat.dead) {
        bat.deadAnimTimer += dt;
        if (bat.deadAnimTimer >= DEAD_ANIM_SPEED) {
            bat.deadAnimTimer -= DEAD_ANIM_SPEED;
            bat.deadAnimFrame = (bat.deadAnimFrame + 1) % DEAD_FRAME_COUNT;
        }
        if (bat.deathType === 'spin') {
            bat.vy += BAT_CONFIG.gravity * dt;
            if (bat.vy > BAT_CONFIG.maxFallSpeed) bat.vy = BAT_CONFIG.maxFallSpeed;
            bat.y += bat.vy * dt;
            bat.spinAngle += SPIN_SPEED * dt;
        } else {
            bat.deathScale += DEATH_SCALE_RATE * dt;
        }
        return;
    }

    if (flapped) {
        bat.vy = BAT_CONFIG.flapImpulse;
        bat.isFlapping = true;
        bat.animFrame = 0;
        bat.animTimer = 0;
    }

    bat.vy += BAT_CONFIG.gravity * dt;
    if (bat.vy > BAT_CONFIG.maxFallSpeed) bat.vy = BAT_CONFIG.maxFallSpeed;
    bat.y += bat.vy * dt;

    if (bat.isFlapping) {
        const frameSpeed = bat.animFrame === 0 ? ANIM_SPEED_SNAP : ANIM_SPEED_SMOOTH;
        bat.animTimer += dt;
        if (bat.animTimer >= frameSpeed) {
            bat.animTimer -= frameSpeed;
            bat.animFrame++;
            if (bat.animFrame >= FRAME_COUNT) {
                bat.animFrame = GLIDE_FRAME;
                bat.isFlapping = false;
            }
        }
    }
}

export function drawBat(ctx, bat) {
    const dSize = FRAME_SIZE * DISPLAY_SCALE;

    ctx.save();
    ctx.translate(bat.x, bat.y);

    if (bat.dead) {
        if (bat.deathType === 'spin') ctx.rotate(bat.spinAngle);
        if (deadBatSprite && deadBatSprite.complete && deadBatSprite.naturalWidth > 0) {
            ctx.drawImage(
                deadBatSprite,
                bat.deadAnimFrame * FRAME_SIZE, 0, FRAME_SIZE, FRAME_SIZE,
                -dSize / 2, -dSize / 2, dSize, dSize
            );
        }
    } else {
        ctx.rotate(Math.atan2(bat.vy, 600));
        ctx.shadowColor = '#cc88ff';
        ctx.shadowBlur = 18;
        if (batSprite && batSprite.complete && batSprite.naturalWidth > 0) {
            ctx.drawImage(
                batSprite,
                bat.animFrame * FRAME_SIZE, 0, FRAME_SIZE, FRAME_SIZE,
                -dSize / 2, -dSize / 2, dSize, dSize
            );
        } else {
            ctx.fillStyle = '#9000ff';
            ctx.beginPath();
            ctx.arc(0, 0, BAT_CONFIG.radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    ctx.restore();
}

export function drawBatDebug(ctx, bat) {
    const { ax, ay, bx, by, r } = getBatCapsule(bat);
    const angle = Math.atan2(by - ay, bx - ax);

    ctx.strokeStyle = '#ff00ff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(ax, ay, r, angle + Math.PI / 2, angle - Math.PI / 2);
    ctx.arc(bx, by, r, angle - Math.PI / 2, angle + Math.PI / 2);
    ctx.closePath();
    ctx.stroke();
}
