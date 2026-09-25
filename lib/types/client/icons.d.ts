/**
 * Product icons for the reader, resolved against whatever primitives build the
 * host actually serves.
 *
 * The reader imports no icon by name. A bundle external is answered by the
 * running host, and the icon exports were renamed between host generations:
 * the 0.1.6 line publishes `Icon<Glyph>Outline<px>` (`IconEditOutline16`), the
 * 0.1.7 line publishes weight-suffixed names with the size moved into a prop
 * (`IconEditOutlineRegular`). An external that lacks the imported key yields
 * `undefined`, and rendering an undefined component throws — which takes the
 * whole block boundary down with it ("此内容暂时无法在阅读页显示"), not just the
 * glyph. Translating the names once, here, keeps that class of host drift out
 * of every call site.
 *
 * Resolution order per glyph: current-generation name, previous-generation
 * name, then an inline fallback of comparable weight. Lookups happen on render
 * rather than at module load, so a resolved glyph always comes from the build
 * the host is actually serving.
 *
 * @module
 */
import { type ReactNode } from 'react';
/** Props accepted by every icon in this module. */
export interface ReaderIconProps {
    /** Square edge in px; defaults to 16, matching the glyph set's drawn size. */
    size?: number | undefined;
    /** Extra class for layout placement. */
    className?: string | undefined;
}
type Artwork = (props: ReaderIconProps) => ReactNode;
/** Leading glyph of a write or edit tool row. */
export declare const IconWrite: Artwork;
/** Leading glyph of a read tool row. */
export declare const IconRead: Artwork;
/** Closed folder, for inline folder references. */
export declare const IconFolder: Artwork;
/** Leading glyph of a terminal or code-interpreter tool row. */
export declare const IconTerminal: Artwork;
/** Leading glyph of a search tool row. */
export declare const IconSearch: Artwork;
/** Leading glyph of a web tool row. */
export declare const IconWeb: Artwork;
/** Leading glyph of a skill tool row. */
export declare const IconSkill: Artwork;
/** Leading glyph of any other tool row. */
export declare const IconOther: Artwork;
export {};
//# sourceMappingURL=icons.d.ts.map