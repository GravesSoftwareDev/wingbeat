// Input.js
// Tracks input state. Single source of truth for "did the player want to flap?"

const state = {
    flapQueued: false,
};

function queueFlap() {
    state.flapQueued = true;
}

export function initInput(canvas) {
    // Keyboard
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            if (e.repeat) return; // don't queue multiple flaps if key is held down
            queueFlap();
        }
    });
    
    // Mouse / touch on canvas
    canvas.addEventListener('mousedown', queueFlap);
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        queueFlap();
    }, { passive: false });
}


// Called once per frame by the engine. Returns true if a flap is pending.
// and consumes it so it only triggers once.
export function consumeFlap() {
    const overlay = document.getElementById('score-submit-overlay');
    if (overlay && !overlay.hidden) {
        state.flapQueued = false; // drain any queued flaps while overlay is up
        return false;
    }
    if (state.flapQueued) {
        state.flapQueued = false;
        return true;
    }
    return false;
}