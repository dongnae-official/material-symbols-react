import fs from 'fs';
import path from 'path';
import puppeteer, { Page } from 'puppeteer';

type Variant = 'outlined' | 'sharp' | 'rounded';
const NAV_TIMEOUT_MS = 120000;
const SCROLL_DELAY_MS = 2000;
const MAX_SCROLLS = 40;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function scrollToLoadIcons(page: Page) {
  let previousCount = 0;

  for (let i = 0; i < MAX_SCROLLS; i++) {
    const currentCount = await page.evaluate(
      () => document.querySelectorAll('gf-load-icon-font').length
    );

    if (currentCount > previousCount) {
      previousCount = currentCount;
    } else if (i > 0) {
      break;
    }

    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await delay(SCROLL_DELAY_MS);
  }
}

function capitalize(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function toPascalCase(string: string) {
  return string
    .split('/')
    .map((snake) =>
      snake
        .split('_')
        .map((substr) => substr.charAt(0).toUpperCase() + substr.slice(1))
        .join('')
    )
    .join('/');
}

function chunkArray<T>(arr: T[], chunkSize: number): T[][] {
  const result: T[][] = [];

  for (let i = 0; i < arr.length; i += chunkSize) {
    result.push(arr.slice(i, i + chunkSize));
  }

  return result;
}

function convertNumbersToWords(input: string): string {
  const numericalWords: Record<string, string> = {
    '0': 'Zero',
    '1': 'One',
    '2': 'Two',
    '3': 'Three',
    '4': 'Four',
    '5': 'Five',
    '6': 'Six',
    '7': 'Seven',
    '8': 'Eight',
    '9': 'Nine',
  };

  const tensWords: Record<string, string> = {
    '10': 'Ten',
    '11': 'Eleven',
    '12': 'Twelve',
    '13': 'Thirteen',
    '14': 'Fourteen',
    '15': 'Fifteen',
    '16': 'Sixteen',
    '17': 'Seventeen',
    '18': 'Eighteen',
    '19': 'Nineteen',
  };

  const tensMultipleWords: Record<string, string> = {
    '2': 'Twenty',
    '3': 'Thirty',
    '4': 'Forty',
    '5': 'Fifty',
    '6': 'Sixty',
    '7': 'Seventy',
    '8': 'Eighty',
    '9': 'Ninety',
  };

  function convertThreeDigitNumberToWords(num: number): string {
    if (num === 0) {
      return numericalWords['0'];
    }

    let result = '';

    const hundreds = Math.floor(num / 100);
    const remainder = num % 100;

    if (hundreds > 0) {
      result += numericalWords[hundreds.toString()] + 'Hundred';

      if (remainder > 0) {
        result += '';
      }
    }

    if (remainder > 0) {
      if (remainder < 10) {
        result += numericalWords[remainder.toString()];
      } else if (remainder < 20) {
        result += tensWords[remainder.toString()];
      } else {
        const tens = Math.floor(remainder / 10);
        const ones = remainder % 10;

        result += tensMultipleWords[tens.toString()];

        if (ones > 0) {
          result += '' + numericalWords[ones.toString()];
        }
      }
    }

    return result;
  }

  return input.replace(/\d+/g, (match) =>
    convertThreeDigitNumberToWords(parseInt(match, 10))
  );
}

function extractContent(svgString: string) {
  const pathRegex = /<path[^>]*\sd="([^"]*)"/i;
  const match = pathRegex.exec(svgString);
  if (match && match[1]) {
    return match[1].trim();
  } else {
    console.error(
      "No 'd' attribute found in the <path> element of the input string."
    );
    return null;
  }
}

async function getIconList(variant?: Variant): Promise<string[]> {
  const metadataPath = path.resolve(process.cwd(), '_data', 'versions.json');

  if (fs.existsSync(metadataPath)) {
    const raw = await fs.promises.readFile(metadataPath, 'utf8');
    const data = JSON.parse(raw) as Record<string, unknown>;
    return Object.keys(data);
  }

  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.setDefaultTimeout(NAV_TIMEOUT_MS);

  try {
    await page.goto(
      variant
        ? `https://fonts.google.com/icons?icon.style=${capitalize(variant)}`
        : 'https://fonts.google.com/icons',
      { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT_MS }
    );

    await page.waitForSelector('gf-load-icon-font', {
      timeout: NAV_TIMEOUT_MS,
    });
    await scrollToLoadIcons(page);

    const iconList = await page.evaluate(() => {
      const spans = Array.from(document.querySelectorAll('gf-load-icon-font'));

      return spans.map((span) => span.textContent?.trim() ?? '');
    });

    return iconList.filter((name) => !!name);
  } finally {
    await page.close();
    await browser.close();
  }
}

