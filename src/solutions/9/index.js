const fs = require("fs");
const { promisify } = require("util");
const path = require("path");
const _ = require("lodash");
const { toLower } = require("lodash");

const readFile = promisify(fs.readFile);

const readInput = async () => readFile(path.join(__dirname, "input"), "utf-8");

const parse = (input) =>
  input.split("\n").map((line) => line.split("").map((x) => parseInt(x, 10)));

const neighbours = (grid, [x, y]) =>
  [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
  ]
    .map(([dx, dy]) => [x + dx, y + dy])
    .filter(
      ([nx, ny]) =>
        0 <= ny && ny < grid.length && 0 <= nx && nx < grid[ny].length,
    );

const part1 = async () => {
  const input = await readInput();
  const grid = parse(input);
  const range = _.range(0, grid.length).flatMap((y) =>
    _.range(0, grid[y].length).map((x) => [x, y]),
  );
  const lowest = range.filter(([x, y]) =>
    neighbours(grid, [x, y]).every(([nx, ny]) => grid[ny][nx] > grid[y][x]),
  );
  const riskScores = lowest.map(([x, y]) => grid[y][x] + 1);
  return _.sum(riskScores);
};

const part2 = async () => {
  const input = await readInput();
  const grid = parse(input);
  const range = _.range(0, grid.length).flatMap((y) =>
    _.range(0, grid[y].length).map((x) => [x, y]),
  );
  const lowest = range.filter(([x, y]) =>
    neighbours(grid, [x, y]).every(([nx, ny]) => grid[ny][nx] > grid[y][x]),
  );

  const basins = lowest.map(([x, y]) => {
    const visited = new Set();
    const toVisit = [[x, y]];
    while (toVisit.length > 0) {
      const [cx, cy] = toVisit.shift();
      visited.add(`(${cx},${cy})`);
      const ns = neighbours(grid, [cx, cy]);
      toVisit.push(
        ...ns.filter(
          ([nx, ny]) => grid[ny][nx] != 9 && !visited.has(`(${nx},${ny})`),
        ),
      );
    }
    return visited.size;
  });

  return basins
    .sort((a, b) => b - a)
    .slice(0, 3)
    .reduce((a, b) => a * b, 1);
};

part1().then(console.log).then(part2).then(console.log);
