const fs = require("fs");
const { promisify } = require("util");
const path = require("path");
const _ = require("lodash");

const readFile = promisify(fs.readFile);

const readInput = async () => readFile(path.join(__dirname, "input"), "utf-8");

const parse = (input) =>
  input.split("\n").map((line) => line.split("").map((x) => parseInt(x, 10)));

const distance = (from, to) =>
  Math.abs(from[0] - to[0]) + Math.abs(from[1] - to[1]);

const getNeighbours = ([x, y], map) =>
  [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ]
    .map(([dx, dy]) => [x + dx, y + dy])
    .filter(
      ([nx, ny]) =>
        0 <= ny && ny < map.length && 0 <= nx && nx < map[ny].length,
    );

const key = ([x, y]) => `(${x},${y})`;

const aStar = (map, from, to) => {
  const g = { [key(from)]: { distance: 0, path: [] } };
  const f = { [key(from)]: 10 * distance(from, to) };

  let toVisit = [from];

  while (toVisit.length > 0) {
    const current = _.minBy(toVisit, (node) => f[key(node)] ?? Infinity);
    toVisit = toVisit.filter((n) => n !== current);
    if (_.isEqual(current, to)) {
      return [...g[key(current)].path, current];
    }
    const neighbours = getNeighbours(current, map);
    neighbours.forEach((n) => {
      const newG = g[key(current)].distance + map[n[1]][n[0]];
      const prevG = g[key(n)]?.distance ?? Infinity;
      if (newG < prevG) {
        g[key(n)] = {
          distance: newG,
          path: [...g[key(current)].path, current],
        };
        f[key(n)] = newG + distance(n, to);
        if (!toVisit.some((other) => _.isEqual(other, n))) {
          toVisit.push(n);
        }
      }
    });
  }
};

const round = (x) => (x <= 9 ? x : ((x - 1) % 9) + 1);

const part1 = async () => {
  const input = await readInput();
  const map = parse(input);
  const path = aStar(map, [0, 0], [map.length - 1, map.length - 1]);
  return _.sum(path.slice(1).map(([x, y]) => map[y][x]));
};

const part2 = async () => {
  const input = await readInput();
  const map = parse(input);
  const fullMap = _.range(0, 5 * map.length).map((y) =>
    _.range(0, 5 * map[y % map.length].length).map((x) =>
      round(
        map[y % map.length][x % map[y % map.length].length] +
          Math.floor(y / map.length) +
          Math.floor(x / map[y % map.length].length),
      ),
    ),
  );
  const path = aStar(fullMap, [0, 0], [5 * map.length - 1, 5 * map.length - 1]);
  return _.sum(path.slice(1).map(([x, y]) => fullMap[y][x]));
};

part1().then(console.log).then(part2).then(console.log);
