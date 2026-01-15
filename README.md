<h1 align="center">Material Symbols React</h1>

Use [Google's Material Symbols (icons)](https://fonts.google.com/icons?icon.set=Material+Symbols) in React with ease.

This is a fork of `@nine-thirty-five/material-symbols-react` with additional updates.

<div align="center">

[![NPM version][npm-image]][npm-url]
[![Downloads][download-image]][npm-downloads]
![npm-typescript]
[![GitHub License](https://img.shields.io/badge/license-Apache--2.0-green)](./LICENSE)

</div>

- [Installation](#installation)
- [Usage](#usage)
  - [Importing](#importing)
  - [Component Props](#component-props)
- [Publishing](#publishing)
- [License](#license)

## Installation

```sh
# npm
npm install @dongnae/material-symbols-react

# yarn
yarn add @dongnae/material-symbols-react

# pnpm
pnpm add @dongnae/material-symbols-react
```

## Usage

`@dongnae/material-symbols-react` provides three Material icon **variants** in both **_default_** and **_filled_** types.

Icon variants are:

- Outlined
- Rounded
- Sharp

### Importing

There are two ways to import an icon based on your prefered type and variant.

```tsx
// Outlined variant
import { Search } from '@dongnae/material-symbols-react/outlined';
import { Home } from '@dongnae/material-symbols-react/outlined/filled';

// Rounded variant
import { Star } from '@dongnae/material-symbols-react/rounded';
import { Favorite } from '@dongnae/material-symbols-react/rounded/filled';

// Sharp variant
import { Delete } from '@dongnae/material-symbols-react/sharp';
import { Login } from '@dongnae/material-symbols-react/sharp/filled';
```

### Component Props

Icon component support all props that a React SVG component supports.

```tsx
// Sample props
<Search className="yourClassName" />
<Home style={{fill: 'red'}} />
<Star height='1rem' width='1rem' />
<Favorite height={16} width={16} />
<Delete fill='red' />
<Login viewBox='0 0 24 24' />
```

## Using icon wrapper

The icon wrapper is a component that internally decides which icon variant to display using the `variant` and `filled` props.

```tsx
// Outlined variant
import { Search, Home, Star } from '@dongnae/material-symbols-react';

// Sample props
<Search variant="outlined" className="yourClassName" />
<Home variant="sharp" style={{fill: 'red'}} />
<Star variant="sharp" size='1rem' filled />
```

> Note: the wrappers support the `size` prop, which sets both the height and width simultaneously.

## Publishing

This repo uses npm Trusted Publishing (OIDC) for GitHub Actions, so no long-lived `NPM_TOKEN` is required.

## License

Material design icons are created by [Google](https://github.com/google/material-design-icons#license).

> We have made these icons available for you to incorporate into your products under the Apache License Version 2.0. Feel free to remix and re-share these icons and documentation in your products. We'd love attribution in your app's about screen, but it's not required.

[npm-url]: https://www.npmjs.com/package/@dongnae/material-symbols-react
[npm-image]: https://img.shields.io/npm/v/@dongnae/material-symbols-react
[download-image]: https://img.shields.io/npm/dm/@dongnae/material-symbols-react
[npm-downloads]: https://www.npmjs.com/package/@dongnae/material-symbols-react
[github-license]: https://img.shields.io/github/license/dongnae-official/material-symbols-react
[github-license-url]: https://github.com/dongnae-official/material-symbols-react/blob/master/LICENSE
[github-build]: https://github.com/dongnae-official/material-symbols-react/actions/workflows/publish.yml/badge.svg
[github-build-url]: https://github.com/dongnae-official/material-symbols-react/actions/workflows/publish.yml
[npm-typescript]: https://img.shields.io/npm/types/@dongnae/material-symbols-react
[license]: https://github.com/dongnae-official/material-symbols-react/blob/main/LICENSE
