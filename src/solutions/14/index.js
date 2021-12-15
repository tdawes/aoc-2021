const fs = require("fs");
const { promisify } = require("util");
const path = require("path");
const _ = require("lodash");

const readFile = promisify(fs.readFile);

const readInput = async () => readFile(path.join(__dirname, "input"), "utf-8");

const parse = (input) => {
  const [starting, rulesPart] = input.split("\n\n");
  const rules = rulesPart.split("\n").map((line) => {
    const [, left, right, product] = /^(\w)(\w) -> (\w)$/.exec(line);
    return { left, right, product };
  });
  return { polymer: starting.split(""), rules };
};

const inc = (dict, key, amount = 1) => {
  dict[key] = (dict[key] ?? 0) + amount;
};

const advance = (polymer, rules) => {
  const newPolymer = [polymer[0]];
  for (let i = 1; i < polymer.length; i++) {
    const left = polymer[i - 1];
    const right = polymer[i];
    const rule = rules.find((r) => r.left === left && r.right === right);
    if (rule == null) {
      continue;
    }
    newPolymer.push(rule.product, right);
  }
  return newPolymer;
};

const countPairs = (polymer) => {
  let polymerCount = {};
  for (let i = 1; i < polymer.length; i++) {
    const key = `${polymer[i - 1]}${polymer[i]}`;
    inc(polymerCount, key);
  }
  return polymerCount;
};

const advanceCount = (polymerCount, rules) => {
  const newPolymerCount = {};
  for (const key of Object.keys(polymerCount)) {
    const [left, right] = key.split("");
    const rule = rules.find((r) => r.left === left && r.right === right);
    inc(
      newPolymerCount,
      `${left}${rule.product}`,
      polymerCount[`${left}${right}`],
    );
    inc(
      newPolymerCount,
      `${rule.product}${right}`,
      polymerCount[`${left}${right}`],
    );
  }
  return newPolymerCount;
};

const part1 = async () => {
  const input = await readInput();
  let { polymer, rules } = parse(input);

  for (let t = 0; t < 10; t++) {
    polymer = advance(polymer, rules);
  }

  const count = _.countBy(polymer);
  return _.max(Object.values(count)) - _.min(Object.values(count));
};

const part2 = async () => {
  const input = await readInput();
  const { polymer, rules } = parse(input);

  let polymerCount = countPairs(polymer);

  for (let t = 0; t < 40; t++) {
    polymerCount = advanceCount(polymerCount, rules);
  }

  const count = Object.keys(polymerCount).reduce(
    (acc, key) => ({
      ...acc,
      [key[1]]: (acc[key[1]] ?? 0) + polymerCount[key],
    }),
    { [polymer[0]]: 1 },
  );
  return _.max(Object.values(count)) - _.min(Object.values(count));
};

part1().then(console.log).then(part2).then(console.log);
