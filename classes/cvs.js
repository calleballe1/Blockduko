import GameContainer from "./GameBoard.js";
class CVS {
    static START_DEGUGGER = false;
    static gameContainer;
    static _mouseIsDown = false;
    static _mouseIsUp = true;
    #canvas;
    #ctx;
    #mx;
    #my;
    #click;

    constructor(canvas) {
        this.keyDown = false;
        this.DEFAULT_COLORS = () => {
            return {
                default: [150, 20, 40, 1],
                filled: [150, 75, 30, 1],
                hover: [150, 20, 50, 1],
                stroke: [200, 80, 90, 1],
            };
        };
        this.#canvas = canvas;
        this.#ctx = this.#canvas.getContext("2d");
        this.canvas.height = window.innerHeight;
        this.#canvas.width = window.innerWidth;

        canvas.addEventListener("pointermove", this.mousetrace.bind(this));
        canvas.addEventListener("pointerdown", this.isMouseDown.bind(this));
        canvas.addEventListener("pointerup", this.isMouseUp.bind(this));
    }
    get top() {
        return CVS.gameContainer;
    }
    get ctx() {
        return this.#ctx;
    }
    get canvas() {
        return this.#canvas;
    }
    get mouseIsDown() {
        return CVS._mouseIsDown;
    }
    get mouseIsUp() {
        return CVS._mouseIsUp;
    }

    getfillStyle(clr) {
        let gradient = [];
        gradient[0] = this.hsla(...this.adjustColor(clr, { l: -2 }));
        gradient[1] = this.hsla(...clr);
        gradient[2] = this.hsla(...this.adjustColor(clr, { l: 2 }));
        if (CVS.START_DEGUGGER) {
            debugger;
            console.log(gradient);
        }
        return gradient;
    }

    onResize() {}
    mousetrace(e) {
        this.#mx = e.offsetX;
        this.#my = e.offsetY;
    }
    isMouseDown() {
        if (CVS._mouseIsDown) return;
        CVS._mouseIsDown = true;
        CVS._mouseIsUp = false;
    }
    isMouseUp() {
        if (CVS._mouseIsUp) return;
        CVS._mouseIsDown = false;
        CVS._mouseIsUp = true;
    }

    get mx() {
        return this.#mx;
    }
    get my() {
        return this.#my;
    }

    ease(x, pow = 2) {
        return 0.5 * Math.cos(Math.PI * Math.pow(x, pow) - Math.PI) + 0.5;
    }
    easeIn(x, pow = 2) {
        return Math.pow(-1 * Math.pow(x - 1, 2) + 1, pow);
    }
    easeOut(x, pow = 2) {
        return Math.pow(Math.pow(x, 2), pow);
    }
    bounce(x) {
        return (
            (2 / 3) * Math.cos((4 / 3) * x * Math.PI - (4 / 3) * Math.PI) +
            1 / 3
        );
    }

    changeColor(color, { h, s, l, a }) {
        var clr;
        if (typeof color == "string") {
            clr = color
                .split(/(,|\(|\))/g)
                .map((e) => {
                    if (Number(e)) {
                        return Number(e);
                    }
                    let x = e.replace(/\D/g, "");
                    if (Number(x)) {
                        return Number(x);
                    } else return "";
                })
                .filter((e) => e.toString().length > 0);
            if (CVS.START_DEGUGGER) {
                console.log(color, clr, h, s, l, a);
            }
        } else {
            clr = [...color];
        }
        clr[0] = h || h == 0 ? h : clr[0];
        clr[1] = s || s == 0 ? s : clr[1];
        clr[2] = l || l == 0 ? l : clr[2];
        clr[3] = a || a == 0 ? a : clr[3];
        if (CVS.START_DEGUGGER) {
            console.log(clr);
        }
        return clr;
    }
    adjustColor(color, { h = 0, s = 0, l = 0, a = 0 }) {
        var clr;
        if (typeof color == "string") {
            clr = color
                .split(/(,|\(|\))/g)
                .map((e) => {
                    if (Number(e)) {
                        return Number(e);
                    }
                    let x = e.replace(/\D/g, "");
                    if (Number(x)) {
                        return Number(x);
                    } else return "";
                })
                .filter((e) => e.toString().length > 0);
        } else {
            clr = [...color];
        }

        clr[0] = clr[0] + h;
        clr[1] = clr[1] + s;
        clr[2] = clr[2] + l;
        clr[3] = clr[3] + a;
        return clr;
    }
    rgba(r = 255, g = 255, b = 255, a = 1) {
        if (typeof r == "string") {
            let clr = r
                .split(/,|\(|\)/g)
                .map((e) => {
                    e = e.replace(/[^\d|\d\.?\d]/g, "");
                    if (Number(e)) {
                        return Number(e);
                    } else {
                        return "";
                    }
                })
                .filter((e) => typeof e == "number");
            return this.rgba(clr);
        }
        return `rgba(${r},${g},${b},${a})`;
    }
    hsla(h = 0, s = 0, l = 75, a = 1) {
        if (typeof h == "string") {
            let clr = h
                .split(/,|\(|\)/g)
                .map((e) => {
                    e = e.replace(/[^\d|\d\.?\d]/g, "");
                    if (Number(e)) {
                        return Number(e);
                    } else {
                        return "";
                    }
                })
                .filter((e) => typeof e == "number");
            return this.hsla(...clr);
        }
        return `hsla(${h}deg,${s}%,${l}%,${a})`;
    }
}

