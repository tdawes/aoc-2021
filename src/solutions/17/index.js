const fs = require("fs");
const { promisify } = require("util");
const path = require("path");
const _ = require("lodash");
const readFile = promisify(fs.readFile);

const readInput = async () => readFile(path.join(__dirname, "input"), "utf-8");

const parse = (input) => {
  const [minX, maxX, minY, maxY] =
    /^target area: x=(-?\d+)..(-?\d+), y=(-?\d+)..(-?\d+)$/
      .exec(input)
      .slice(1)
      .map((x) => parseInt(x, 10));
  return {
    minX,
    maxX,
    minY,
    maxY,
  };
};

const simulate = (x, y, range) => {
  let speed = [x, y];
  let pos = [0, 0];
  while (pos[0] <= range.maxX && pos[1] >= range.minY) {
    pos[0] += speed[0];
    pos[1] += speed[1];
    if (speed[0] > 0) {
      speed[0] -= 1;
    }
    speed[1] -= 1;

    if (
      range.minX <= pos[0] &&
      pos[0] <= range.maxX &&
      range.minY <= pos[1] &&
      pos[1] <= range.maxY
    ) {
      return true;
    }
  }
  return false;
};

const part1 = async () => {
  const input = await readInput();
  const { minY } = parse(input);
  return (Math.abs(minY) * (Math.abs(minY) - 1)) / 2;
};

const part2 = async () => {
  const input = await readInput();
  const range = parse(input);
  const { minX, maxX, minY } = range;
  const lowerBoundX = Math.ceil((-1 + Math.sqrt(1 + 8 * minX)) / 2);
  const upperBoundX = maxX;
  const lowerBoundY = minY;
  const upperBoundY = -minY - 1;

  const hits = [];
  for (let x = lowerBoundX; x <= upperBoundX; x++) {
    for (let y = lowerBoundY; y <= upperBoundY; y++) {
      const isHit = simulate(x, y, range);
      if (isHit) {
        hits.push([x, y]);
      }
    }
  }
  return hits.length;
};

part1().then(console.log).then(part2).then(console.log);
