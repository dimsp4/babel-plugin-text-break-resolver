# babel-plugin-text-break-resolver

[![npm version](https://img.shields.io/npm/v/babel-plugin-text-break-resolver.svg)](https://www.npmjs.com/package/babel-plugin-text-break-resolver)
[![npm downloads](https://img.shields.io/npm/dm/babel-plugin-text-break-resolver.svg)](https://www.npmjs.com/package/babel-plugin-text-break-resolver)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Automatically fix cut, truncated, and clipped text in React Native — at build time, zero runtime cost.

## Are You Seeing This?

- Text gets **cut off** in the end of a word or sentence
- Text is **not fully visible** even when there's enough space
- Text is **truncated** or clipped unexpectedly on Android
- Words are **split incorrectly** across lines
- Text looks **fine on iOS but broken on Android**
- Text **overflows** its container on some Android versions

## Why Does This Happen? (The Root Cause)

On Android, React Native's `<Text>` component defaults to `textBreakStrategy="highQuality"`, which uses a complex line-breaking algorithm. This causes text to appear cut off, truncated, or incorrectly wrapped — especially noticeable on certain Android versions and screen sizes.

## The Fix

The solution is to add three props to every `<Text>` component:
- `textBreakStrategy="simple"` — disables Android's high-quality algorithm
- `numberOfLines={1}` — prevents unexpected text overflow
- `adjustsFontSizeToFit={true}` — ensures text fits its container

This plugin applies them automatically at Babel compile time — no manual changes to every component needed.

## How It Works

This is a Babel plugin that runs during your Metro bundler process. It uses an Abstract Syntax Tree (AST) visitor to find every JSX `<Text>` element in your project and automatically injects the three missing props if they aren't already present. 

- **Zero Runtime Cost**: The props are injected at compile time.
- **Safe**: It automatically skips files inside `node_modules` and avoids double-injecting props if you already defined them manually.

## Installation

Using npm:
```bash
npm install --save-dev babel-plugin-text-break-resolver
```

Using yarn:
```bash
yarn add -D babel-plugin-text-break-resolver
```

## Setup

Add the plugin to your `babel.config.js` file:

```javascript
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // Add it here
    'babel-plugin-text-break-resolver',
    
    // (Ensure react-native-reanimated/plugin remains last if you use it)
  ]
};
```

**Important**: Clear your Metro cache for the changes to take effect:
```bash
npx react-native start --reset-cache
```

### CI/CD and Build Scripts

If you have custom build scripts (like a `build.sh` or fastlane lane), Metro's JavaScript cache might prevent the plugin from running on files that haven't changed. To guarantee the text break strategy is injected during a fresh release build, always append `--reset-cache` to your bundle command.

**Example Build Script (`build.sh`):**
```bash
#!/bin/bash

# Clean previous Android build
cd android && ./gradlew clean && cd ..

# Generate bundle with cache reset
npx react-native bundle \
  --platform android \
  --dev false \
  --entry-file index.js \
  --bundle-output android/app/src/main/assets/index.android.bundle \
  --assets-dest android/app/src/main/res \
  --reset-cache
```

## Before / After

```jsx
// Before — text may get cut or truncated on Android
<Text style={styles.title}>Hello World</Text>

// After — automatically compiled by babel-plugin-text-break-resolver
<Text
  style={styles.title}
  textBreakStrategy="simple"
  numberOfLines={1}
  adjustsFontSizeToFit={true}
>
  Hello World
</Text>
```

## Build Report

As a bonus, this plugin generates a detailed build report every time you run a full build (like an Android APK/AAB build). You can find the report at:
`android/app/build/generated/logs/textBreakReport.txt`

The report shows exactly which files were modified and the source code context, making it easy to audit the plugin's behavior:

```
────────────────────────────────────────────────────────────────────────────────
TEXT BREAK STRATEGY REPORT - Build: MQEMYWH6
Generated: 2026-06-15T03:11:43.071Z
────────────────────────────────────────────────────────────────────────────────

SUMMARY
────────────────────────────────────────
Files modified : 4
<Text> found   : 7
Attributes added:
  - textBreakStrategy     : 7
  - numberOfLines         : 7
  - adjustsFontSizeToFit  : 7

────────────────────────────────────────────────────────────────────────────────
DETAILED CHANGES
────────────────────────────────────────────────────────────────────────────────

[FILE] src/components/Header.js
────────────────────────────────────────────────────────────────────────────────
  Line   45, col   6 | <Text>
    Added: textBreakStrategy, numberOfLines, adjustsFontSizeToFit
      44 | <View style={styles.container}>
    ▶ 45 |   <Text style={styles.title}>Welcome Back</Text>
      46 | </View>
```

*(Note: The report is only generated when Metro actually transforms files. If Metro uses cached files, the report won't generate. Run your bundle command with `--reset-cache` to force a fresh report.)*

## FAQ

### Why is my text cut off on Android in React Native?
Android's default text rendering uses a high-quality line-breaking algorithm that can sometimes clip or cut text unexpectedly. This plugin resolves the issue by forcing the simpler, more reliable text break strategy across your entire app.

### How do I prevent text from being truncated in React Native?
Manually, you would need to add `textBreakStrategy="simple"`, `numberOfLines={1}`, and `adjustsFontSizeToFit={true}` to every `<Text>` element. This plugin automates that process so you never have to think about it.

### Why does text look fine on iOS but gets clipped on Android?
The `textBreakStrategy` prop is Android-specific. iOS uses a different text rendering engine that doesn't suffer from this specific high-quality line-breaking bug.

### My text is not showing completely — what's wrong?
You are likely experiencing the Android `textBreakStrategy` bug. Install this plugin, clear your Metro cache, and rebuild to see if the missing text is restored.

### Does this plugin work with the latest React Native?
Yes. It works with any modern version of React Native that uses Babel.

### Will this plugin slow down my app?
No. All modifications happen during the Babel compilation step on your development machine or CI server. The final JavaScript bundle simply contains the additional props, adding virtually zero overhead to the app's runtime performance.

## Compatibility

| React Native | Android | Babel | Status |
|---|---|---|---|
| 0.72+ | API 24+ | 7.x | Supported |

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](LICENSE)
