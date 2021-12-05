const fs = require("fs");
const { promisify } = require("util");
const path = require("path");
const _ = require("lodash");

const readFile = promisify(fs.readFile);

const readInput = async () => readFile(path.join(__dirname, "input"), "utf-8");

const parse = (input) => {
  const lines = input.split("\n");
  return lines.map((line) => {
    const [x1, y1, x2, y2] = /^(\d+),(\d+) -> (\d+),(\d+)$/
      .exec(line)
      .slice(1)
      .map((x) => parseInt(x));

    const length = Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2));
    const direction = { x: (x2 - x1) / length, y: (y2 - y1) / length };
    return { from: { x: x1, y: y1 }, to: { x: x2, y: y2 }, length, direction };
  });
};

const part1 = async () => {
  const input = await readInput();
  const lines = parse(input);
  const straightLines = lines.filter(
    (line) => line.from.x === line.to.x || line.from.y === line.to.y,
  );

  const grid = {};
  for (const line of straightLines) {
    for (let t = 0; t <= line.length; t++) {
      const x = line.from.x + t * line.direction.x;
      const y = line.from.y + t * line.direction.y;
      const key = `(${x},${y})`;
      grid[key] = (grid[key] ?? 0) + 1;
    }
  }

  return Object.values(grid).filter((x) => x >= 2).length;
};

const part2 = async () => {
  const input = await readInput();
  let lines = parse(input);
  const grid = {};
  for (const line of lines) {
    for (let t = 0; t <= line.length; t++) {
      const x = line.from.x + t * line.direction.x;
      const y = line.from.y + t * line.direction.y;
      const key = `(${x},${y})`;
      grid[key] = (grid[key] ?? 0) + 1;
    }
  }

  return Object.values(grid).filter((x) => x >= 2).length;
};

part1().then(console.log).then(part2).then(console.log);
