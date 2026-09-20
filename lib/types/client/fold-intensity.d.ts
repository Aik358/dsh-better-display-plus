/** Three-stop fold intensity persisted on `dsh.reader.v1`. Default is standard. */
export type FoldIntensity = 0 | 1 | 2;
export declare const FOLD_INTENSITY_DEFAULT: FoldIntensity;
/** Level 0: nothing auto-folds. Level 1: current-main choreography. Level 2: process summaries. */
export declare function foldIntensityOf(state: unknown): FoldIntensity;
/** Name the tools a fold contains instead of only counting them. Default off. */
export declare function keepToolSemanticsOf(state: unknown): boolean;
export declare function frostedGlassOf(state: unknown): boolean;
export declare function autoFoldFromIntensity(intensity: FoldIntensity): boolean;
export declare function processOnlyFromIntensity(intensity: FoldIntensity): boolean;
/**
 * Keep the model's user-facing answer text out of the fold.
 *
 * This is deliberately a separate switch rather than a fourth stop on
 * `foldIntensity`: it answers a different question. The three stops decide
 * *how much* process to fold; this decides *whether prose is foldable at all*.
 * Wiring it into the slider would make it impossible to ask for a summary-level
 * fold that still keeps every explanation visible, and it would silently change
 * the meaning of a stop that existing users already rely on.
 *
 * Default off, so nothing moves for anyone who does not ask for it.
 */
export declare function keepProseOf(state: unknown): boolean;
//# sourceMappingURL=fold-intensity.d.ts.map