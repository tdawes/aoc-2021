const fs = require("fs");
const { promisify } = require("util");
const path = require("path");
const _ = require("lodash");
const readFile = promisify(fs.readFile);

const readInput = async () => readFile(path.join(__dirname, "input"), "utf-8");

const parse = (input) =>
  input.split("\n").map((line) => {
    const [, state, minX, maxX, minY, maxY, minZ, maxZ] =
      /^(on|off) x=(-?\d+)..(-?\d+),y=(-?\d+)..(-?\d+),z=(-?\d+)..(-?\d+)$/.exec(
        line,
      );
    return {
      on: state === "on",
      x: [parseInt(minX, 10), parseInt(maxX, 10) + 1],
      y: [parseInt(minY, 10), parseInt(maxY, 10) + 1],
      z: [parseInt(minZ, 10), parseInt(maxZ, 10) + 1],
    };
  });

const run = async () => {
  const input = await readInput();
  const parsed = parse(input);

  return parsed;
};

const intersection = ([x1, x2], [x3, x4]) => {
  const left = Math.max(x1, x3);
  const right = Math.min(x2, x4);
  return right > left ? [left, right] : null;
};

const getVolume = (cube) =>
  (cube.x[1] - cube.x[0]) * (cube.y[1] - cube.y[0]) * (cube.z[1] - cube.z[0]);

const getUnique = (cube, others) => getVolume(cube) - getOverlap(cube, others);

const getOverlap = (cube, others) => {
  let count = 0;
  for (let i = 0; i < others.length; i++) {
    const other = others[i];

    const xOverlap = intersection(cube.x, other.x);
    const yOverlap = intersection(cube.y, other.y);
    const zOverlap = intersection(cube.z, other.z);

    if (xOverlap != null && yOverlap != null && zOverlap != null) {
      const overlap = { x: xOverlap, y: yOverlap, z: zOverlap };

      count += getVolume(overlap) - getOverlap(overlap, others.slice(0, i));
    }
  }
  return count;
};

const key = (x, y, z) => `(${x},${y},${z})`;

const part1 = async (cubes) => {
  const reactor = {};
  for (const cube of cubes) {
    for (let x = Math.max(cube.x[0], -50); x < Math.min(cube.x[1], 51); x++) {
      for (let y = Math.max(cube.y[0], -50); y < Math.min(cube.y[1], 51); y++) {
        for (
          let z = Math.max(cube.z[0], -50);
          z < Math.min(cube.z[1], 51);
          z++
        ) {
          reactor[key(x, y, z)] = cube.on;
        }
      }
    }
  }
  return Object.values(reactor).filter((x) => !!x).length;
};

const part2 = async (cubes) => {
  let count = 0;
  for (let i = cubes.length - 1; i >= 0; i--) {
    const cube = cubes[i];
    if (cube.on) {
      count += getUnique(cube, cubes.slice(i + 1));
    }
  }
  return count;
};

run().then((result) =>
  part1(result)
    .then(console.log)
    .then(() => part2(result))
    .then(console.log),
);