async function fetchSvg(url: string): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), NAV_TIMEOUT_MS);
  try {
    const response = await fetch(encodeURI(url), { signal: controller.signal });
    if (!response.ok) {
      console.error('Failed to fetch SVG', url, response.status);
      return null;
    }

    return await response.text();
  } catch (error) {
    console.error('Failed to load SVG', url, error);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function getIconsSVG(
  iconNames: string[],
  variant: Variant,
  isFilled: boolean,
  chunkSize: number,
  nullIcons: string[]
): Promise<{ name: string; content: string }[]> {
  const iconListChunks = chunkArray(iconNames, chunkSize);
  let svgData: { name: string; content: string }[] = [];
  let count = 1;

  for (const chunk of iconListChunks) {
    console.log(
      `Extracting ${variant}${isFilled ? '-filled' : ''} SVG ${
        count * chunkSize > iconNames.length
          ? iconNames.length
          : count * chunkSize
      } out of ${iconNames.length}`
    );
    const data = await Promise.all(
      chunk.map(async (name) => {
        const url = `https://fonts.gstatic.com/s/i/short-term/release/materialsymbols${variant}/${name}/${
          isFilled ? 'fill1' : 'default'
        }/24px.svg`;
        console.log;

        const content = await fetchSvg(url);

        if (!content) nullIcons.push(url);

        return {
          name,
          content: content ?? 'No SVG',
        };
      })
    );

    svgData = svgData.concat(data);
    count++;
  }

  return svgData.filter((data) => data.content !== 'No SVG');
}

async function svgToComponent(name: string, svg: string, folder: string) {
  const componentName = name.replace(/\s+/g, '');

  return fs.promises.writeFile(
    `./icons/${folder}/${componentName}.tsx`,
    `
import React from "react";
import { IconProps } from "${
      folder.includes('filled') ? '../../types' : '../types'
    }";

const ${componentName} = (props: IconProps) => {
  return <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 -960 960 960" fill="currentColor" {...props} >
    <path d="${extractContent(svg)}" />
  </svg>
};

export default ${componentName};
    `
  );
}

export async function generateIconVariant(
  variant: Variant,
  isFilled: boolean,
  chunkSize: number,
  nullIcons: string[],
  iconList?: string[]
) {
  try {
    if (!iconList) {
      iconList = await getIconList(variant);
    }

    const iconSVGs = await getIconsSVG(
      iconList,
      variant,
      isFilled,
      chunkSize,
      nullIcons
    );

    const iconSVGChunks = chunkArray(iconSVGs, chunkSize);
    let count = 1;

    for (const chunk of iconSVGChunks) {
      console.log(
        `Saving ${variant}${isFilled ? '-filled' : ''} SVG ${
          count * chunkSize > iconSVGs.length
            ? iconSVGs.length
            : count * chunkSize
        } out of ${iconSVGs.length}`
      );

      await Promise.all(
        chunk.map((svg) =>
          svgToComponent(
            toPascalCase(convertNumbersToWords(svg.name)),
            svg.content,
            `${variant}${isFilled ? '/filled' : ''}`
          )
        )
      );

      count++;
    }
  } catch (error) {
    console.error(
      `Failed to generate ${variant}${isFilled ? '-filled' : ''} variants`,
      error
    );
  }
}

export async function generateIndexFile(
  files: { name: string; path: string }[],
  destinationPath: string
) {
  return fs.promises.writeFile(
    destinationPath,
    `${files
      .map(
        (file) =>
          `import ${toPascalCase(convertNumbersToWords(file.name))} from '${
            file.path
          }';\n`
      )
      .join('')}\nexport {\n${files
      .map((file) => `${toPascalCase(convertNumbersToWords(file.name))},\n`)
      .join('')}}
    `
  );
}

export function readFilesRecursively(
  folderPath: string,
  fileExtension: string
): string[] {
  const files: string[] = [];

  const readDir = (currentPath: string): void => {
    const items = fs.readdirSync(currentPath);

    items.forEach((item) => {
      const fullPath = path.join(currentPath, item);
      const stats = fs.statSync(fullPath);

      if (stats.isFile() && path.extname(item) === fileExtension) {
        files.push(fullPath);
      }
    });
  };

  readDir(folderPath);

  return files;
}

export async function generateIconWrapper(name: string, outputDir: string) {
  const pascal = toPascalCase(convertNumbersToWords(name));
  const wrapper = `
import React from 'react'
import { IconProps, IconWrapperProps } from './types'

type LazyIconProps = Omit<IconProps, 'ref'>

const loadIcon = (
  variant: IconWrapperProps['variant'],
  filled?: boolean
): Promise<{ default: React.ComponentType<LazyIconProps> }> => {
  if (variant === 'outlined') {
    return filled
      ? import('./outlined/filled/${pascal}')
      : import('./outlined/${pascal}');
  }

  if (variant === 'rounded') {
    return filled
      ? import('./rounded/filled/${pascal}')
      : import('./rounded/${pascal}');
  }

  return filled
    ? import('./sharp/filled/${pascal}')
    : import('./sharp/${pascal}');
}

export const ${pascal} = (props: IconWrapperProps) => {
  const { variant = 'outlined', filled, ...iconProps } = props;
  const LazyIcon = React.useMemo(
    () => React.lazy(() => loadIcon(variant, filled)),
    [variant, filled]
  )

  return (
    <React.Suspense fallback={null}>
      <LazyIcon {...(iconProps as LazyIconProps)} />
    </React.Suspense>
  )
}
export default ${pascal}
  `.trim();
  await fs.promises.writeFile(path.join(outputDir, `${pascal}.tsx`), wrapper);
}

export function filterExcludeIndexFile(files: string[]): string[] {
  return files.filter((file) => {
    const posix = file.replace(/\\/g, '/');
    return path.basename(posix) !== 'index.tsx';
  });
}

export function parseFileForIndexGeneration(file: string): {
  name: string;
  path: string;
} {
  const posix = file.replace(/\\/g, '/');
  const name = posix.substring(
    posix.lastIndexOf('/') + 1,
    posix.lastIndexOf('.')
  );
  const relPath = `./${name}`;

  return {
    name,
    path: relPath,
  };
}
