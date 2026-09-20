import type { ChatConversationViewNode } from '@deepseek-ai/dsh-client-ui-chat/client';
import type { AssistantBlock } from '@deepseek-ai/dsh-client-ui-conversation/client';
import type { TurnBoundary } from './projection.js';
import type { ReaderFlowEntry, ToolActivityEntry } from './tool-activity.js';
export type LiveStep = {
    kind: 'reasoning';
    key: string;
    nodeKey: string;
    start: number;
    blocks: AssistantBlock[];
    step: number;
} | {
    kind: 'body';
    key: string;
    nodeKey: string;
    start: number;
    blocks: AssistantBlock[];
    step: number;
} | {
    kind: 'tool';
    key: string;
    entry: ToolActivityEntry;
} | {
    kind: 'user';
    key: string;
    nodeKey: string;
} | {
    kind: 'other';
    key: string;
    nodeKey: string;
};
export type LiveTurnItem = {
    kind: 'user';
    key: string;
    step: Extract<LiveStep, {
        kind: 'user';
    }>;
} | {
    kind: 'fold';
    key: string;
    steps: readonly LiveStep[];
    summary: string;
    named?: boolean;
} | {
    kind: 'open';
    key: string;
    step: LiveStep;
};
export declare function liveFoldEnabled(boundary: TurnBoundary): boolean;
/**
 * A finished turn still has to honour the fold switches.
 *
 * `liveFoldEnabled` gates the animated live path, which only exists while the
 * turn is open. Once it closes the reader falls back to `ClosedProcessSummary`
 * — a single whole-turn disclosure — so a reader who turned on "keep the
 * model's replies" at level 1 saw every finished turn collapse into one row
 * again, and turning auto-fold off expanded all of it. The two switches looked
 * broken on exactly the turns people actually read.
 *
 * The segmentation itself is the same either way, so reuse the live items.
 */
export declare function settledFoldItems(steps: readonly LiveStep[], boundary: TurnBoundary, keepProse: boolean, keepToolSemantics?: boolean): LiveTurnItem[] | null;
export declare function foldSummary(steps: readonly LiveStep[]): string;
export declare function foldToolSemantics(steps: readonly LiveStep[], limit?: number): string;
export type ChainSegment = {
    fold: readonly LiveStep[] | null;
    open: readonly LiveStep[];
};
/**
 * Keep-prose split: fold each *finished* run of process steps while every body
 * step — the model's user-facing answer text — stays open.
 *
 * A run is folded only once a body step follows it, so the run that is still
 * streaming stays expanded exactly as the reader is watching it.
 *
 * Runs of a single step are left open on purpose. One tool row already reads as
 * one line, and that line carries the tool name and its target; replacing it
 * with a count would drop the only part of it a reader can act on.
 */
export declare function splitChainKeepingBody(chain: readonly LiveStep[], sealed?: boolean): ChainSegment[];
/** One chain: fold only when a new reasoning step has prior body/tool/reasoning. */
export declare function splitChain(chain: readonly LiveStep[]): {
    fold: readonly LiveStep[] | null;
    open: readonly LiveStep[];
};
/** Expand readerFlow into source-ordered live steps using existing block boundaries. */
export declare function segmentLiveTurn(flow: readonly ReaderFlowEntry[], get: (key: string) => ChatConversationViewNode | undefined): LiveStep[];
export declare function presentLiveTurn(steps: readonly LiveStep[], boundary: TurnBoundary, autoFold?: boolean, keepProse?: boolean, keepToolSemantics?: boolean, sealed?: boolean): LiveTurnItem[];
//# sourceMappingURL=live-turn.d.ts.map