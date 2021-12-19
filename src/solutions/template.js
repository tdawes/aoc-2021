const fs = require("fs");
const { promisify } = require("util");
const path = require("path");
const _ = require("lodash");
const readFile = promisify(fs.readFile);

const readInput = async () => readFile(path.join(__dirname, "input"), "utf-8");

const parse = (input) => input;

const run = async () => {
  const input = await readInput();
  const parsed = parse(input);

  return parsed;
};

const part1 = async (input) => {};

const part2 = async (input) => {};

run().then((result) =>
  part1(result)
    .then(console.log)
    .then(() => part2(result))
    .then(console.log),
);
