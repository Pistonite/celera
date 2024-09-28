import { create } from "zustand";

export type PageStore = {
    pageNames: string[];
    currentPage: string;
    setCurrentPage: (page: string) => void;
};

export const usePages = create<PageStore>((set) => ({
    pageNames: ["Welcome", "Concepts", "Edit-Layout"],
    currentPage: "Welcome",
    setCurrentPage: (page) => set({ currentPage: page }),
}));

export async function loadPageContent(name: string) {
    return (await import(`./${name}.md?raw`)).default;
}
