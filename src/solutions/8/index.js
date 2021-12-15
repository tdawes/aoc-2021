const fs = require("fs");
const { promisify } = require("util");
const path = require("path");
const _ = require("lodash");

const readFile = promisify(fs.readFile);

const readInput = async () => readFile(path.join(__dirname, "input"), "utf-8");

const parse = (input) => {
  const lines = input.split("\n");
  return lines.map((line) => {
    const [head, tail] = line.split(" | ");
    return {
      digits: head.split(" ").map((w) => w.split("").sort()),
      output: tail.split(" ").map((w) => w.split("").sort()),
    };
  });
};

const digits = {
  0: ["a", "b", "c", "e", "f", "g"],
  1: ["c", "f"],
  2: ["a", "c", "d", "e", "g"],
  3: ["a", "c", "d", "f", "g"],
  4: ["b", "c", "d", "f"],
  5: ["a", "b", "d", "f", "g"],
  6: ["a", "b", "d", "e", "f", "g"],
  7: ["a", "c", "f"],
  8: ["a", "b", "c", "d", "e", "f", "g"],
  9: ["a", "b", "c", "d", "f", "g"],
};

const uniqueDigits = [1, 4, 7, 8];

const part1 = async () => {
  const input = await readInput();
  const lines = parse(input);
  const sum = _.sum(
    lines.map(
      (line) =>
        line.output.filter((o) =>
          uniqueDigits.map((d) => digits[d].length).includes(o.length),
        ).length,
    ),
  );
  return sum;
};

const part2 = async () => {
  const input = await readInput();
  const lines = parse(input);

  return _.sum(
    lines.map((line) => {
      const mapping = {};
      for (const d of uniqueDigits) {
        const length = digits[d].length;
        mapping[d] = line.digits.find((word) => word.length === length);
      }
      const zeroSixOrNine = line.digits.filter((word) => word.length === 6);

      mapping[9] = zeroSixOrNine.find(
        (word) => _.intersection(word, mapping[4]).length === 4,
      );
      const zeroOrSix = zeroSixOrNine.filter((word) => word !== mapping[9]);
      mapping[0] = zeroOrSix.find(
        (word) => _.intersection(word, mapping[7]).length === 3,
      );
      mapping[6] = zeroOrSix.find((word) => word !== mapping[0]);

      const twoThreeOrFive = line.digits.filter((word) => word.length === 5);
      mapping[3] = twoThreeOrFive.find(
        (word) => _.intersection(word, mapping[1]).length === 2,
      );

      const twoOrFive = twoThreeOrFive.filter((word) => word !== mapping[3]);
      mapping[5] = twoOrFive.find(
        (word) => _.intersection(word, mapping[4]).length === 3,
      );
      mapping[2] = twoOrFive.find((word) => word !== mapping[5]);

      const output = line.output.map((o) =>
        Object.keys(mapping).find((key) => _.isEqual(mapping[key], o)),
      );
      const parsed = parseInt(output.join(""));

      return parsed;
    }),
  );
};

part1().then(console.log).then(part2).then(console.log);
