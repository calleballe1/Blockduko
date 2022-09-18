import { Box, CVS, RelBox } from "./cvs.js";
import { Square } from "./Grid.js";
import GameContainer from "./GameBoard.js";
function curve(x, pow = 1) {
    let ease = 0.5 * Math.cos(Math.PI * Math.pow(x, pow) - Math.PI) + 0.5;
    let easeIn = Math.pow(-1 * Math.pow(x - 1, 2) + 1, pow);
    let easeOut = Math.pow(Math.pow(x, 2), pow);
}
const BLOCK_COLORS = {
    default: [150, 75, 50, 1],
    hover: [150, 75, 75, 1],
    filled: [150, 75, 50, 1],
    stroke: [0, 0, 0, 0],
};
const BLOCK_SIZE = 20;
const BLOCK_CONFIG = [
    [[1, 1, 1, 1]],
    [
        [1, 1],
        [1, 1],
    ],
    [
        [1, 1, 0],
        [0, 1, 1],
    ],
];
const BLOCK_CONFIG2 = [
    [
        [0, 0],
        [1, -1],
        [1, 0],
        [1, 1],
        [2, 0],
    ],
    [
        [0, 0],
        [1, 0],
        [2, 0],
        [3, 0],
    ],
    [
        [0, 0],
        [0, 1],
        [0, 2],
    ],
    [
        [0, 0],
        [1, 0],
        [2, 0],
    ],
    [
        [0, 0],
        [1, 1],
    ],
    [
        [0, 0],
        [0, 1],
        [0, 2],
        [0, 3],
    ],
    [
        [0, 0],
        [0, 1],
        [1, 0],
        [1, 1],
    ],
    [
        [0, 0],
        [0, 1],
        [1, 1],
        [1, 2],
    ],
    [[0, 0]],
];

const xBLOCK_CONFIG2 = [
    [
        [0, 0],
        [1, 1],
        [1, 2],
        [2, 2],
        [1, 3],
        [2, 4],
    ],
];

