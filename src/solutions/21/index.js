const fs = require("fs");
const { promisify } = require("util");
const path = require("path");
const _ = require("lodash");
const readFile = promisify(fs.readFile);

const readInput = async () => readFile(path.join(__dirname, "input"), "utf-8");

const parse = (input) =>
  input.split("\n").map((line) => {
    const [, position] = /^Player \d+ starting position: (\d+)$/.exec(line);
    return parseInt(position);
  });

const run = async () => {
  const input = await readInput();
  const parsed = parse(input);

  return parsed;
};

const part1 = async (initialPositions) => {
  const positions = [...initialPositions];
  const scores = [0, 0];
  let diceCount = 0;
  let dicePosition = 0;
  let turn = 0;
  while (scores.every((score) => score < 1000)) {
    const step = (3 * dicePosition + 6) % 10;
    dicePosition += 3;
    dicePosition = dicePosition % 100;
    diceCount += 3;
    positions[turn] = (positions[turn] + step) % 10;
    scores[turn] += positions[turn] > 0 ? positions[turn] : 10;
    turn = 1 - turn;
  }
  return _.min(scores) * diceCount;
};

const diceRolls = {
  3: 1,
  4: 3,
  5: 6,
  6: 7,
  7: 6,
  8: 3,
  9: 1,
};

const cache = {};
const key = (positions, scores, turn) =>
  [...positions, ...scores, turn].join(",");
const recurse = (positions, scores, turn) => {
  if (scores[0] >= 21) {
    return { player1: 1, player2: 0 };
  } else if (scores[1] >= 21) {
    return { player1: 0, player2: 1 };
  } else if (cache[key(positions, scores, turn)] != null) {
    return cache[key(positions, scores, turn)];
  }

  const possibilities = Object.keys(diceRolls).map((r) => {
    const roll = parseInt(r, 10);
    const newPositions = [...positions];
    newPositions[turn] = (newPositions[turn] + roll) % 10;
    const newScores = [...scores];
    newScores[turn] += newPositions[turn] > 0 ? newPositions[turn] : 10;
    const { player1, player2 } = recurse(newPositions, newScores, 1 - turn);
    return {
      player1: player1 * diceRolls[roll],
      player2: player2 * diceRolls[roll],
    };
  });

  const totalPlayer1 = _.sum(possibilities.map((p) => p.player1));
  const totalPlayer2 = _.sum(possibilities.map((p) => p.player2));
  const result = {
    player1: totalPlayer1,
    player2: totalPlayer2,
  };
  cache[key(positions, scores, turn)] = result;
  return result;
};

const part2 = async (initialPositions) => {
  const positions = [...initialPositions];
  const scores = [0, 0];
  let turn = 0;
  const { player1, player2 } = recurse(positions, scores, turn);
  return Math.max(player1, player2);
};

run().then((result) =>
  part1(result)
    .then(console.log)
    .then(() => part2(result))
    .then(console.log),
);
