const fs = require("fs");
const { promisify } = require("util");
const path = require("path");

const readFile = promisify(fs.readFile);

const readInput = async () => readFile(path.join(__dirname, "input"), "utf-8");

const parse = (input) => {
  const depths = input.split("\n").map(x => parseInt(x, 10));
  return depths;
};

// Part 1
const part1 = async () => {
  const input = await readInput();
const depths = parse(input);
  const [head, ...tail] = depths;
  let previous = head;
  let count = 0;
  for (let depth of tail) {
    if (depth > previous) {
      count++;
    }
    previous = depth;
  }
  return count;
};

//Part 2
const part2 = async () => {
  const input = await readInput();
  const depths = parse(input);
  let previous = Infinity;
  let count = 0;
  for (let i = 0; i < depths.length - 2; i++) {
    const [first, second, third] = depths.slice(i, i + 3);
    const sum = first + second + third;
    if (sum > previous) {
      count++;
    }
    previous = sum;
  }
  return count;
};

part1().then(console.log).then(part2).then(console.log);
