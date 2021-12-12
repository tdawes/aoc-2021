const fs = require("fs");
const { promisify } = require("util");
const path = require("path");
const _ = require("lodash");
const { toLower, result } = require("lodash");
const { assert, Console } = require("console");

const readFile = promisify(fs.readFile);

const readInput = async () => readFile(path.join(__dirname, "input"), "utf-8");

const parse = (input) => {
  const edges = input.split("\n").map((line) => {
    const [from, to] = line.split("-");
    return { from, to };
  });
  const caves = {};
  for (const edge of edges) {
    if (caves[edge.from] == null) {
      caves[edge.from] = { isLarge: /^[A-Z]+$/.test(edge.from), edges: {} };
    }
    if (caves[edge.to] == null) {
      caves[edge.to] = { isLarge: /^[A-Z]+$/.test(edge.to), edges: {} };
    }
    if (edge.to != "start" && edge.from != "end") {
      caves[edge.from].edges[edge.to] = true;
    }
    if (edge.to != "end" && edge.from != "start") {
      caves[edge.to].edges[edge.from] = true;
    }
  }
  return caves;
};

const visit = (caves, path, hasVisitedSmall = true, visited = new Set()) => {
  const current = path[path.length - 1];
  if (current === "end") {
    return [path];
  }
  const next = Object.keys(caves[current].edges).filter(
    (to) => caves[to].isLarge || !hasVisitedSmall || !visited.has(to),
  );
  const nextVisited = new Set(visited);
  nextVisited.add(current);
  const allPaths = [];
  for (const to of next) {
    allPaths.push(
      ...visit(
        caves,
        [...path, to],
        hasVisitedSmall || (!caves[to].isLarge && nextVisited.has(to)),
        nextVisited,
      ),
    );
  }
  return allPaths;
};

const part1 = async () => {
  const input = await readInput();
  const caves = parse(input);
  const paths = visit(caves, ["start"]);
  return paths.length;
};

const part2 = async () => {
  const input = await readInput();
  const caves = parse(input);
  const paths = visit(caves, ["start"], false);
  return paths.length;
};

part1().then(console.log).then(part2).then(console.log);
