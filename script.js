import GameContainer from "./classes/GameBoard.js";
import { CVS } from "./classes/cvs.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

var animationFrame = null;
var startTime;
var winWidth = window.innerWidth;
var winHeight = window.innerHeight;
const gameCont = new GameContainer(canvas);
canvas.addEventListener("pointermove", (e) => {
    var mx = e.offsetX;
    var my = e.offsetY;

    for (let shape of gameCont.shapes) {
        if (gameCont.selected) return;
        shape.isOver = shape.isPointInPath(mx, my);
    }
});
canvas.addEventListener("pointerdown", (e) => {
    console.log("pointerDown");
    var mx = e.offsetX;
    var my = e.offsetY;

    for (let shape of gameCont.shapes) {
        if (shape.isOver) {
            gameCont.selected = shape;
            shape.onMouseDown();
            break;
        }
    }
});
canvas.addEventListener("pointerup", (e) => {
    gameCont.selected = null;
    for (let shape of gameCont.shapes) {
        shape.mouseDown = false;
    }
    for (let shape of gameCont.shapes) {
        if (shape.selected && !shape.isDropped) {
            shape.onMouseUp();
        }
    }
    return;
});
window.addEventListener("keypress", (e) => {
    if (e.key.toLowerCase() == "d" && e.shiftKey) {
        e.preventDefault();
        console.log(CVS.START_DEGUGGER);
        CVS.START_DEGUGGER = !CVS.START_DEGUGGER;
        canvas.style.backgroundColor = CVS.START_DEGUGGER
            ? "hsla(0,50%,75%,0.8)"
            : "transparent";
    }
});

function windowResize() {
    if (winHeight != window.innerHeight || winWidth != window.innerWidth) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gameCont.onResize();
    }
}

function gameLoop() {
    windowResize();

    gameCont.clear();

    if (!startTime) {
        startTime = new Date().getTime();
    }

    var currentTime = new Date().getTime();
    var elapsed = currentTime - startTime;

    try {
        gameCont.draw();

        gameCont.frame++;
        /*  ctx.beginPath();
        ctx.strokeStyle = "rgba(100,100,100,0.5)";
        ctx.font = "20px sans-serif";
        ctx.fillText("mx: " + gameCont.mx, 15, 35);
        ctx.fillText("my: " + gameCont.my, 15, 60);

        ctx.lineWidth = 1;
        var guideX = 0;
        var spacing = 50;
        do {
            ctx.moveTo(guideX, 0);
            ctx.lineTo(guideX, window.innerHeight);
            ctx.stroke();

            ctx.fillStyle = "darkblue";
            ctx.font = 12 + "px sans-serif";
            ctx.fillText(guideX + "px", guideX, 15);
            guideX += spacing;
        } while (guideX < window.innerWidth); */

        animationFrame = window.requestAnimationFrame(gameLoop);
    } catch (err) {
        console.log(err);
        console.log("cancel Error");
        window.cancelAnimationFrame(animationFrame);
        return;
    }
}

gameLoop();
