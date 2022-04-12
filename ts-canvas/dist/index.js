import * as utils from './modules/utils.js';
import { Board } from './scripts/board.js';
import { Sprite } from './scripts/sprite.js';
import { Layer } from './scripts/layer.js';
utils.log("Hello World! 👋", { bold: true });
// update notch on orientation change
window.addEventListener('orientationchange', utils.setNotchCssProperties);
utils.setNotchCssProperties();
// create objects for the game
let board = new Board(document.getElementById("board"));
let layer = new Layer();
let fireball = new Sprite("images/fireball.png", 100, 100, 128, 128);
let turtleshell = new Sprite("images/turtleshell_right.png", 200, 100, 128, 128);
let snake = new Sprite("images/snake_right.png", 400, 100, 128, 128);
console.log("hi");
// animate sprites
fireball.animate(512, 512, -1, { x: 0, y: 0, delay: 100 }, { x: 512, y: 0, delay: 100 }, { x: 1024, y: 0, delay: 100 }, { x: 1536, y: 0, delay: 100 }, { x: 2048, y: 0, delay: 100 }, { x: 2560, y: 0, delay: 100 });
turtleshell.animate(128, 128, 0, { x: 0, y: 0, delay: 500 }, { x: 128, y: 0, delay: 100 }, { x: 256, y: 0, delay: 100 }, { x: 384, y: 0, delay: 100 }, { x: 0, y: 128, delay: 100 }, { x: 128, y: 128, delay: 100 }, { x: 256, y: 128, delay: 100 }, { x: 384, y: 128, delay: 100 }, { x: 0, y: 256, delay: 100 }, { x: 128, y: 256, delay: 100 }, { x: 256, y: 256, delay: 100 }, { x: 384, y: 256, delay: 100 }, { x: 0, y: 384, delay: 100 }, { x: 128, y: 384, delay: 100 }, { x: 256, y: 384, delay: 100 }, { x: 384, y: 384, delay: 100 });
snake.animate(128, 128, 4, { x: 0, y: 0, delay: 500 }, { x: 128, y: 0, delay: 100 }, { x: 256, y: 0, delay: 100 }, { x: 384, y: 0, delay: 100 }, { x: 0, y: 128, delay: 100 }, { x: 128, y: 128, delay: 100 }, { x: 256, y: 128, delay: 100 }, { x: 384, y: 128, delay: 100 }, { x: 0, y: 256, delay: 100 }, { x: 128, y: 256, delay: 100 }, { x: 256, y: 256, delay: 100 }, { x: 384, y: 256, delay: 100 }, { x: 0, y: 384, delay: 100 }, { x: 128, y: 384, delay: 100 }, { x: 256, y: 384, delay: 100 }, { x: 384, y: 384, delay: 100 });
// add sprites to layer
layer.entities.push(fireball);
layer.entities.push(turtleshell);
layer.entities.push(snake);
board.layers.push(layer);
// start the game
let start = performance.now(), previous = start, ticks = 0, FPS = 0;
board.play(() => {
    // do stuff
    //fireball.angle += 0.002;
    // ******* FPS COUNTER *********
    let now = performance.now(), delta = now - previous;
    if (delta >= 1000) {
        previous = now;
        FPS = ticks;
        ticks = 0;
    }
    ticks++;
    if (delta >= 200)
        document.getElementById("fps").innerHTML = FPS.toString();
    // *****************************
});
