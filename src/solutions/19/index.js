const fs = require("fs");
const { promisify } = require("util");
const path = require("path");
const _ = require("lodash");
const { format } = require("path");
const readFile = promisify(fs.readFile);

const readInput = async () => readFile(path.join(__dirname, "input"), "utf-8");

const parse = (input) => {
  const scanners = input.split("\n\n");
  return scanners.map((text) => {
    const [scanner, ...beacons] = text.split("\n");
    const [, scannerId] = /^--- scanner (\d+) ---$/.exec(scanner);
    const beaconCoords = beacons.map((probe) =>
      probe.split(",").map((x) => parseInt(x, 10)),
    );
    return { id: scannerId, beacons: beaconCoords };
  });
};

const distance = (x, y) =>
  Math.abs(x[0] - y[0]) + Math.abs(x[1] - y[1]) + Math.abs(x[2] - y[2]);

const findCandidates = (scanners) => {
  const scannersWithDistances = scanners.map((scanner) => {
    const distances = [];
    for (let i = 0; i < scanner.beacons.length; i++) {
      for (let j = i + 1; j < scanner.beacons.length; j++) {
        const d = distance(scanner.beacons[i], scanner.beacons[j]);
        distances.push({ beacons: [i, j], distance: d });
      }
    }
    return { scanner, distances };
  });

  const distanceIntersection = (as, bs) => _.difference(as, _.xorWith(as, bs));

  const candidates = [];
  for (let i = 0; i < scannersWithDistances.length; i++) {
    const firstScanner = scannersWithDistances[i];
    for (let j = i + 1; j < scannersWithDistances.length; j++) {
      const secondScanner = scannersWithDistances[j];
      const intersection = distanceIntersection(
        firstScanner.distances.map((d) => d.distance),
        secondScanner.distances.map((d) => d.distance),
      );
      if (intersection.length >= 66) {
        const firstBeacons = _.uniq(
          firstScanner.distances
            .filter((d) => intersection.includes(d.distance))
            .flatMap((d) => d.beacons),
        );
        const secondBeacons = _.uniq(
          secondScanner.distances
            .filter((d) => intersection.includes(d.distance))
            .flatMap((d) => d.beacons),
        );
        candidates.push(
          {
            from: {
              scanner: firstScanner.scanner,
              beacons: firstBeacons,
            },
            to: {
              scanner: secondScanner.scanner,
              beacons: secondBeacons,
            },
          },
          {
            from: {
              scanner: secondScanner.scanner,
              beacons: secondBeacons,
            },
            to: {
              scanner: firstScanner.scanner,
              beacons: firstBeacons,
            },
          },
        );
      }
    }
  }

  return candidates;
};

const allRotations = [
  [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ], // x, y, z
  [
    [1, 0, 0],
    [0, 0, 1],
    [0, -1, 0],
  ], // x, z, -y
  [
    [1, 0, 0],
    [0, -1, 0],
    [0, 0, -1],
  ], // x, -y, -z
  [
    [1, 0, 0],
    [0, 0, -1],
    [0, 1, 0],
  ], // x, -z, y
  [
    [0, 1, 0],
    [-1, 0, 0],
    [0, 0, 1],
  ], // y, -x, z
  [
    [0, 1, 0],
    [0, 0, -1],
    [-1, 0, 0],
  ], // y, -z, -x
  [
    [0, 1, 0],
    [1, 0, 0],
    [0, 0, -1],
  ], // y, x, -z
  [
    [0, 1, 0],
    [0, 0, 1],
    [1, 0, 0],
  ], // y, z, x
  [
    [0, 0, 1],
    [0, 1, 0],
    [-1, 0, 0],
  ], // z, y, -x
  [
    [0, 0, 1],
    [-1, 0, 0],
    [0, -1, 0],
  ], // z, -x, -y
  [
    [0, 0, 1],
    [0, -1, 0],
    [1, 0, 0],
  ], // z -y, x
  [
    [0, 0, 1],
    [1, 0, 0],
    [0, 1, 0],
  ], // z, x, y
  [
    [-1, 0, 0],
    [0, 1, 0],
    [0, 0, -1],
  ], // -x, y, -z
  [
    [-1, 0, 0],
    [0, 0, 1],
    [0, 1, 0],
  ], // -x, z, y
  [
    [-1, 0, 0],
    [0, -1, 0],
    [0, 0, 1],
  ], // -x, -y, z
  [
    [-1, 0, 0],
    [0, 0, -1],
    [0, -1, 0],
  ], // -x, -z, -y
  [
    [0, -1, 0],
    [1, 0, 0],
    [0, 0, 1],
  ], // -y, x, z
  [
    [0, -1, 0],
    [0, 0, 1],
    [-1, 0, 0],
  ], // -y, z, -x
  [
    [0, -1, 0],
    [-1, 0, 0],
    [0, 0, -1],
  ], // -y, -x, -z
  [
    [0, -1, 0],
    [0, 0, -1],
    [1, 0, 0],
  ], // -y, -z, x
  [
    [0, 0, -1],
    [0, 1, 0],
    [1, 0, 0],
  ], // -z, y, x
  [
    [0, 0, -1],
    [-1, 0, 0],
    [0, 1, 0],
  ], // -z, -x, y
  [
    [0, 0, -1],
    [0, -1, 0],
    [-1, 0, 0],
  ], // -z, -y, -x
  [
    [0, 0, -1],
    [1, 0, 0],
    [0, -1, 0],
  ], // -z, x, -y
];

