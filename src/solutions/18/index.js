const fs = require("fs");
const { promisify } = require("util");
const path = require("path");
const _ = require("lodash");
const readFile = promisify(fs.readFile);

const readInput = async () => readFile(path.join(__dirname, "input"), "utf-8");

const parseLine = (line) => {
  const nodes = [];
  const raw = JSON.parse(line);

  const traverse = (node) => {
    if (!Array.isArray(node)) {
      const newNode = { value: node };
      nodes.push(newNode);
      return newNode;
    } else {
      return node.map(traverse);
    }
  };

  const tree = traverse(raw);

  for (let i = 0; i < nodes.length; i++) {
    if (i > 0) {
      nodes[i].previous = nodes[i - 1];
    }

    if (i < nodes.length - 1) {
      nodes[i].next = nodes[i + 1];
    }
  }

  return { nodes: nodes[0], tree };
};

const parse = (input) => input.split("\n");

const wrap = (n) => {
  if (!Array.isArray(n)) {
    return n;
  } else {
    return n.map((n) => ({ value: wrap(n) }));
  }
};

const sum = (a, b) => {
  let last = a.nodes;
  while (last.next != null) {
    last = last.next;
  }

  last.next = b.nodes;
  b.nodes.previous = last;

  return { nodes: a.nodes, tree: [a.tree, b.tree] };
};

const reduce = (number) => {
  let hasReduced = true;
  while (hasReduced) {
    hasReduced = tryReduce(number);
  }
  return number;
};

const tryReduce = (number) => {
  const hasExploded = tryExplode(number);
  if (hasExploded) {
    // console.log("Exploded");
    // log(number);
    return true;
  }

  const hasSplit = trySplit(number);
  if (hasSplit) {
    // console.log("Split");
    // log(number);
    return true;
  }
  return false;
};

const tryExplode = (number) => {
  let queue = [
    { node: number.tree, depth: 0, parent: null, parentIndex: null },
  ];
  while (queue.length > 0) {
    const current = queue.shift();
    if (!Array.isArray(current.node)) {
      // Literal number, so do nothing.
    } else if (
      current.depth >= 4 &&
      !Array.isArray(current.node[0]) &&
      !Array.isArray(current.node[1])
    ) {
      const newNode = { value: 0 };

      const previous = current.node[0].previous;
      if (previous != null) {
        previous.value += current.node[0].value;
        previous.next = newNode;
        newNode.previous = previous;
      } else {
        number.nodes = newNode;
      }

      const next = current.node[1].next;
      if (next != null) {
        next.value += current.node[1].value;
        next.previous = newNode;
        newNode.next = next;
      }

      current.parent[current.parentIndex] = newNode;
      return true;
    } else {
      queue.unshift(
        ...current.node.map((n, i) => ({
          node: n,
          depth: current.depth + 1,
          parent: current.node,
          parentIndex: i,
        })),
      );
    }
  }
  return false;
};

const trySplit = (number) => {
  const queue = [{ node: number.tree, parent: null, parentIndex: null }];
  while (queue.length > 0) {
    const current = queue.shift();

    if (Array.isArray(current.node)) {
      queue.unshift(
        ...current.node.map((n, i) => ({
          node: n,
          parent: current.node,
          parentIndex: i,
        })),
      );
    } else if (current.node.value >= 10) {
      const leftNode = { value: Math.floor(current.node.value / 2) };
      const rightNode = { value: Math.ceil(current.node.value / 2) };

      leftNode.next = rightNode;
      rightNode.previous = leftNode;

      const previous = current.node.previous;
      if (previous != null) {
        previous.next = leftNode;
        leftNode.previous = previous;
      } else {
        number.nodes = leftNode;
      }

      const next = current.node.next;
      if (next != null) {
        next.previous = rightNode;
        rightNode.next = next;
      }

      current.parent[current.parentIndex] = [leftNode, rightNode];
      return true;
    }
  }
};

const magnitude = (number) => {
  if (Array.isArray(number)) {
    return 3 * magnitude(number[0]) + 2 * magnitude(number[1]);
  } else {
    return number.value;
  }
};

const part1 = async () => {
  const input = await readInput();
  const parsed = parse(input).map(parseLine);

  const [first, ...rest] = parsed;
  let current = first;
  reduce(first);
  while (rest.length > 0) {
    const next = rest.shift();
    current = sum(current, next);
    reduce(current);
  }

  return magnitude(current.tree);
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

      const first = parseLine(parsed[i]);
      const second = parseLine(parsed[j]);
      const total = sum(first, second);
      reduce(total);
      const mag = magnitude(total.tree);
      if (mag >= max) {
        max = mag;
      }
    }
  }
  return max;
};

part1().then(console.log).then(part2).then(console.log);
