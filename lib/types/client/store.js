import { defineStore } from '@deepseek-ai/dsh-client-store';
import { FOLD_INTENSITY_DEFAULT, autoFoldFromIntensity, processOnlyFromIntensity, keepProseOf, } from './fold-intensity.js';
function applyFoldIntensity(draft, value) {
    draft.foldIntensity = value;
    draft.autoFold = autoFoldFromIntensity(value);
    draft.processOnly = processOnlyFromIntensity(value);
}
export function createReaderStore() {
    return defineStore({
        init: () => ({
            expanded: {},
            motion: true,
            autoFold: true,
            deliverableOpenMode: 'external',
            foldIntensity: FOLD_INTENSITY_DEFAULT,
            frostedGlass: false,
            keepProse: keepProseOf(undefined),
            keepToolSemantics: false,
            processOnly: false,
        }),
        persist: 'dsh.reader.v1',
        actions: {
            setExpanded: (draft, key, value) => { draft.expanded[key] = value; },
            setMotion: (draft, value) => { draft.motion = value; },
            setAutoFold: (draft, value) => {
                applyFoldIntensity(draft, value
                    ? (draft.foldIntensity === 2 ? 2 : 1)
                    : 0);
            },
            setDeliverableOpenMode: (draft, value) => { draft.deliverableOpenMode = value; },
            setFoldIntensity: (draft, value) => { applyFoldIntensity(draft, value); },
            setFrostedGlass: (draft, value) => { draft.frostedGlass = value; },
            setKeepProse: (draft, value) => { draft.keepProse = value; },
            setKeepToolSemantics: (draft, value) => { draft.keepToolSemantics = value; },
        },
    });
}
//# sourceMappingURL=store.js.map