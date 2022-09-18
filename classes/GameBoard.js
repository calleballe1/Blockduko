import { Box, CVS } from "./cvs.js";
import { Grid } from "./Grid.js";
import { Shape } from "./Blocks.js";
const GRID_HEIGHT = 9;
const CELL_COLORS = {
    default: [150, 0, 60, 1],
    filled: [150, 75, 50, 1],
    hover: [150, 0, 75, 1],
    stroke: [200, 80, 90, 1],
};

const STROKE_COLOR = [180, 180, 255];
var curve = (x) => 0.5 * Math.cos(Math.PI * x - Math.PI) + 0.5;
const x = {};

class GameBoard extends Box {
    #grid;
    constructor(canvas, container, x, y, w, h, colors) {
        super(canvas, container, x, y, w, h, colors);
    }
    get grid() {
        return this.#grid;
    }
    set grid(grid) {
        this.#grid = grid;
    }
    onResize() {
        this.grid.x = this.x;
        this.grid.y = this.y;
        this.grid.width = this.width;
        this.grid.height = this.height;
        this.grid.blockSize = this.width / 9;
        this.grid.onResize();
    }
    createGrid() {
        this.grid = new Grid(canvas, this, this.width / 9, CELL_COLORS);
    }
    draw() {
        this.ctx.beginPath();
        this.ctx.strokeStyle = "green";
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(this.x, this.y, this.width, this.height);
        this.ctx.stroke();
        this.grid.draw();
    }
}
class ScoreBoard extends Box {
    _score;
    #fontSize;

    constructor(canvas, container, x, y, width, height, colors) {
        super(canvas, container, x, y, width, height, colors);
        this.#fontSize = 40;
        this.AnimateFont = {
            from: {},
            to: {},
            req: null,
        };
        this._score = 0;
    }
    get score() {
        return this._score;
    }
    get animate() {
        this.startAnimation = true;
        this.animation(500);
    }
    set score(value) {
        this._score = value;
    }
    get fontSize() {
        return this.#fontSize;
    }
    set fontSize(value) {
        this.#fontSize = value;
    }
    onResize() {}

    newScore(value) {
        this.score = this.score + value;
    }

    draw() {
        if (this.startAnimation) {
            this.animation(200);
        }
        this.ctx.beginPath();
        this.ctx.strokeStyle = "hsla(50deg,20%,50%,1)";
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(this.x, this.y, this.width, this.height);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.fillStyle = "hsla(50deg,20%,50%,1)";
        this.ctx.font = this.fontSize + "px sans-serif";
        this.ctx.fillText(
            `Score: ${this.score}`,
            this.x + 5,
            this.y + this.fontSize
        );
        this.ctx.fill();
    }
    animation(time) {
        var change = 10;
        if (this.startTime == null) {
            this.startTime = new Date().getTime();
        }
        let currentTime;
        let elapsed = currentTime - this.startTime;
        let part = time / elapsed;
        let next =
            part <= 0.5
                ? change * curve(part)
                : -1 * (change * curve(time / (elapsed / 2)));
        this.fontSize = this.fontSize + next;
        if (Math.min(1, part) == 1) {
            this.startAnimation = false;
        }
    }
}
class BlockBoard extends Box {
    constructor(canvas, container, x, y, w, h, colors) {
        super(canvas, container, x, y, w, h, colors);
    }
    onResize() {}
    draw() {
        this.ctx.beginPath();
        this.ctx.strokeStyle = "blue";
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(this.x, this.y, this.width, this.height);
        this.ctx.stroke();
    }
}

