import { Box, RelBox, CVS } from "./cvs.js";
import { Shape } from "./Blocks.js";
class Grid extends Box {
    _container;
    #colors;
    _cells;
    constructor(canvas, container, blocksize, colors) {
        super(
            canvas,
            container,
            container.x,
            container.y,
            container.width,
            container.height,
            colors
        );
        this.blockSize = blocksize;
        this._container = container;
        this._fillStyle = [0, 0, 0, 0];
        this._strokeStyle = [0, 0, 100, 1];
        this._strokeWidth = 0;
        this.gap = 1;
        this.next = true;
        this._cells = [];
        this.doneCells = [];
        this.isCheckGrid = false;

        this.createCells();
    }
    get container() {
        return this._container;
    }
    get cells() {
        return this._cells;
    }
    set cells(cells) {
        this._cells = cells;
    }
    get cellsByColumn() {
        var x = this.cells.flat().reduce((cellGrid, cell) => {
            cellGrid[cell.c] = cellGrid[cell.c] || [];
            cellGrid[cell.c][cell.r] = cell;
            return cellGrid;
        }, []);
        return x;
    }
    get cellsByRow() {
        var x = this.cells.flat().reduce((cellGrid, cell) => {
            cellGrid[cell.r] = cellGrid[cell.r] || [];
            cellGrid[cell.r][cell.c] = cell;
            return cellGrid;
        }, []);
        return x;
    }
    get cellsBySquare() {
        var shapes = [];
        for (let i = 0, col = 0; i < 9; i++) {
            var part = Math.floor(i / 3);
            var sRow = 3 * part;
            var shape = [];
            for (let r = sRow; r < sRow + 3; r++) {
                var x = col;
                for (let c = x; c < x + 3; c++) {
                    shape.push(this.cells[r][c]);
                }
            }
            col = col + 3 > 8 ? 0 : col + 3;

            shapes[i] = shape;
        }
        return shapes;
    }
    get emptyCells() {
        var emptyCells = [];
        this.cells.forEach((e) => {
            e.forEach((e) => {
                if (e.isEmpty) {
                    emptyCells.push([e.r, e.c]);
                }
            });
        });
        return emptyCells;
    }
    get isGameOver() {
        var canBePlaced = [];
        for (let x of this.top.shapes) {
            this.emptyCells.forEach((e) => {
                let c = this.cells[e[0]][e[1]];
                this.getShape(c, x);
                canBePlaced.push(this.getShape(c, x));
            });
        }

        if (
            canBePlaced.every((e) => {
                return !e || !e[0];
            })
        ) {
            return true;
        } else {
            return false;
        }
    }
    onResize() {
        this.x = this.container.x;
        this.y = this.container.y;
        this.width = this.container.width;
        this.height = this.container.height;
    }
    createCells() {
        var gridArr = new Array(9).fill(new Array(9).fill(""));
        this.cells = gridArr.map((group, r) => {
            var row = r;
            var hej = group.map((cell, col) => {
                let skip = [3, 4, 5];
                var colors = this.DEFAULT_COLORS();
                colors.default = this.changeColor(colors.default, { h: 200 });
                for (let c in colors) {
                    colors[c];
                }

                colors.default = this.changeColor(colors.default, {
                    s: 30,
                    l: 89,
                });
                colors.hover = this.adjustColor(colors.default, {
                    l: -2,
                    s: 80,
                });
                colors.filled = this.adjustColor(
                    this.changeColor(colors.default, {
                        l: 50 + col * 2,
                        s: 75 + row * 2,
                    }),
                    {
                        h: col * 1.5 + row * 3,
                    }
                );
                var bajs = new RelBox(this.canvas, this, colors, row, col);

                if (
                    (skip.indexOf(row) == -1 && skip.indexOf(col) == -1) ||
                    (skip.indexOf(row) != -1 && skip.indexOf(col) != -1)
                ) {
                    bajs.colors.default = this.adjustColor(colors.default, {
                        l: 5,
                        s: 15,
                    });
                }
                return bajs;
            });
            return hej;
        });
    }
    getShape(startCell, shape) {
        var removedCells = [];
        if (this.doneCells.length > 0) {
            removedCells = this.doneCells
                .map((e) => {
                    return [e.r, e.c];
                })
                .filter((x, y, z) => {
                    return !(
                        z
                            .map((e) => JSON.stringify(e))
                            .indexOf(JSON.stringify(x)) < y
                    );
                });
            removedCells = removedCells.map((e) => JSON.stringify(e));
        }
        var cellArr = [];

        for (let b of shape.blocks) {
            let r = startCell.r + b.r;
            let c = startCell.c + b.c;
            if (c < 9 && c >= 0 && r < 9 && r >= 0) {
                if (
                    !this.cells[r][c].isEmpty &&
                    removedCells.indexOf(JSON.stringify([r, c])) == -1
                )
                    return [false];
                cellArr.push(this.cells[r][c]);
            } else {
                return false;
            }
        }
        return cellArr;
    }
    traceShape(shape) {
        this.cells.forEach((e) => {
            e.forEach((e) => {
                e.isOver = false;
            });
        });
        for (let row of this.cells) {
            for (let cell of row) {
                if (
                    cell.isPointInPath(
                        shape.x + shape.blockSize / 2,
                        shape.y + shape.blockSize / 2
                    )
                ) {
                    let r =
                        Math.abs(cell.y - shape.y) > cell.height / 2
                            ? cell.y - shape.y < 0
                                ? cell.r + 1
                                : cell.r + 1
                            : cell.r;
                    let c =
                        Math.abs(cell.x - shape.x) > cell.width / 6
                            ? cell.x - shape.x < 0
                                ? cell.c + 1
                                : cell.c - 1
                            : cell.c;
                    r = Math.min(Math.max(r, -1), 8);
                    c = Math.min(Math.max(c, -1), 8);
                    var canPlace = this.getShape(cell, shape);
                    if (!canPlace || !canPlace[0]) return;
                    try {
                        canPlace.forEach((e) => {
                            e.isOver = true;
                            e.fillStyle = e.colors.hover;
                        });
                    } catch (e) {
                        console.log(canPlace);
                    }

                    return canPlace;
                }
            }
        }
    }
    place(cells, shape) {
        let shapeIndex;
        var full = false;
        if (!cells) {
            this.drop.bind(shape)(cells);
            return;
        } else {
            shapeIndex = shape.index;
            this.top.selected = null;
            this.drop
                .bind(shape)(cells)
                .then(() => {
                    cells.forEach((e) => {
                        e.fillStyle = e.colors.default;
                        e.isEmpty = false;
                        e.isOver = false;
                    });

                    this.top.shapes.splice(
                        this.top.shapes.findIndex((e) => e.index == shapeIndex),
                        1
                    );
                    this.isCheckGrid = true;
                });
        }

        this.top.scoreBoard.newScore(cells.length);
    }
    async drop(cells) {
        return new Promise((res) => {
            if (this.mouseDown) return;
            console.log("Drop");
            this.gap = this.blockSize / 10;
            let dur = cells ? 250 : 150;

            let start = {
                time: new Date().getTime(),
                x: this.x,
                y: this.y,
                block: this.blockSize,
            };

            let end = {
                block: this.defaultSize,
                x: this.startPos.x,
                y: this.startPos.y,
            };
            if (cells) {
                end = {
                    block: this.blockSize,
                    x: cells[0].x,
                    y: cells[0].y,
                };
            }

            let animation = (startProp, endProp, duration) => {
                console.log(this.mouseDown);
                if (this.mouseDown) res();
                let startP = startProp;
                let endP = endProp;

                let d = duration;

                let sizeLen = startP.block - endP.block;
                let xLen =
                    startP.x + this.blockSize * this.blocks[0].c - endP.x;
                let yLen =
                    startP.y + this.blockSize * this.blocks[0].r - endP.y;
                console.log(startP, endP);
                let currentTime = new Date().getTime();
                let elapsed = currentTime - start.time;

                let q = Math.min(elapsed / d, 1);

                this.blockSize = startP.block - sizeLen * this.ease(q);
                this.x = startP.x - xLen * this.ease(q);
                this.y = startP.y - yLen * this.easeOut(q);

                this.gap = (this.blockSize / 10) * (1 - q);
                if (q == 1) {
                    this.isDropped = true;
                    window.cancelAnimationFrame(frame);
                    res();
                } else {
                    window.requestAnimationFrame(
                        animation.bind(this, start, endP, d)
                    );
                }
            };

            let frame = window.requestAnimationFrame(
                animation.bind(this, start, end, dur)
            );
        });
    }
    removeRow(row, n = 0) {
        var newCells = [...row].map((e, i) => {
            let newcell = new Box(
                this.canvas,
                this,
                e.x,
                e.y,
                e.width,
                e.height,
                e.colors.filled
            );
            newcell.r = e.r;
            newcell.c = e.c;
            newcell.deleteThis = false;
            return newcell;
        });

        let animate = (newRow, row, startTime, n, x) => {
            let currentTime = new Date().getTime();
            let elapsed = currentTime - startTime;

            if (x >= 2 || 0) {
                x = 0;
                this.deleteCell(newRow[n], 100);
                n++;
            }
            x++;
            row.forEach((e, i) => {
                if (newRow[i].deleteThis) {
                    console.log("delete");
                    e.isEmpty = true;
                    e.isOver = false;
                }
            });
            if (newRow.every((e) => e.deleteThis) || n > 8) {
                console.log("rowEnd");
                window.cancelAnimationFrame(frame);
                return;
            }
            window.requestAnimationFrame(
                animate.bind(this, newRow, row, startTime, n, x)
            );
        };
        let start = new Date().getTime();
        let x = n;
        let frame = window.requestAnimationFrame(
            animate.bind(this, newCells, row, start, x, 0)
        );
    }
    deleteCell(cell, duration) {
        if (cell.deleteThis) return;

        var animate = (newCell, dur, sTime, start) => {
            var c = newCell,
                d = dur,
                st = sTime,
                s = start;
            let currentTime = new Date().getTime();
            let elapsed = currentTime - sTime;
            let q = Math.min((elapsed * 0.5) / dur, 0.5);
            let q2 = Math.min(elapsed / dur, 1);

            cell.width = s.size - q * s.size;
            cell.height = s.size - q * s.size;
            cell.x = s.x + (q * s.size) / 2;
            cell.y = s.y + (q * s.size) / 2;

            cell.fillStyle = this.changeColor(cell.colors, {
                a: Math.max(Number((1 - q2).toFixed(2)), 0),
            });
            this.ctx.beginPath();
            let grd = this.ctx.createLinearGradient(
                cell.x,
                cell.y,
                cell.x + cell.width,
                cell.y + cell.height
            );

            let grdClr = cell.fillStyle;

            grd.addColorStop(0, grdClr[0]);
            grd.addColorStop(0.5, grdClr[1]);
            grd.addColorStop(1, grdClr[2]);

            this.ctx.fillStyle = grd;
            this.ctx.rect(cell.x, cell.y, cell.width, cell.height);

            this.ctx.fill();

            if (q2 == 1) {
                console.log("cellEnd");
                cell.deleteThis = true;
                window.cancelAnimationFrame(frame);
                return;
            } else {
                window.requestAnimationFrame(animate.bind(this, c, d, st, s));
            }
        };
        let newCell = cell;
        let sTime = new Date().getTime();
        let start = {
            size: cell.width,
            x: cell.x,
            y: cell.y,
        };
        let frame = window.requestAnimationFrame(
            animate.bind(this, newCell, duration, sTime, start)
        );
    }
    checkGrid() {
        var doneCells = [];

        for (let c of this.cellsByColumn.map((e) => {
            return e.reverse();
        })) {
            if (c.every((e) => !e.isEmpty)) {
                this.removeRow(c);
                doneCells.push(c);
                e.forEach((e) => {
                    e.isEmpty = true;
                });
            }
        }
        for (let r of this.cellsByRow) {
            if (r.every((e) => !e.isEmpty)) {
                this.top.scoreBoard.newScore(9);
                this.removeRow(r);
                doneCells.push(r);
                e.forEach((e) => {
                    e.isEmpty = true;
                });
            }
        }

        for (let s of this.cellsBySquare) {
            if (s.every((e) => !e.isEmpty)) {
                debugger;
                this.top.scoreBoard.newScore(9);
                this.removeRow(s);
                doneCells.push(s);
                e.forEach((e) => {
                    e.isEmpty = true;
                });
            }
        }
        if (this.isGameOver) {
            alert("gameÖver");
        }

        this.isCheckGrid = false;
    }
    draw() {
        if (this.isCheckGrid) {
            this.checkGrid();
        }
        this.ctx.beginPath();
        let grd = this.ctx.createLinearGradient(
            this.x,
            this.y,
            this.x + this.width,
            this.y + this.height
        );
        grd.addColorStop(
            0,
            this.hsla(
                ...this.adjustColor(this.cells[0][0].colors.default, { l: 10 })
            )
        );
        grd.addColorStop(
            0.5,
            this.hsla(
                ...this.adjustColor(this.cells[4][4].colors.default, { l: 10 })
            )
        );
        grd.addColorStop(
            1,
            this.hsla(
                ...this.adjustColor(this.cells[8][8].colors.default, { l: 10 })
            )
        );
        this.ctx.fillStyle = grd;
        this.ctx.fillRect(this.x, this.y, this.width, this.height);
        for (let r of this.cells) {
            for (let c of r) {
                c.draw(this.gap);
            }
        }
        this.ctx.beginPath();
        this.ctx.strokeStyle = this.hsla(
            ...this.changeColor(this.cells[0][0].colors.default, {
                l: 95,
                s: 100,
                a: 0.8,
            })
        );
        this.ctx.lineWidth = 4;
        this.ctx.moveTo(this.x, this.y + this.blockSize * 3);
        this.ctx.lineTo(this.x + this.width, this.y + this.blockSize * 3);

        this.ctx.moveTo(this.x, this.y + this.blockSize * 6);
        this.ctx.lineTo(this.x + this.width, this.y + this.blockSize * 6);

        this.ctx.moveTo(this.x + this.blockSize * 3, this.y);
        this.ctx.lineTo(this.x + this.blockSize * 3, this.y + this.height);

        this.ctx.moveTo(this.x + this.blockSize * 6, this.y);
        this.ctx.lineTo(this.x + this.blockSize * 6, this.y + this.height);

        this.ctx.stroke();
    }
}
class Square extends RelBox {
    _container;
    _index;
    _isEmpty;
    _isHoverd;

    constructor(canvas, container, r, c) {
        super(canvas, container, r, c);
        this._isEmpty = true;
    }
    get isEmpty() {
        return this._isEmpty;
    }
    set isEmpty(value) {
        this._isEmpty = value;
    }
    onMouseDown(e) {}
    onMouseUp(e) {}
    update() {}
}
export { Grid, Square };
