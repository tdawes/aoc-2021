const fs = require("fs");
const { promisify } = require("util");
const path = require("path");
const _ = require("lodash");
const readFile = promisify(fs.readFile);

const readInput = async () => readFile(path.join(__dirname, "input"), "utf-8");

const parse = (input) =>
  input
    .split("")
    .flatMap((h) => _.padStart(parseInt(h, 16).toString(2), 4, "0").split(""))
    .map((x) => parseInt(x, 10));

const binaryToDecimal = (binary) => parseInt(binary.join(""), 2);

const parsePackets = (binary) => {
  const packets = [];
  while (binary.length > 6) {
    packets.push(parsePacket(binary));
  }
  return packets;
};

const parsePacket = (binary) => {
  const version = binaryToDecimal(binary.splice(0, 3));
  const type = binaryToDecimal(binary.splice(0, 3));

  if (type === 4) {
    let marker;
    const literal = [];
    do {
      const part = binary.splice(0, 5);
      marker = part.shift();
      literal.push(...part);
    } while (marker === 1);
    const value = binaryToDecimal(literal);
    return {
      value,
      version,
      packet: { type: "literal", value },
    };
  } else {
    let parsedSubpackets;
    const indicator = binary.shift();
    if (indicator === 0) {
      const length = binaryToDecimal(binary.splice(0, 15));
      const subPackets = binary.splice(0, length);

      parsedSubpackets = parsePackets(subPackets);
    } else {
      const numSubpackets = binaryToDecimal(binary.splice(0, 11));

      parsedSubpackets = _.range(0, numSubpackets).map(() =>
        parsePacket(binary, numSubpackets),
      );
    }
    let value;
    if (type === 0) {
      value = _.sum(parsedSubpackets.map((p) => p.value));
    } else if (type === 1) {
      value = parsedSubpackets.reduce((acc, p) => acc * p.value, 1);
    } else if (type === 2) {
      value = _.min(parsedSubpackets.map((p) => p.value));
    } else if (type === 3) {
      value = _.max(parsedSubpackets.map((p) => p.value));
    } else if (type === 5) {
      value = parsedSubpackets[0].value > parsedSubpackets[1].value ? 1 : 0;
    } else if (type === 6) {
      value = parsedSubpackets[0].value < parsedSubpackets[1].value ? 1 : 0;
    } else if (type === 7) {
      value = value =
        parsedSubpackets[0].value === parsedSubpackets[1].value ? 1 : 0;
    }
    return {
      version,
      packet: {
        type: "operator",
        operator: type,
        subpackets: parsedSubpackets,
      },
      value,
    };
  }
};

const totalVersion = (packet) =>
  packet.version +
  (packet.packet.type === "operator"
    ? _.sum(packet.packet.subpackets.map(totalVersion))
    : 0);

const part1 = async () => {
  const input = await readInput();
  const binary = parse(input);
  const parsed = parsePackets(binary);
  return _.sum(parsed.map(totalVersion));
};

const part2 = async () => {
  const input = await readInput();
  const binary = parse(input);
  const parsed = parsePackets(binary);
  console.log(JSON.stringify(parsed, null, 2));
  return parsed[0].value;
};

part1().then(console.log).then(part2).then(console.log);
