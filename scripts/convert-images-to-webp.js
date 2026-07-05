/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const IMAGE_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".tif",
  ".tiff",
  ".bmp",
  ".avif",
]);

function parseArgs(argv) {
  const opts = {
    dir: path.join(process.cwd(), "public", "tamales"),
    quality: 82,
    maxWidth: 1600,
    force: false,
    removeOriginals: false,
  };

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--force") opts.force = true;
    else if (arg === "--remove-originals") opts.removeOriginals = true;
    else if (arg === "--dir" && argv[i + 1]) opts.dir = path.resolve(argv[++i]);
    else if (arg === "--quality" && argv[i + 1]) opts.quality = Number(argv[++i]);
    else if (arg === "--max-width" && argv[i + 1]) opts.maxWidth = Number(argv[++i]);
  }

  return opts;
}

function walkDir(dir, files = []) {
  if (!fs.existsSync(dir)) return files;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) walkDir(fullPath, files);
    else if (entry.isFile()) files.push(fullPath);
  }

  return files;
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function convertFile(inputPath, opts) {
  const rawExt = path.extname(inputPath);
  const ext = rawExt.toLowerCase();
  if (!IMAGE_EXTENSIONS.has(ext)) return null;

  const outputPath = path.join(
    path.dirname(inputPath),
    `${path.basename(inputPath, rawExt)}.webp`
  );

  const inputStat = fs.statSync(inputPath);
  if (!opts.force && fs.existsSync(outputPath)) {
    const outputStat = fs.statSync(outputPath);
    if (outputStat.mtimeMs >= inputStat.mtimeMs) {
      console.log(`Skip (up to date): ${path.relative(process.cwd(), outputPath)}`);
      return null;
    }
  }

  let pipeline = sharp(inputPath).rotate();
  const metadata = await pipeline.metadata();

  if (opts.maxWidth && metadata.width && metadata.width > opts.maxWidth) {
    pipeline = pipeline.resize({ width: opts.maxWidth, withoutEnlargement: true });
  }

  await pipeline.webp({ quality: opts.quality, effort: 4 }).toFile(outputPath);

  const outputStat = fs.statSync(outputPath);
  const saved = inputStat.size - outputStat.size;
  const pct = inputStat.size > 0 ? ((saved / inputStat.size) * 100).toFixed(0) : "0";

  console.log(
    `OK ${path.relative(process.cwd(), inputPath)} -> ${path.relative(process.cwd(), outputPath)} ` +
      `(${formatBytes(inputStat.size)} -> ${formatBytes(outputStat.size)}, -${pct}%)`
  );

  if (opts.removeOriginals) {
    fs.unlinkSync(inputPath);
  }

  return { inputBytes: inputStat.size, outputBytes: outputStat.size };
}

async function main() {
  const opts = parseArgs(process.argv);

  if (!fs.existsSync(opts.dir)) {
    console.error(`Directory not found: ${opts.dir}`);
    process.exit(1);
  }

  console.log(`Converting images in: ${opts.dir}`);
  console.log(`Quality: ${opts.quality}, max width: ${opts.maxWidth}px\n`);

  const files = walkDir(opts.dir);
  let converted = 0;
  let totalIn = 0;
  let totalOut = 0;

  for (const file of files) {
    const result = await convertFile(file, opts);
    if (result) {
      converted += 1;
      totalIn += result.inputBytes;
      totalOut += result.outputBytes;
    }
  }

  console.log(`\nDone: ${converted} image(s) converted.`);
  if (converted > 0) {
    console.log(`Total: ${formatBytes(totalIn)} -> ${formatBytes(totalOut)}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
