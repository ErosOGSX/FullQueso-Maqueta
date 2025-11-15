import { create } from 'zustand'

const useSelectionStore = create((set) => ({
    service: null,
    city: null,
    store: null,

    setSelection: (selection) => {
        if (!selection || typeof selection !== 'object') return;
        set({
            service: selection.service || null,
            city: selection.city || null,
            store: selection.store || null,
        });
    },

    clearSelection: () => set({
        service: null,
        city: null,
        store: null,
    }),
}))

export default useSelectionStore