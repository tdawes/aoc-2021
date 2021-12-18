const fs = require("fs");
const { promisify } = require("util");
const path = require("path");
const _ = require("lodash");
const readFile = promisify(fs.readFile);

const readInput = async () => readFile(path.join(__dirname, "input"), "utf-8");

const parse = (input) =>
  input.split("\n").map((line) =>
    line
      .replace(/\[/g, ".[.")
      .replace(/\]/g, ".].")
      .split(/\.|,/)
      .filter((x) => x.length > 0)
      .map((c) => (["[", "]"].includes(c) ? c : parseInt(c, 10))),
  );

const reduce = (number) => {
  let hasChanged;
  do {
    hasChanged = tryReduce(number);
  } while (hasChanged);
};

const tryReduce = (number) => {
  const hasExploded = tryExplode(number);
  if (hasExploded) {
    return true;
  }

  const hasSplit = trySplit(number);
  if (hasSplit) {
    return true;
  }

  return false;
};

const findPreviousNumber = (number, index) => {
  for (let i = index; i >= 0; i--) {
    if (typeof number[i] === "number") {
      return i;
    }
  }
};

const findNextNumber = (number, index) => {
  for (let i = index; i < number.length; i++) {
    if (typeof number[i] === "number") {
      return i;
    }
  }
};

const tryExplode = (number) => {
  let depth = 0;
  for (let i = 0; i < number.length; i++) {
    const c = number[i];
    if (c === "[") {
      depth++;
      if (
        depth > 4 &&
        typeof number[i + 1] === "number" &&
        typeof number[i + 2] === "number"
      ) {
        const previous = findPreviousNumber(number, i);
        const next = findNextNumber(number, i + 3);

        if (previous != null) {
          number[previous] += number[i + 1];
        }

        if (next != null) {
          number[next] += number[i + 2];
        }

        number.splice(i, 4, 0);
        return true;
      }
    } else if (c === "]") {
      depth--;
    }
  }
};

const trySplit = (number) => {
  for (let i = 0; i < number.length; i++) {
    const c = number[i];
    if (typeof c === "number" && c >= 10) {
      number.splice(i, 1, "[", Math.floor(c / 2), Math.ceil(c / 2), "]");
      return true;
    }
  }
};

const magnitude = (number) => {
  const next = number.shift();
  if (typeof next === "number") {
    return next;
  } else if (next === "[") {
    const first = magnitude(number);
    const second = magnitude(number);
    number.shift();
    return 3 * first + 2 * second;
  }
};

const sum = (first, second) => ["[", ...first, ...second, "]"];

const part1 = async () => {
  const input = await readInput();
  const parsed = parse(input);

  let [first, ...rest] = parsed;
  while (rest.length > 0) {
    const next = rest.shift();
    first = sum(first, next);
    reduce(first);
  }

  return magnitude(first);
};

const part2 = async () => {
  const input = await readInput();
  const parsed = parse(input);

  let max = 0;
  for (let i = 0; i < parsed.length; i++) {
    for (let j = 0; j < parsed.length; j++) {
      if (i === j) {
        continue;
      }

      const first = [...parsed[i]];
      const second = [...parsed[j]];
      const total = sum(first, second);
      reduce(total);
      const mag = magnitude(total);
      if (mag >= max) {
        max = mag;
      }
    }
  }
  return max;
};

part1().then(console.log).then(part2).then(console.log);
