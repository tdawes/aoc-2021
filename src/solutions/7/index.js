const fs = require("fs");
const { promisify } = require("util");
const path = require("path");
const _ = require("lodash");

const readFile = promisify(fs.readFile);

const readInput = async () => readFile(path.join(__dirname, "input"), "utf-8");

const parse = (input) => input.split(",").map((x) => parseInt(x, 10));

const part1 = async () => {
  const input = await readInput();
  const crabs = parse(input);
  crabs.sort((a, b) => a - b);
  const median = crabs[Math.floor(crabs.length / 2)];
  const fuel = _.sum(crabs.map((crab) => Math.abs(crab - median)));
  return fuel;
};

const part2 = async () => {
  const input = await readInput();
  const crabs = parse(input);

  const fuel = _.min(
    _.range(_.min(crabs), _.max(crabs) + 1).map((p) =>
      _.sum(
        crabs.map((crab) => {
          const x = Math.abs(crab - p);
          return (x * (x + 1)) / 2;
        }),
      ),
    ),
  );

  return fuel;
};

part1().then(console.log).then(part2).then(console.log);
