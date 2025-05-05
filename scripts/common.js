((window) => {
  const baseSettings = {
    stroke: '#ffffff',
    baseFill: '#000000',
    regularFill: 'red',
    oddFill: 'white',
    canvas: null,
    ctx: null,
    width: 1600,
    height: 1600,
    tileWidth: 100,
    tileHeight: 50,
    tileHalfHeight: 25,
    tileHalfWidth: 50,
    xStart: null,
    yStart: null,
  };

  window.baseSettings = baseSettings;
  const canvas = document.getElementById("field");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  baseSettings.canvas = canvas;
  baseSettings.ctx = ctx;

  class Grid {
    constructor(rows, cells) {
      this.rows = rows;
      this.cells = cells;
      this.grid = [];
    }

    setup() {
      const { canvas, ctx } = baseSettings;
      let xStart = canvas.width / 2;
      let yStart = 150;
      console.log('x|y', { xStart, yStart })
      baseSettings.yStart = yStart;
      baseSettings.xStart = xStart;

      ctx.fillStyle = baseSettings.baseFill;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      for (let i = 0; i < this.rows; i++) {
        let row = [];
        for (let j = 0; j < this.cells; j++) {
          let cell = new Tile(i, j);
          row.push(cell);
        }
        this.grid.push(row);
      }
    }

    displayGrid() {
      const { canvas, ctx, stroke } = baseSettings;
      ctx.fillStyle = baseSettings.baseFill;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = stroke;

      for (let row = 0; row < this.rows; row++) {
        for (let coll = 0; coll < this.cells; coll++) {
          let grid = this.grid;
          grid[row][coll].drawTile();
        }
      }

      window.requestAnimationFrame(() => {
        this.displayGrid();
      });
    }

  }

  class Tile {
    constructor(rowNumber, cellNumber,) {
      this.rowNumber = rowNumber;
      this.cellNumber = cellNumber;
      this.z = this.getRandomInt(0, 50);
      this.tileCoords = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      };
      this.currentZ = 0;
      this.animationDirection = 'up';
    }

    getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    animate(tile) {
      const { animationDirection, currentZ, z } = tile;
      const speed = z / 60 / 5;
      const topBound = z - 0.1;
      if (animationDirection === 'down' && tile.currentZ > 0.1) {
        tile.currentZ -= speed;
        tile.animationDirection = 'down';
        return tile.currentZ > 0 ? tile.currentZ : 1;
      } else {
        tile.animationDirection = 'up';
        tile.currentZ += speed;
        if (tile.currentZ > topBound) {
          tile.animationDirection = 'down';
          tile.currentZ -= speed;
          return tile.currentZ;
        }
        return tile.currentZ;
      }
    }

    drawTile() {
      const { ctx, tileHalfHeight, tileHalfWidth, tileWidth, yStart, xStart } = baseSettings;
      const xScreen = xStart + (this.rowNumber - this.cellNumber) * tileHalfWidth;
      const yScreen = yStart + (this.rowNumber + this.cellNumber) * tileHalfHeight;
      const xBottom = xScreen - tileHalfWidth;
      const yBottom = yScreen + tileHalfHeight;
      const xLeft = xScreen - tileWidth;
      const xTop = xScreen - tileHalfWidth;
      const yTop = yScreen - tileHalfHeight;
      // const yShift = this.animate(this);
      const yShift = 0;

      this.tileCoords.top = yTop - yShift //top corner y coords
      this.tileCoords.right = xScreen //right corner x coords
      this.tileCoords.bottom = yBottom - yShift //bottom corner y coords
      this.tileCoords.left = xLeft //left corner x coords


      const topFace = new Path2D();
      const rightFace = new Path2D();
      const leftFace = new Path2D();

      ctx.beginPath();
      topFace.moveTo(xScreen, yScreen - yShift); //right corner
      topFace.lineTo(xBottom, yBottom - yShift); // bottom corner
      topFace.lineTo(xLeft, yScreen - yShift); // left corner
      topFace.lineTo(xTop, yTop - yShift); // top corner
      topFace.lineTo(xScreen, yScreen - yShift); // back to right corner

      rightFace.moveTo(xScreen, yScreen);
      rightFace.lineTo(xScreen, yScreen - yShift);
      rightFace.moveTo(xScreen, yScreen);
      rightFace.lineTo(xBottom, yBottom);
      rightFace.lineTo(xBottom, yBottom - yShift);
      rightFace.lineTo(xScreen, yScreen - yShift);


      leftFace.moveTo(xBottom, yBottom - yShift);
      leftFace.lineTo(xBottom, yBottom);
      leftFace.lineTo(xLeft, yScreen);
      leftFace.lineTo(xLeft, yScreen - yShift);
      leftFace.lineTo(xBottom, yBottom - yShift);

      ctx.fillStyle = 'green';
      ctx.fill(topFace);
      ctx.fillStyle = 'red';
      ctx.fill(rightFace);
      ctx.fillStyle = 'blue';
      ctx.fill(leftFace);
      ctx.stroke(topFace);
      ctx.stroke(rightFace);
      ctx.stroke(leftFace);
      ctx.closePath();
    }
  }


  const grid = new Grid(50, 50);
  grid.setup();
  grid.displayGrid();

  console.log(grid);

  window.onresize = () => {
    grid.setup();
  };

  window.onkeydown = (keyboardEvent) => {
    console.log('e', keyboardEvent);
    const { keyCode } = keyboardEvent;
    const { xStart, yStart } = baseSettings;
    switch (keyCode) {
      case 37: {
        console.log('ArrowLeft');
        const windowLeftBound = 0;
        const { left } = grid.grid[0][grid.cells - 1].tileCoords;
        if (left < windowLeftBound) {
          baseSettings.xStart = xStart + 25;
        }
        break;
      }
      case 38: {
        console.log('ArrowUp');
        const windowBottomBound = 150;
        const { top } = grid.grid[0][0].tileCoords;
        if (top < windowBottomBound) {
          baseSettings.yStart = yStart + 25;
        }
        break;
      }
      case 39: {
        console.log('ArrowRight');
        const windowRightBound = window.innerWidth;
        const { right } = grid.grid[grid.rows - 1][0].tileCoords;
        if (right > windowRightBound) {
          baseSettings.xStart = xStart - 25;
        }
        break;
      }
      case 40: {
        console.log('ArrowDown');
        const windowBottomBound = window.innerHeight;
        const { bottom } = grid.grid[grid.rows - 1][grid.cells - 1].tileCoords;
        if (bottom > windowBottomBound) {
          baseSettings.yStart = yStart - 25;
        }
        break;
      }

    }
  }

})(window);