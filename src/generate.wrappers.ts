import {
  filterExcludeIndexFile,
  generateIconWrapper,
  parseFileForIndexGeneration,
  readFilesRecursively,
} from './generate.utils';

async function main() {
  const outlinedFiles = readFilesRecursively('./icons/outlined', '.tsx');
  const outlinedFiltered = filterExcludeIndexFile(outlinedFiles);
  const fileNames = outlinedFiltered.map(parseFileForIndexGeneration);

  for (const file of fileNames) {
    await generateIconWrapper(file.name, './icons');
  }

  console.log(`Generated ${fileNames.length} wrappers.`);
}

main().catch((error) => {
  console.error('Failed to generate wrappers', error);
  process.exitCode = 1;
});
