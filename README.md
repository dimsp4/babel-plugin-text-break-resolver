# babel-plugin-text-break-resolver

[![npm version](https://img.shields.io/npm/v/babel-plugin-text-break-resolver.svg)](https://www.npmjs.com/package/babel-plugin-text-break-resolver)
[![npm downloads](https://img.shields.io/npm/dm/babel-plugin-text-break-resolver.svg)](https://www.npmjs.com/package/babel-plugin-text-break-resolver)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

`babel-plugin-text-break-resolver` is a Babel plugin for React Native that automatically fixes Android text rendering anomalies (truncation, clipping, and word-splitting) at compile time with zero runtime overhead.

## The Problem

React Native's `<Text>` component on Android defaults to `textBreakStrategy="highQuality"`. This native line-breaking algorithm frequently causes rendering bugs on Android devices, including:
- Text cut off at the end of a word or sentence.
- Truncated or clipped text despite sufficient container space.
- Incorrect word splitting across lines.
- Text overflow anomalies that do not occur on iOS.

## Architecture & Solution

To bypass the Android `highQuality` layout constraints, developers typically must manually apply `textBreakStrategy="simple"` and append trailing whitespace to every `<Text>` component in the application.

This plugin automates that process via an Abstract Syntax Tree (AST) visitor during the Metro bundling phase. It locates every JSX `<Text>` element and injects the necessary properties at compile time:
- Automatically injects `textBreakStrategy="simple"`.
- Automatically appends a 2-space ASCII buffer aligned with the text's directionality (trailing spaces for left-aligned, leading spaces for right-aligned, and both for centered text).
- Avoids modifying files within `node_modules`.
- Bypasses `<Text>` components that already have these properties defined.
- Executes entirely at build time, resulting in zero runtime performance penalty.

## Installation

Install the package as a development dependency using your preferred package manager.

Using npm:
```bash
npm install --save-dev babel-plugin-text-break-resolver
```

Using yarn:
```bash
yarn add -D babel-plugin-text-break-resolver
```

## Configuration

Register the plugin in your `babel.config.js` file.

```javascript
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    ['babel-plugin-text-break-resolver', {
      numberOfLines: false,
      adjustsFontSizeToFit: false,
      trailingSpaces: true
    }],
    // react-native-reanimated/plugin must remain last if used
  ]
};
```

### Options Table

| Option | Default | Description |
|--------|---------|-------------|
| `numberOfLines` | `false` | Injects `numberOfLines={1}` into all `<Text>` elements. |
| `adjustsFontSizeToFit` | `false` | Injects `adjustsFontSizeToFit={true}` into all `<Text>` elements. |
| `trailingSpaces` | `true` | Appends 2 ASCII spaces using an alignment-aware strategy based on standard layout behaviors. |

*(Note: `textBreakStrategy="simple"` is strictly enforced and always applied by the plugin.)*

## Per-element Opt-out & Overrides

For isolated cases where the automatic buffer disrupts specific layouts, use the `noTrailingSpaces` or `textBreakBuffer` props directly on the element.

```jsx
// Disable the space buffer for this specific component
<Text noTrailingSpaces style={styles.badgeText}>{count}</Text>

// Force the buffer strategy explicitly
<Text textBreakBuffer="both">{label}</Text>
```

At compile time, the plugin:
1. Strips these custom props (they are never rendered in the final bundle).
2. Applies the requested buffer strategy (or skips it).
3. Continues to apply `textBreakStrategy="simple"`.

### TypeScript Support

Because `noTrailingSpaces` and `textBreakBuffer` are compile-time attributes, TypeScript will initially flag them as invalid React Native props. 

To resolve this, **you do not need to configure anything complex**. The next time you run your Metro bundler (e.g. `yarn start`), the plugin will automatically generate a `text-break-env.d.ts` file in your project root!

Simply add that generated file to your `tsconfig.json`'s include array:
```json
{
  "include": [
    "src",
    "text-break-env.d.ts"
  ]
}
```

## Build Reporting

When Metro processes files during a full build (such as an APK or AAB generation), the plugin generates a detailed modification report at:
`android/app/build/generated/logs/textBreakReport.txt`

The report documents the exact line numbers and applied properties for every `<Text>` element modified by the AST visitor.

## Advanced Usage

### CI/CD and Build Scripts

Metro's JavaScript cache may prevent the plugin from evaluating unmodified files. In automated build pipelines (e.g., Fastlane or `build.sh`), force the plugin to execute on all files by clearing the cache during the bundle phase.

```bash
npx react-native bundle \
  --platform android \
  --dev false \
  --entry-file index.js \
  --bundle-output android/app/src/main/assets/index.android.bundle \
  --assets-dest android/app/src/main/res \
  --reset-cache
```

## Troubleshooting

**The text is still cut off after installing the plugin.**
Babel plugins only run on files compiled by Metro. If Metro caches the files, your changes will not reflect. You must restart Metro and explicitly clear the cache:
```bash
npx react-native start --reset-cache
```

## FAQ

**Why is text cut off or truncated on Android in React Native?**
React Native defaults to a `highQuality` text breaking strategy on Android. This native engine algorithm has known issues evaluating line bounds, resulting in clipped text. Overriding this value to `simple` and appending padding typically resolves the rendering anomaly.

**How does this plugin prevent text from being truncated?**
It systematically applies `textBreakStrategy="simple"` to all `<Text>` nodes and injects a 2-character ASCII space buffer to extend the layout boundary constraint, ensuring the Android UI renderer draws the entire text string.

**Will this plugin affect iOS rendering?**
No. The `textBreakStrategy` attribute is Android-specific. iOS uses a separate native text renderer (CoreText) and simply ignores the property.

**Does this plugin degrade app performance?**
No. The plugin is a build-time dependency. AST modifications are compiled directly into the JavaScript bundle before runtime, meaning the application incurs zero processing overhead on the user's device.

## Compatibility

| React Native | Android | Babel | Status |
|---|---|---|---|
| 0.72+ | API 24+ | 7.x | Supported |

## License

[MIT](LICENSE)
