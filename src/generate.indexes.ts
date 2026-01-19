import {
  filterExcludeIndexFile,
  generateIndexFile,
  parseFileForIndexGeneration,
  readFilesRecursively,
} from './generate.utils';

async function main() {
  const variants = ['rounded', 'sharp', 'outlined'];

  for (const variant of variants) {
    const files = readFilesRecursively(`./icons/${variant}`, '.tsx');
    const filesFiltered = filterExcludeIndexFile(files);

    await generateIndexFile(
      filesFiltered.map(parseFileForIndexGeneration),
      `./icons/${variant}/index.tsx`
    );

    const filledFiles = readFilesRecursively(
      `./icons/${variant}/filled`,
      '.tsx'
    );
    const filledFiltered = filterExcludeIndexFile(filledFiles);

    await generateIndexFile(
      filledFiltered.map(parseFileForIndexGeneration),
      `./icons/${variant}/filled/index.tsx`
    );
  }

  const outlinedFiles = readFilesRecursively('./icons/outlined', '.tsx');
  const outlinedFiltered = filterExcludeIndexFile(outlinedFiles);

  await generateIndexFile(
    outlinedFiltered.map(parseFileForIndexGeneration),
    `./icons/index.tsx`
  );
}

main().catch((error) => {
  console.error('Failed to generate index files', error);
  process.exitCode = 1;
});
