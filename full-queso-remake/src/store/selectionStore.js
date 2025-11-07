import { create } from 'zustand'

const useSelectionStore = create((set) => ({
    service: null,
    city: null,
    store: null,

    setSelection: (selection) => set({
        service: selection.service,
        city: selection.city,
        store: selection.store,
    }),

    clearSelection: () => set({
        service: null,
        city: null,
        store: null,
    }),
}))

export default useSelectionStore