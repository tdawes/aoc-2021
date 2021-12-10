const fs = require("fs");
const { promisify } = require("util");
const path = require("path");
const _ = require("lodash");
const { toLower, result } = require("lodash");

const readFile = promisify(fs.readFile);

const readInput = async () => readFile(path.join(__dirname, "input"), "utf-8");

const parse = (input) => input.split("\n").map((line) => line.split(""));

const characters = {
  "(": ")",
  "[": "]",
  "<": ">",
  "{": "}",
};

const scores = {
  ")": 3,
  "]": 57,
  "}": 1197,
  ">": 25137,
};

const incompleteScore = {
  ")": 1,
  "]": 2,
  "}": 3,
  ">": 4,
};

const assess = (line) => {
  const stack = [];
  for (let character of line) {
    if (Object.keys(characters).includes(character)) {
      stack.push([character]);
    } else {
      const opening = stack.pop();
      if (character !== characters[opening]) {
        return { line, type: "corrupted", score: scores[character] };
      }
    }
  }
  if (stack.length > 0) {
    let score = 0;
    while (stack.length > 0) {
      const next = stack.pop();
      score *= 5;
      score += incompleteScore[characters[next]];
    }
    return { line, type: "incomplete", score };
  }
  return { line, type: "complete", score: 0 };
};

const part1 = async () => {
  const input = await readInput();
  const lines = parse(input);
  return _.sum(
    lines
      .map(assess)
      .filter((result) => result.type === "corrupted")
      .map((result) => result.score),
  );
};

const part2 = async () => {
  const input = await readInput();
  const lines = parse(input);
  const scores = lines
    .map(assess)
    .filter((result) => result.type === "incomplete")
    .map((result) => result.score);
  const sorted = scores.sort((a, b) => a - b);
  return sorted[(sorted.length - 1) / 2];
};

part1().then(console.log).then(part2).then(console.log);
