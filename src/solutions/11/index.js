const fs = require("fs");
const { promisify } = require("util");
const path = require("path");
const _ = require("lodash");

const readFile = promisify(fs.readFile);

const readInput = async () => readFile(path.join(__dirname, "input"), "utf-8");

const parse = (input) =>
  input
    .split("\n")
    .map((line) =>
      line
        .split("")
        .map((x) => ({ energy: parseInt(x, 10), hasFlashed: false })),
    );

const neighbours = (grid, x, y) =>
  [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ]
    .map(([dx, dy]) => [x + dx, y + dy])
    .filter(
      ([nx, ny]) =>
        0 <= ny && ny < grid.length && 0 <= nx && nx < grid[ny].length,
    );

const simulate = (octopi) => {
  octopi.forEach((row) => {
    row.forEach((o) => {
      o.energy += 1;
    });
  });

  let isFlashing = true;
  while (isFlashing) {
    isFlashing = false;
    for (let y = 0; y < octopi.length; y++) {
      for (let x = 0; x < octopi[y].length; x++) {
        const octopus = octopi[y][x];
        if (octopus.energy > 9 && !octopus.hasFlashed) {
          isFlashing = true;
          octopus.hasFlashed = true;
          neighbours(octopi, x, y).forEach(([nx, ny]) => {
            octopi[ny][nx].energy += 1;
          });
          break;
        }
      }
      if (isFlashing) {
        break;
      }
    }
  }
};

const reset = (octopi) => {
  octopi.forEach((row) => {
    row.forEach((o) => {
      if (o.energy > 9) {
        o.hasFlashed = false;
        o.energy = 0;
      }
    });
  });
};

const part1 = async () => {
  const input = await readInput();
  let octopi = parse(input);
  let totalFlashes = 0;

  for (let t = 0; t < 100; t++) {
    simulate(octopi);

    const numFlashers = octopi.flat().filter((o) => o.hasFlashed).length;
    totalFlashes += numFlashers;

    reset(octopi);
  }

  return totalFlashes;
};

const part2 = async () => {
  const input = await readInput();
  let octopi = parse(input);

  for (let t = 1; ; t++) {
    simulate(octopi);

    if (octopi.every((row) => row.every((o) => o.hasFlashed))) {
      return t;
    }

    reset(octopi);
  }
};

part1().then(console.log).then(part2).then(console.log);
