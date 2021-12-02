const fs = require("fs");
const { promisify } = require("util");
const path = require("path");

const readFile = promisify(fs.readFile);

const readInput = async () => readFile(path.join(__dirname, "input"), "utf-8");

const parse = (input) =>
  input.split("\n").map((line) => {
    const [, command, value] = /^(up|forward|down) (\d+)$/.exec(line);
    return { direction: command, distance: parseInt(value, 10) };
  });

const part1 = async () => {
  const input = await readInput();
  const instructions = parse(input);
  const position = [0, 0];
  for (const instruction of instructions) {
    if (instruction.direction === "up") {
      position[1] -= instruction.distance;
    } else if (instruction.direction === "down") {
      position[1] += instruction.distance;
    } else if (instruction.direction === "forward") {
      position[0] += instruction.distance;
    }
  }
  return position[0] * position[1];
};

const part2 = async () => {
  const input = await readInput();
  const instructions = parse(input);
  const position = [0, 0];
  let aim = 0;
  for (const instruction of instructions) {
    if (instruction.direction === "up") {
      aim -= instruction.distance;
    } else if (instruction.direction === "down") {
      aim += instruction.distance;
    } else if (instruction.direction === "forward") {
      position[0] += instruction.distance;
      position[1] += instruction.distance * aim;
    }
  }
  return position[0] * position[1];
};

part1().then(console.log).then(part2).then(console.log);