export default class GameContainer extends Box {
    _scoreBoard;
    _gameBoard;
    _blockBoard;
    #gap;
    #margin = 50;
    constructor(
        canvas,
        x = 0,
        y = 0,
        w = 0,
        h = 0,
        colors = { default: [0, 0, 0, 0] }
    ) {
        super(canvas, null, x, y, w, h, colors);
        CVS.gameContainer = this;
        this.shapes = [];
        this.selected = null;
        this.frame = 0;
        this.#gap = 15;
        this._scoreBoard = new ScoreBoard(
            canvas,
            this,
            0,
            0,
            0,
            0,
            this.colors
        );
        this._gameBoard = new GameBoard(canvas, this, 0, 0, 0, 0, this.colors);
        this._blockBoard = new BlockBoard(
            canvas,
            this,
            0,
            0,
            0,
            0,
            this.colors
        );
        console.log(this.blockBoard);
        this.boardHeight = window.innerHeight - this.#margin * 2;
        this.gameBoard.createGrid();
        this.createShapes();
        window.addEventListener("resize", () => {
            this.boardHeight = window.innerHeight - this.#margin * 2;
        });
    }
    get layout() {
        return window.innerHeight < window.innerWidth ? "H" : "V";
    }
    get gap() {
        return this.#gap;
    }
    get margin() {
        return this.#margin;
    }
    get grid() {
        return this.gameBoard.grid;
    }
    set boardHeight(value) {
        this.height = value;
        this.setBoardLayout(this.layout);
    }
    get scoreBoard() {
        return this._scoreBoard;
    }
    get gameBoard() {
        return this._gameBoard;
    }
    get blockBoard() {
        return this._blockBoard;
    }
    createShapes() {
        var shapeArr = [];
        var canBePlaced = [];
        var box = this.blockBoard.height / 3;
        for (let i = 0; i < 3; i++) {
            var shape = new Shape(
                this.canvas,
                this.blockBoard,
                i,
                this.blockBoard.x,
                this.blockBoard.y,
                this.grid.blockSize * 0.7,
                this.colors
            );
            let x =
                this.blockBoard.x + (this.blockBoard.width - shape.width) / 2;
            let y = this.blockBoard.y + box * i + (box - shape.height) / 2;
            shape.y = y;
            shape.x = x;

            shapeArr[i] = shape;
        }
        this.shapes = shapeArr;
    }
    onResize() {
        this.setBoardLayout(this.layout);
        this.scoreBoard.onResize();
        this.blockBoard.onResize();
        this.shapes.forEach((e) => {
            e.onResize();
        });
        this.gameBoard.onResize();
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    setBoardLayout(layout) {
        if (layout == "H") {
            this.height * (4 / 5);
            this.gameBoard.width = this.height * (4 / 5);
            this.gameBoard.height = this.height * (4 / 5);

            this.blockBoard.width = this.gameBoard.width * (3 / 6);
            this.blockBoard.height = this.gameBoard.height;

            this.scoreBoard.width =
                this.blockBoard.width + this.gameBoard.width + this.gap;
            this.scoreBoard.height = this.height * (1 / 5) - this.gap;
            this.width = this.scoreBoard.width;
        } else {
            this.gameBoard.width = this.height / 2;
            this.gameBoard.height = this.height / 2;

            this.blockBoard.width = this.gameBoard.width;
            this.blockBoard.height = this.gameBoard.width * (2 / 3) - this.gap;

            this.scoreBoard.width = this.gameBoard.width;
            this.scoreBoard.height = this.gameBoard.width * (1 / 3) - this.gap;

            this.width = this.gameBoard.width;
        }
        this.x = window.innerWidth / 2 - this.width / 2;
        this.y = this.margin;
        this.gameBoard.x = this.x;
        this.scoreBoard.x = this.x;
        this.scoreBoard.y = this.y;
        this.gameBoard.y =
            this.scoreBoard.y + this.scoreBoard.height + this.gap;
        if (layout == "H") {
            this.blockBoard.x = this.x + this.gameBoard.width + this.gap;
            this.blockBoard.y = this.gameBoard.y;
        } else {
            this.blockBoard.x = this.x;
            this.blockBoard.y =
                this.gameBoard.y + this.gameBoard.height + this.gap;
        }
        this.clear();
    }

    draw() {
        if (this.shapes.length < 1) {
            this.createShapes();
        }
        this.scoreBoard.draw();
        this.gameBoard.draw();
        this.grid.draw();
        this.blockBoard.draw();
        this.shapes.forEach((e) => {
            e.draw();
        });
    }
}
