const fs = require("fs");
const { promisify } = require("util");
const path = require("path");
const _ = require("lodash");
const readFile = promisify(fs.readFile);

const readInput = async () => readFile(path.join(__dirname, "input"), "utf-8");

const key = (x, y) => `(${x},${y})`;

const parse = (input) => {
  const [imageEnhancementSection, inputImageSection] = input.split("\n\n");
  const imageEnhancementAlgorithm = imageEnhancementSection
    .split("")
    .map((c) => c === "#");

  const inputImageArray = inputImageSection
    .split("\n")
    .map((line) => line.split("").map((c) => c === "#"));

  const inputImage = {};
  inputImageArray.forEach((line, y) => {
    line.forEach((c, x) => {
      inputImage[key(x, y)] = c;
    });
  });

  return {
    imageEnhancementAlgorithm,
    inputImage,
    range: {
      x: [0, inputImageArray[0].length],
      y: [0, inputImageArray.length],
    },
  };
};

const run = async () => {
  const input = await readInput();
  const parsed = parse(input);

  return parsed;
};

const getNeighbourhood = (image, x, y, defaultValue) =>
  [
    [x - 1, y - 1],
    [x, y - 1],
    [x + 1, y - 1],
    [x - 1, y],
    [x, y],
    [x + 1, y],
    [x - 1, y + 1],
    [x, y + 1],
    [x + 1, y + 1],
  ].map(([nx, ny]) => image[key(nx, ny)] ?? defaultValue);

const calculateNextLight = (image, algorithm, x, y, defaultValue) => {
  const neighbourhood = getNeighbourhood(image, x, y, defaultValue);
  const binary = parseInt(neighbourhood.map((c) => (c ? 1 : 0)).join(""), 2);
  return algorithm[binary];
};

const transform = (image, algorithm, initialRange, t, defaultValue) => {
  const newImage = {};
  for (let x = initialRange.x[0] - t; x < initialRange.x[1] + t; x++) {
    for (let y = initialRange.y[0] - t; y < initialRange.y[1] + t; y++) {
      newImage[key(x, y)] = calculateNextLight(
        image,
        algorithm,
        x,
        y,
        defaultValue,
      );
    }
  }
  return newImage;
};

const part1 = async ({ imageEnhancementAlgorithm, inputImage, range }) => {
  let defaultValue = false;
  for (let t = 1; t <= 2; t++) {
    inputImage = transform(
      inputImage,
      imageEnhancementAlgorithm,
      range,
      t,
      defaultValue,
    );
    defaultValue = defaultValue
      ? imageEnhancementAlgorithm[511]
      : imageEnhancementAlgorithm[0];
  }
  return Object.values(inputImage).filter((c) => !!c).length;
};

const part2 = async ({ imageEnhancementAlgorithm, inputImage, range }) => {
  let defaultValue = false;
  for (let t = 1; t <= 50; t++) {
    inputImage = transform(
      inputImage,
      imageEnhancementAlgorithm,
      range,
      t,
      defaultValue,
    );
    defaultValue = defaultValue
      ? imageEnhancementAlgorithm[511]
      : imageEnhancementAlgorithm[0];
  }
  return Object.values(inputImage).filter((c) => !!c).length;
};

run().then((result) =>
  part1(result)
    .then(console.log)
    .then(() => part2(result))
    .then(console.log),
);
