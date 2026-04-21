// src\store\useStorefrontStore.ts

import { create } from "zustand";
import { ThemeSection } from "@/lib/validators/storefront";
import { arrayMove } from "@dnd-kit/sortable";

interface StorefrontState {
  sections: ThemeSection[];
  activeSectionId: string | null;
  isDirty: boolean; // Tracks unsaved changes
  
  // Actions
  setInitialSections: (sections: ThemeSection[]) => void;
  setActiveSectionId: (id: string | null) => void;
  addSection: (type: ThemeSection["type"]) => void;
  removeSection: (id: string) => void;
  reorderSections: (oldIndex: number, newIndex: number) => void;
  updateSectionSettings: (id: string, settings: any) => void;
  toggleSectionActive: (id: string) => void;
  resetDirty: () => void;
}

export const useStorefrontStore = create<StorefrontState>((set) => ({
  sections: [],
  activeSectionId: null,
  isDirty: false,

  setInitialSections: (sections) => set({ sections, isDirty: false }),
  
  setActiveSectionId: (id) => set({ activeSectionId: id }),

  addSection: (type) => set((state) => {
    const newSection: ThemeSection = {
      id: `sec-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      type,
      isActive: true,
      settings: {},
    };
    return { 
      sections: [...state.sections, newSection],
      activeSectionId: newSection.id,
      isDirty: true 
    };
  }),

  removeSection: (id) => set((state) => ({
    sections: state.sections.filter((s) => s.id !== id),
    activeSectionId: state.activeSectionId === id ? null : state.activeSectionId,
    isDirty: true,
  })),

  reorderSections: (oldIndex, newIndex) => set((state) => ({
    sections: arrayMove(state.sections, oldIndex, newIndex),
    isDirty: true,
  })),

  updateSectionSettings: (id, settings) => set((state) => ({
    sections: state.sections.map((s) => 
      s.id === id ? { ...s, settings: { ...s.settings, ...settings } } : s
    ),
    isDirty: true,
  })),

  toggleSectionActive: (id) => set((state) => ({
    sections: state.sections.map((s) =>
      s.id === id ? { ...s, isActive: !s.isActive } : s
    ),
    isDirty: true,
  })),

  resetDirty: () => set({ isDirty: false }),
}));