class Shape extends Box {
    _shapes;
    _blockSize;
    _isOver;
    constructor(
        canvas,
        container,
        index,
        x,
        y,
        blockSize = BLOCK_SIZE,
        colors,
        shape = BLOCK_CONFIG2[Math.floor(Math.random() * BLOCK_CONFIG2.length)]
    ) {
        super(canvas, container, x, y, blockSize, blockSize, {
            defalut: [0, 0, 0, 0],
        });
        this.dropped = true;
        this.index = index;
        this.colors = this.DEFAULT_COLORS();
        this.colors.default = this.colors.filled;
        this.defaultSize = this.top.grid.blockSize * 0.8;
        this._shapes = shape;
        this._blockSize = blockSize;
        this.selected = false;
        this.blocks = this.shape.map((e, i) => {
            let block = new RelBox(
                canvas,
                this,
                this.DEFAULT_COLORS(),
                e[0],
                e[1]
            );
            block.colors.default = this.adjustColor(
                this.top.grid.cells[4][4].colors.filled,
                { h: i * 1.5, l: i * 2 }
            );
            block.colors.filled = [0, 0, 0, 0];

            return block;
        });
        this.width = this.shapeWidth;
        this.height = this.shapeHeight;
        this.gap = 0;
        this.x = this._container.x + (this._container.width - this.width) / 2;
        this.y =
            this._container.y +
            (this._container.height / 3) * this.index +
            (this._container.height / 3 - this.height) / 2;
        this.startX = this.x;
        this.startY = this.y;
    }
    onResize() {
        this.x = this._container.x + (this._container.width - this.width) / 2;
        this.y =
            this._container.y +
            (this._container.height / 3) * this.index +
            (this._container.height / 3 - this.height) / 2;
        this.startX = this.x;
        this.startY = this.y;
        this.blocks.forEach((e) => {
            e.hoverBox = [this.x, this.y, this.height, this.width];
        });
    }
    get startPos() {
        let x =
            this._container.x +
            (this._container.width - this.calcPos(this.defaultSize).width) / 2;
        let y =
            this._container.y +
            (this._container.height / 3) * this.index +
            (this._container.height / 3 -
                this.calcPos(this.defaultSize).height) /
                2;
        return { x: x, y: y };
    }
    get shape() {
        return this._shapes;
    }
    get shapeWidth() {
        return (
            (Math.max(...this._shapes.map((e) => e[1])) + 1) * this.blockSize
        );
    }
    get shapeHeight() {
        return (
            (Math.max(...this._shapes.map((e) => e[0])) + 1) * this.blockSize
        );
    }
    get blockSize() {
        return this._blockSize;
    }
    set blockSize(size) {
        this._blockSize = size;
    }
    calcPos(blockSize, startSize = this.blockSize) {
        let oldH = (Math.max(...this._shapes.map((e) => e[0])) + 1) * startSize;

        let oldW = (Math.max(...this._shapes.map((e) => e[1])) + 1) * startSize;
        let newH = (Math.max(...this._shapes.map((e) => e[0])) + 1) * blockSize;
        let newW = (Math.max(...this._shapes.map((e) => e[1])) + 1) * blockSize;
        let newX = this.x + (oldW - newW) / 2;
        let newY = this.y + (oldH - newH) / 2;
        return {
            x: newX,
            y: newY,
            block: blockSize,
            width: newW,
            height: newH,
        };
    }
    onMouseDown(e) {
        if (this.selected) return;
        this.selected = true;
        this.isDropped = false;
        this.top.selected = this;
        this.pickup();
    }
    onMouseUp(e) {
        if (!this.selected) return;
        this.selected = false;
        var place = this.top.grid.traceShape(this);
        this.top.grid.place(place, this);
    }
    onMouseMove() {
        this.x = this.mx - this.shapeWidth / 2;
        this.y = this.my - this.shapeHeight / 2;

        this.x =
            this.x > this.top.x
                ? this.x + this.width < this.top.x + this.top.width
                    ? this.x
                    : this.top.x + this.top.width - this.width
                : this.top.x;
        this.y =
            this.y > this.top.y
                ? this.y + this.height < this.top.y + this.top.height
                    ? this.y
                    : this.top.y + this.top.height - this.height
                : this.top.y;
        this.top.grid.traceShape(this);
    }
    pickup() {
        if (this.mouseUp) return;
        console.log("Pickup");
        let dur = 200;
        let eSize = this.top.grid.blockSize;
        let size = Math.abs(this.blockSize - this.top.grid.blockSize);

        let startSize = this.blockSize;
        let startTime = new Date().getTime();
        let animation = (startTime, duration, startSize, sise) => {
            if (this.mouseUp) return;
            var st = startTime,
                d = duration,
                ss = startSize,
                s = sise;

            let currentTime = new Date().getTime();
            let elapsed = currentTime - st;

            let q = Math.min(elapsed / d, 1);

            this.blockSize = ss + s * this.bounce(q);
            this.gap = (this.blockSize / 10) * q;

            if (q == 1) {
                return;
            } else {
                window.requestAnimationFrame(
                    animation.bind(this, st, d, ss, s)
                );
            }
        };
        window.requestAnimationFrame(
            animation.bind(this, startTime, dur, startSize, size)
        );
    }
    isPointInPath(x = this.mx, y = this.my) {
        this.ctx.beginPath();
        this.ctx.fillStyle = this.hsla(0, 0, 0, 0);

        for (let b of this.blocks) {
            this.ctx.rect(b.x, b.y, b.width, b.width);
        }
        this.ctx.fill();
        return this.ctx.isPointInPath(x, y);
    }
    blockPos() {
        if (this.selected) {
            this.blockSize = this.top.grid.cells[0][0].width;
            let gap = 10;
            this.blocks.forEach((e) => {});
        }
    }
    update() {
        if (this.selected) {
            this.onMouseMove();
        }
    }
    draw() {
        this.update();
        this.blocks.forEach((e) => {
            e.fillStyle = this.colors.filled;
            e.draw(this.gap);
        });
    }
    /* draw() {
        var shapeSizeW = this.shape[0].length;
        var shapeSizeH = this.shape.length;
        this.ctx.beginPath();
        this.ctx.fillStyle = "transparent";
        this.ctx.rect(
            this.x,
            this.y,
            this.blockSize * shapeSizeW,
            this.blockSize * shapeSizeH
        );
        this.ctx.fill();
        var isHovered = this.ctx.isPointInPath(this.mx, this.my);
        this.ctx.beginPath();
        this.shape.forEach((group, row) => {
            var r = row;
            group.forEach((block, col) => {
                var c = col;
                if (block == 1) {
                    this.ctx.rect(
                        this.x + this.blockSize * c + 3,
                        this.y + this.blockSize * r + 3,
                        this.blockSize - 6,
                        this.blockSize - 6
                    );
                }
            });
        });
        this.ctx.fillStyle = "blue";
        this.ctx.fill();
    } */
}

class Animation {
    #startTime;
    #elapsed;
    #isRunning;
    #duration;
    #curve;
    #parent;
    constructor(partent, duration, callback, ...parameters) {
        this.duration = duration;
        this.callback = callback;
        this.parent = parent;
        this.param;
    }
    get startTime() {
        this.#startTime =
            this.#startTime == null ? new Date().getTime() : this.#startTime;
        return this.#startTime;
    }
    set startTime(time) {
        this.#startTime = time;
    }
    get elapsed() {
        return this.#elapsed;
    }
    set elapsed(time) {
        this.#elapsed = time;
    }
    get isRunning() {
        return this.#isRunning;
    }
    set isRunning(bool) {
        this.#isRunning = bool;
    }
    get duration() {
        return this.#duration;
    }
    set duration(ms) {
        this.#duration = ms;
    }
    scale(from, to, time = 500) {}
    easeInOut(x) {
        return 0.5 * Math.cos(Math.PI * x - Math.PI) + 0.5;
    }
    start() {
        if (!this.isRunning) this.isRunning = true;
        this.play();
    }
    play() {}
}

export { Shape };
