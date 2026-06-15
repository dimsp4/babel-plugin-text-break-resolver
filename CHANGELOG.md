# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-06-15

### Added
- Initial release
- Babel JSX visitor that injects `textBreakStrategy="simple"`, `numberOfLines={1}`, and `adjustsFontSizeToFit={true}` into all React Native `<Text>` components
- Build-time report generation (`textBreakReport.txt`) listing every transformed component with file, line, and code context
- Automatic skipping of `node_modules`
- Deduplication guard to prevent double-processing of elements
