// Create a p5 instance and attach it to the #game-container div
// We use p5 only as a drawing library, enign.js still handles the game loop and state.

const CANVAS_WIDTH = 480;
const CANVAS_HEIGHT = 640;

export function createP5(onReady){
    new p5((p) => {
        p.setup = () => {
            p.pixelDensity(1);
            const canvas = p.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
            canvas.parent('game-container');
            canvas.id('game'); // so input.js can find it
            p.noLoop(); // we drive draws manually from engine.js
            onReady(p, canvas.elt); // canvas.elt is the underlying DOM element
        };
    });
}

export { CANVAS_WIDTH, CANVAS_HEIGHT };