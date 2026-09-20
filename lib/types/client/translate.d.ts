/**
 * The translated-label seat, with a built-in fallback dictionary.
 *
 * The host delivers a \`t\` function to a view only when it wires a locale seat
 * for that registration. 0.1.6 changed how that seat is delivered, and a view
 * that receives no seat used to crash on its first \`t('…')\` call — React then
 * unmounted the whole block boundary and the reader showed
 * "此内容暂时无法在阅读页显示". A missing label is not worth losing the record
 * over, so this resolves the seat defensively and falls back to the same copy
 * the plugin already ships in its own dictionary.
 *
 * The fallback is intentionally small and only covers the keys this plugin
 * actually asks for; an unknown key returns the key itself, which is visibly
 * wrong rather than silently empty.
 */
export type Translate = (key: string, params?: Record<string, unknown>) => string;
/**
 * Resolve the host's translator, or a dictionary-backed stand-in.
 *
 * @param candidate - Whatever the slot delivered as \`props.t\`; may be absent.
 * @returns A function that always returns a string.
 */
export declare function translateOf(candidate: unknown): Translate;
//# sourceMappingURL=translate.d.ts.map