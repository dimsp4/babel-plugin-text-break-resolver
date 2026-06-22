import 'react-native';

declare module 'react-native' {
  interface TextProps {
    /**
     * **[babel-plugin-text-break-resolver]**
     *
     * Control the automatic buffer injection for this `<Text>` element.
     *
     * `noTrailingSpaces` is kept for compatibility and disables buffering.
     * Prefer `textBreakBuffer` when you need to force a specific direction.
     *
     * This prop is **stripped at compile time** by the Babel plugin and never
     * appears in the final JavaScript bundle.
     *
     * @example
     * // Badge — no buffer
     * <Text noTrailingSpaces style={styles.badgeText}>{count}</Text>
     *
     * // Centered FAB
     * <Text textBreakBuffer="both" className="text-white text-2xl">+</Text>
     */
    noTrailingSpaces?: boolean;

    /**
     * Force the compile-time text buffer direction for this `<Text>` element.
     * Supported values: `none`, `start`, `end`, `both`.
     */
    textBreakBuffer?: 'none' | 'start' | 'end' | 'both';
  }
}