const rotate = ([x, y, z], rotation) => [
  rotation[0][0] * x + rotation[0][1] * y + rotation[0][2] * z,
  rotation[1][0] * x + rotation[1][1] * y + rotation[1][2] * z,
  rotation[2][0] * x + rotation[2][1] * y + rotation[2][2] * z,
];

const translate = ([x, y, z], [dx, dy, dz]) => [x + dx, y + dy, z + dz];

const difference = ([x1, y1, z1], [x2, y2, z2]) => [x2 - x1, y2 - y1, z2 - z1];

const transform = (beacons, rotation, source, target) => {
  const rotated = beacons.map((coord) => rotate(coord, rotation));

  const rotatedSource = rotate(source, rotation);

  const vector = difference(rotatedSource, target);

  return rotated.map((coord) => translate(coord, vector));
};

const run = async () => {
  const input = await readInput();
  const scanners = parse(input);
  const candidates = findCandidates(scanners);

  scanners[0].position = [0, 0, 0];
  const visited = [scanners[0]];
  while (visited.length < scanners.length) {
    const edge = candidates.find(
      ({ from, to }) =>
        visited.includes(from.scanner) && !visited.includes(to.scanner),
    );
    const { from, to } = edge;

    const fromBeacons = from.beacons.map((i) => from.scanner.beacons[i]);
    const toBeacons = to.beacons.map((i) => to.scanner.beacons[i]);

    let done = false;
    for (const rotation of allRotations) {
      if (done) {
        break;
      }
      for (const target of fromBeacons) {
        if (done) {
          break;
        }
        for (const source of toBeacons) {
          const transformed = transform(toBeacons, rotation, source, target);
          const matches = transformed.filter((beacon) =>
            from.scanner.beacons.some((b) => _.isEqual(b, beacon)),
          );
          if (matches.length >= 12) {
            to.scanner.position = transform(
              [[0, 0, 0]],
              rotation,
              source,
              target,
            )[0];
            to.scanner.beacons = transform(
              to.scanner.beacons,
              rotation,
              source,
              target,
            );
            visited.push(to.scanner);
            done = true;
            break;
          }
        }
      }
    }
    candidates.splice(
      candidates.findIndex((c) => c === edge),
      1,
    );
  }
  return scanners;
};

const part1 = async (scanners) => {
  const uniqBeacons = _.uniqBy(
    scanners.flatMap((scanner) => scanner.beacons),
    ([x, y, z]) => `(${x},${y},${z})`,
  );

  return uniqBeacons.length;
};

const part2 = async (scanners) => {
  let max = 0;
  for (let i = 0; i < scanners.length; i++) {
    for (let j = i + 1; j < scanners.length; j++) {
      const d = distance(scanners[i].position, scanners[j].position);
      if (max < d) {
        max = d;
      }
    }
  }
  return max;
};

run().then((result) =>
  part1(result)
    .then(console.log)
    .then(() => part2(result))
    .then(console.log),
);
