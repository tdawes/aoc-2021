const fs = require("fs");
const { promisify } = require("util");
const path = require("path");
const _ = require("lodash");

const readFile = promisify(fs.readFile);

const readInput = async () => readFile(path.join(__dirname, "input"), "utf-8");

const parse = (input) => {
  const [linesPart, foldsPart] = input.split("\n\n");
  const lines = linesPart.split("\n");
  const positions = [];
  for (const line of lines) {
    const [x, y] = line.split(",").map((x) => parseInt(x, 10));
    positions.push([x, y]);
  }
  const maxX = _.max(positions.map(([x]) => x));
  const maxY = _.max(positions.map(([, y]) => y));

  const grid = _.range(0, maxX + 1).map((i) =>
    _.range(0, maxY + 1).map(() => false),
  );

  for (const [x, y] of positions) {
    grid[x][y] = true;
  }

  const folds = [];
  const foldLines = foldsPart.split("\n");
  for (const f of foldLines) {
    const [, type, position] = /^fold along (x|y)=(\d+)$/.exec(f);
    if (type === "x") {
      folds.push({ vertical: true, position: parseInt(position, 10) });
    } else {
      folds.push({ vertical: false, position: parseInt(position, 10) });
    }
  }

  return { grid, folds };
};

const transpose = (grid) =>
  _.range(0, grid[0].length).map((y) =>
    _.range(0, grid.length).map((x) => grid[x][y]),
  );

const verticalFold = (grid, position) => {
  const newGrid = _.range(0, position).map((x) =>
    _.range(0, grid[x].length).map((y) => grid[x][y]),
  );
  for (let i = 1; i <= position; i++) {
    for (let j = 0; j <= grid[i].length; j++) {
      newGrid[position - i][j] = grid[position - i][j] || grid[position + i][j];
    }
  }
  return newGrid;
};

const applyFold = (grid, fold) => {
  if (fold.vertical) {
    return verticalFold(grid, fold.position);
  } else {
    return transpose(verticalFold(transpose(grid), fold.position));
  }
};

const part1 = async () => {
  const input = await readInput();
  let { grid, folds } = parse(input);

  grid = applyFold(grid, folds[0]);
  return grid.flat().filter((x) => !!x).length;
};

const part2 = async () => {
  const input = await readInput();
  let { grid, folds } = parse(input);

  for (const fold of folds) {
    grid = applyFold(grid, fold);
  }

  return transpose(grid)
    .map((row) => row.map((c) => (c ? "#" : " ")).join(""))
    .join("\n");
};

part1().then(console.log).then(part2).then(console.log);
