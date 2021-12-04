const fs = require("fs");
const { promisify } = require("util");
const path = require("path");
const _ = require("lodash");

const readFile = promisify(fs.readFile);

const readInput = async () => readFile(path.join(__dirname, "input"), "utf-8");

const parse = (input) => {
  const [numbersInput, ...gridsInput] = input.split("\n\n");
  const numbers = numbersInput.split(",").map((x) => parseInt(x, 10));
  const grids = gridsInput.map((gridInput) =>
    gridInput.split("\n").map((line) =>
      line
        .trim()
        .split(/\s+/)
        .map((c) => ({ value: parseInt(c, 10), marked: false })),
    ),
  );

  return { numbers, grids };
};

const score = (grid) =>
  _.sum(
    grid.map((row) =>
      _.sum(row.filter((cell) => !cell.marked).map((cell) => cell.value)),
    ),
  );

const flip = (grid) =>
  _.range(0, grid[0].length).map((j) =>
    _.range(0, grid.length).map((i) => grid[i][j]),
  );

const part1 = async () => {
  const input = await readInput();
  const { numbers, grids } = parse(input);
  for (const number of numbers) {
    // Update grids
    for (const grid of grids) {
      for (const line of grid) {
        for (const cell of line) {
          if (cell.value === number) {
            cell.marked = true;
          }
        }
      }
    }

    // Check for win
    for (const grid of grids) {
      for (const col of grid) {
        if (col.every((cell) => cell.marked)) {
          return score(grid) * number;
        }
      }
      for (const row of flip(grid)) {
        if (row.every((cell) => cell.marked)) {
          return score(grid) * number;
        }
      }
    }
  }
};

const part2 = async () => {
  const input = await readInput();
  let { numbers, grids } = parse(input);
  let lastScore = undefined;
  for (const number of numbers) {
    // Update grids
    for (const grid of grids) {
      for (const line of grid) {
        for (const cell of line) {
          if (cell.value === number) {
            cell.marked = true;
          }
        }
      }
    }

    // Check for win
    const grids2 = grids.slice(0);
    for (const grid of grids2) {
      for (const col of grid) {
        if (col.every((cell) => cell.marked)) {
          lastScore = score(grid) * number;
          grids = grids.filter((grid2) => grid2 !== grid);
        }
      }
      for (const row of flip(grid)) {
        if (row.every((cell) => cell.marked)) {
          lastScore = score(grid) * number;
          grids = grids.filter((grid2) => grid2 !== grid);
        }
      }
    }
  }
  return lastScore;
};

part1().then(console.log).then(part2).then(console.log);
