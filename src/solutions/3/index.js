const fs = require("fs");
const { promisify } = require("util");
const path = require("path");
const _ = require("lodash");

const readFile = promisify(fs.readFile);

const readInput = async () => readFile(path.join(__dirname, "input"), "utf-8");

const parse = (input) =>
  input.split("\n").map((line) => line.split("").map((c) => parseInt(c, 10)));

const fromBinary = (numbers) => parseInt(numbers.join(""), 2);

const mostCommonBit = (numbers, i) =>
  Math.round(_.sum(numbers.map((number) => number[i])) / numbers.length);

const findRating = (numbers, mostCommon) => {
  let i = 0;
  let valid = numbers.slice(0);
  while (valid.length > 1) {
    const target = mostCommon
      ? mostCommonBit(valid, i)
      : 1 - mostCommonBit(valid, i);
    valid = valid.filter((n) => n[i] === target);
    i++;
  }
  return valid[0];
};

const part1 = async () => {
  const input = await readInput();
  const numbers = parse(input);
  const gamma = _.range(0, numbers[0].length).map((i) =>
    mostCommonBit(numbers, i),
  );
  const epsilon = gamma.map((c) => 1 - c);
  return fromBinary(gamma) * fromBinary(epsilon);
};

const part2 = async () => {
  const input = await readInput();
  const numbers = parse(input);
  const oxygenGeneratorRating = findRating(numbers, true);
  const co2ScrubberRating = findRating(numbers, false);

  return fromBinary(oxygenGeneratorRating) * fromBinary(co2ScrubberRating);
};

part1().then(console.log).then(part2).then(console.log);
