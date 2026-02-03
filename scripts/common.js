((window) => {
  const baseSettings = {
    stroke: '#ffffff',
    baseFill: '#000000',
    regularFill: 'red',
    hoverFill: "rgba(192, 57, 43, 1)",
    currentFill: "rgb(93, 90, 252)",
    targetFill: 'rgb(149, 148, 214)',
    tileType: {
      hover: 'HOVER',
      target: 'TARGET',
      current: 'CURRENT'
    },
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
    mousePosition: { x: 0, y: 0 },
    hoverTileX: -1,
    hoverTileY: -1,
    cells: 0,
    rows: 0,
    grid: null,
    isMouseDown: false,
    currentPos: { x: 0, y: 0 },
    targetPos: { x: -1, y: -1 }
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
      baseSettings.yStart = yStart;
      baseSettings.xStart = xStart;

      ctx.fillStyle = baseSettings.baseFill;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      baseSettings.cells = this.cells;
      baseSettings.rows = this.rows;
      for (let i = 0; i < this.rows; i++) {
        let row = [];
        for (let j = 0; j < this.cells; j++) {
          let cell = new Tile(i, j);
          row.push(cell);
        }
        this.grid.push(row);
      }
      baseSettings.grid = grid;
      // console.log('qwe')
    }

    updateHover() {

      const { isMouseDown, mousePosition, tileHeight, tileWidth, xStart, yStart } = baseSettings;

      const currentY = mousePosition.y - yStart;
      const currentX = mousePosition.x - xStart;
      baseSettings.hoverTileX = Math.floor(currentY / tileHeight + currentX / tileWidth) + 1;
      baseSettings.hoverTileY = Math.floor(-currentX / tileWidth + currentY / tileHeight);

      // if (isMouseDown) {
      //   // console.log('yeaahahah');
      //   // baseSettings.isMouseDown = false;
      //   baseSettings.currentPos.x = hoverTileX;
      //   baseSettings.currentPos.y = hoverTileY;
      //   console.log('click!', {
      //     currentPos:baseSettings.currentPos
      //   })
      // }

    }

    displayGrid() {
      const { canvas, ctx, stroke } = baseSettings;
      ctx.fillStyle = baseSettings.baseFill;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = stroke;
      let grid = this.grid;
      for (let row = 0; row < this.rows; row++) {
        for (let coll = 0; coll < this.cells; coll++) {
          grid[row][coll].drawTile();
        }
      }

      window.requestAnimationFrame(() => {
        this.updateHover();
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
      this.tilePoints = {
        top: { x: 0, y: 0 },
        right: { x: 0, y: 0 },
        bottom: { x: 0, y: 0 },
        left: { x: 0, y: 0 },
      },
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

    moveCurrentToTarget(from, to) {
      const { tileType, currentPos } = baseSettings;
      // console.log('asdasd', {from,to});
      let intervalId = null;
      // let bufferX = null || 0;
      // let bufferY = null || 0;
      let bufferX = currentPos.x;
      let bufferY = currentPos.y;


      if (from.x < to.x && from.y < to.y) {
        // intervalId = setInterval(() => {
        bufferX = from.x + 1;
        bufferY = from.y + 1;
        // }, 1000);
      }

      

      // if (from.y < to.y && from.x === to.x) {
      //   bufferY = from.y + 1;
      // }
      // if (from.x === to.x && from.y === to.y) {

      //   bufferX = from.x;
      //   bufferY = from.y;
      //   // intervalId = setInterval(() => {
      //   // this.drawHoverTile(from.x, from.y, tileType.current);
      //   // // console.log(currentPos);
      //   // }, 1000);
      // }
      // if (to.x <= from.x && to.y <= from.y) {
      //   this.drawHoverTile(from.x - 1, from.y - 1, tileType.current);
      // }

      this.drawHoverTile(bufferX, bufferY, tileType.current);
      baseSettings.currentPos.x = bufferX;
      baseSettings.currentPos.y = bufferY;
      // console.log(currentPos);


      // clearInterval(intervalId);
    }

    drawHoverTile(x, y, type) {
      if (x < 0 || y < 0) {
        return null;
      }

      const { ctx, grid: { grid } } = baseSettings;
      const hoveredCell = grid[x][y].tilePoints;
      const topFace = new Path2D();

      ctx.beginPath();
      const fill = getTileColorByType(type)
      ctx.fillStyle = fill;
      topFace.moveTo(hoveredCell.top.x, hoveredCell.top.y);
      topFace.lineTo(hoveredCell.right.x, hoveredCell.right.y);
      topFace.lineTo(hoveredCell.bottom.x, hoveredCell.bottom.y);
      topFace.lineTo(hoveredCell.left.x, hoveredCell.left.y);
      topFace.lineTo(hoveredCell.top.x, hoveredCell.top.y);
      ctx.stroke(topFace);
      ctx.fill(topFace);
    }

    drawTile() {
      const { ctx, isMouseDown, tileHalfHeight, tileHalfWidth, tileWidth, yStart, xStart, hoverTileX, hoverTileY, cells, rows, currentPos, targetPos, tileType } = baseSettings;
      const xScreen = xStart + (this.rowNumber - this.cellNumber) * tileHalfWidth;
      const yScreen = yStart + (this.rowNumber + this.cellNumber) * tileHalfHeight;
      const xBottom = xScreen - tileHalfWidth;
      const yBottom = yScreen + tileHalfHeight;
      const xLeft = xScreen - tileWidth;
      const xTop = xScreen - tileHalfWidth;
      const yTop = yScreen - tileHalfHeight;
      let yShift = 0;

      this.tileCoords.top = yTop - yShift //top corner y coords
      this.tileCoords.right = xScreen //right corner x coords
      this.tileCoords.bottom = yBottom - yShift //bottom corner y coords
      this.tileCoords.left = xLeft //left corner x coords

      this.tilePoints.right.x = xScreen;
      this.tilePoints.right.y = yScreen - yShift;

      this.tilePoints.left.x = xLeft;
      this.tilePoints.left.y = yScreen - yShift;

      this.tilePoints.bottom.x = xBottom;
      this.tilePoints.bottom.y = yBottom - yShift;

      this.tilePoints.top.x = xTop;
      this.tilePoints.top.y = yTop - yShift;

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
      ctx.fillStyle = 'blue';
      this.drawHoverTile(targetPos.x, targetPos.y, tileType.target);
      // this.drawHoverTile(currentPos.x, currentPos.y, tileType.current);
      this.moveCurrentToTarget(currentPos, targetPos)
      if (hoverTileX >= 0 && hoverTileY >= 0 && hoverTileX <= cells - 1 && hoverTileY <= rows - 1) {
        this.drawHoverTile(hoverTileX, hoverTileY, tileType.hover);
      }
      ctx.closePath();

      
    }
  }

  // helper functions section //


  const getMousePosition = (canvas, mouseEvent) => {

    const rect = canvas.getBoundingClientRect();
    return {
      x: mouseEvent.clientX - rect.left,
      y: mouseEvent.clientY - rect.top
    }
  };

  const getTileColorByType = (type) => {

    const { tileType, currentFill, hoverFill, targetFill } = baseSettings

    switch (type) {
      case tileType.current: {
        return currentFill
        break;
      }
      case tileType.hover: {
        return hoverFill
        break;
      }
      case tileType.target: {
        return targetFill
        break;
      }
    }
  };

  // helper functions section //


  const grid = new Grid(10, 10);
  grid.setup();
  grid.displayGrid();
  grid.updateHover();

  window.gridDebug = grid;

  console.log(grid);

  window.onresize = () => {
    grid.setup();
  };

  window.onkeydown = (keyboardEvent) => {
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

  window.onmousemove = (mouseEvent) => {
    const { canvas } = baseSettings;
    baseSettings.mousePosition = getMousePosition(canvas, mouseEvent)
  };

  window.onclick = () => {
    const { targetPos, hoverTileX, hoverTileY,currentPos } = baseSettings;
    console.log('targetPos', {
      targetPos
    })
    if (targetPos.x !== -1 && targetPos.y !== -1) {
      baseSettings.currentPos.x = targetPos.x; 
      baseSettings.currentPos.y = targetPos.y; 
    }
    
    targetPos.x = hoverTileX;
    targetPos.y = hoverTileY;
    console.log('baseSettings', { baseSettings, currentPos, targetPos });
  }

})(window);