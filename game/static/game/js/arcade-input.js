const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function initArcadeInput(overlay, hiddenInput) {
    const slots = Array.from(overlay.querySelectorAll('.initial-slot'));
    const upBtns = Array.from(overlay.querySelectorAll('.slot-arrow.up'));
    const downBtns = Array.from(overlay.querySelectorAll('.slot-arrow.down'));

    const letters = ['A', 'A', 'A'];
    let activeSlot = 0;

    function render() {
        slots.forEach((slot, i) => {
            slot.textContent = letters[i];
            slot.classList.toggle('active', i === activeSlot);
        });
        upBtns.forEach((btn, i) => btn.classList.toggle('active', i === activeSlot));
        downBtns.forEach((btn, i) => btn.classList.toggle('active', i === activeSlot));
        hiddenInput.value = letters.join('');
    }

    function cycleLetter(slotIndex, direction) {
        const idx = ALPHABET.indexOf(letters[slotIndex]);
        letters[slotIndex] = ALPHABET[(idx + direction + 26) % 26];
        render();
    }

    function setActive(index) {
        activeSlot = Math.max(0, Math.min(2, index));
        render();
    }

    function onKeydown(e) {
        switch (e.key) {
            case 'ArrowUp':
                e.preventDefault();
                cycleLetter(activeSlot, -1);
                break;
            case 'ArrowDown':
                e.preventDefault();
                cycleLetter(activeSlot, 1);
                break;
            case 'ArrowLeft':
                e.preventDefault();
                setActive(activeSlot - 1);
                break;
            case 'ArrowRight':
                e.preventDefault();
                setActive(activeSlot + 1);
                break;
            case ' ':
                // Prevent game flap from firing while overlay is open
                e.preventDefault();
                break;
            default:
                // Typing a letter fills the slot and advances
                if (e.key.length === 1 && /^[a-zA-Z]$/.test(e.key)) {
                    letters[activeSlot] = e.key.toUpperCase();
                    setActive(activeSlot + 1);
                }
        }
    }

    slots.forEach((slot, i) => slot.addEventListener('click', () => setActive(i)));
    upBtns.forEach((btn, i) => btn.addEventListener('click', () => cycleLetter(i, -1)));
    downBtns.forEach((btn, i) => btn.addEventListener('click', () => cycleLetter(i, 1)));

    function activate() {
        letters[0] = letters[1] = letters[2] = 'A';
        activeSlot = 0;
        render();
        window.addEventListener('keydown', onKeydown);
    }

    function deactivate() {
        window.removeEventListener('keydown', onKeydown);
    }

    render();
    return { activate, deactivate };
}