class Box extends CVS {
    _x;
    _y;
    _height;
    #bgColor;
    constructor(
        canvas,
        container,
        x,
        y,
        width,
        height,
        colors = this.DEFAULT_COLORS(),
        strokeColor = [0, 0, 0, 0],
        strokeWidth = 0
    ) {
        super(canvas);
        this._container = container;
        this._isOver = false;
        this._x = x;
        this._y = y;
        this._width = width;
        this._height = height;
        this.colors = colors;
        this._fillStyle = this.colors.default
            ? this.colors.default
            : this.colors;
        this._strokeStyle = strokeColor;
        this.strokeWidth = strokeWidth;
        this._isEmpty = true;
    }
    get isEmpty() {
        return this._isEmpty;
    }
    set isEmpty(bool) {
        this._isEmpty = bool;
    }
    get defaultHoverBox() {
        let box = [];
        box.push(this.x);
        box.push(this.y);
        box.push(this.width);
        box.push(this.height);
        return box;
    }
    get clr() {
        return this.fillStyle;
    }
    set clr(c) {
        this._clr = c;
    }
    get x() {
        return this._x;
    }
    set x(value) {
        this._x = value;
    }
    get y() {
        return this._y;
    }
    set y(value) {
        this._y = value;
    }
    get width() {
        return this._width;
    }
    set width(value) {
        this._width = value;
    }
    get height() {
        return this._height;
    }
    set height(value) {
        this._height = value;
    }
    get fillStyle() {
        return this.getfillStyle(this._fillStyle);
    }
    get strokeStyle() {
        return this.hsla(...this._strokeStyle);
    }
    set fillStyle(color) {
        this._fillStyle = color;
    }
    set strokeStyle(color) {
        this._strokeStyle = color;
    }
    get isOver() {
        return this._isOver;
    }
    set isOver(x) {
        this._isOver = x;
    }
    update() {}

    draw(gap = 0) {
        if (!this.isEmpty) {
            gap = 0;
            this.fillStyle = this.colors.filled;
        } else {
            if (this.isOver) {
                this.fillStyle = this.colors.hover;
            } else {
                this.fillStyle = this.colors.default;
            }
        }
        var x = this.x,
            y = this.y,
            w = this.width,
            h = this.height;
        if (gap) {
            x = this.x + gap;
            y = this.y + gap;
            w = this.width - gap * 2;
            h = this.height - gap * 2;
        }
        try {
            this.ctx.beginPath();
            let grd = this.ctx.createLinearGradient(x, y, x + w, y + h);
            let grdClr = this.fillStyle;
            grd.addColorStop(0, grdClr[0]);
            grd.addColorStop(0.5, grdClr[1]);
            grd.addColorStop(1, grdClr[2]);
            this.ctx.fillStyle = grd;
            this.ctx.strokeStyle = this.strokeStyle;
            this.ctx.lineWidth = "none";
            this.ctx.fillRect(x, y, w, h);
            this.ctx.fill();
            this.ctx.stroke();
        } catch (e) {
            console.log(e);
            console.log(gap, x, y, w, h);
            debugger;
            this.ctx.beginPath();
            let grd = this.ctx.createLinearGradient(x, y, x + w, y + h);
            let grdClr = this.fillStyle;
            grd.addColorStop(0, grdClr[0]);
            grd.addColorStop(0.5, grdClr[1]);
            grd.addColorStop(1, grdClr[2]);
            this.ctx.fillStyle = grd;
            this.ctx.strokeStyle = this.strokeStyle;
            this.ctx.lineWidth = "none";
            this.ctx.fillRect(x, y, w, h);
            this.ctx.fill();
            this.ctx.stroke();
        }
    }

    isPointInPath(x = this.mx, y = this.my) {
        let box = this.hoverBox ? this.hoverBox : this.defaultHoverBox;
        this.ctx.beginPath();
        this.ctx.fillStyle = this.rgba(...[150, 50, 50, 0.0]);
        this.ctx.rect(...box);
        this.ctx.fill();
        let inPath = this.ctx.isPointInPath(x, y);
        return inPath;
    }
}
class RelBox extends Box {
    constructor(canvas, container, colors, r, c) {
        super(
            canvas,
            container,
            container.x + container.blockSize * c,
            container.y + container.blockSize * r,
            container.blockSize,
            container.blockSize,
            colors,
            container._strokeStyle,
            container.strokeWidth
        );
        this._container = container;
        this._index = {
            r: r,
            c: c,
        };
    }
    get container() {
        return this._container;
    }
    get x() {
        let x = this.container.x + this.container.blockSize * this.c;
        this._x = x;
        return x;
    }
    get y() {
        let y = this.container.y + this.container.blockSize * this.r;
        this._y = y;
        return y;
    }
    get r() {
        return this._index.r;
    }
    get c() {
        return this._index.c;
    }
    get width() {
        return this.container.blockSize;
    }
    get height() {
        return this.container.blockSize;
    }
}

export { CVS, Box, RelBox };
