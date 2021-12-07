const fs = require("fs");
const { promisify } = require("util");
const path = require("path");
const _ = require("lodash");

const readFile = promisify(fs.readFile);

const readInput = async () => readFile(path.join(__dirname, "input"), "utf-8");

const parse = (input) => {
  const fish = input.split(",").map((x) => parseInt(x, 10));
  const counts = _.range(0, 9).map((x) => fish.filter((y) => x === y).length);
  return counts;
};

const rotate = (array) => {
  array.push(array.shift());
};

const part1 = async () => {
  const input = await readInput();
  const counts = parse(input);
  for (let t = 0; t < 80; t++) {
    rotate(counts);
    counts[6] += counts[8];
  }
  return _.sum(counts);
};

const part2 = async () => {
  const input = await readInput();
  const counts = parse(input);
  for (let t = 0; t < 256; t++) {
    rotate(counts);
    counts[6] += counts[8];
  }
  return _.sum(counts);
};

part1().then(console.log).then(part2).then(console.log);
