// src/store/useStorefrontStore.ts

import { create } from "zustand";
import { arrayMove } from "@dnd-kit/sortable";
import { ThemeSection } from "@/lib/validators/storefront";
import {
  getDefaultSettings,
  isCategoryIconStrip,
} from "@/lib/validators/storefront";

// ============================================================
// 1. TYPES
// ============================================================

interface StorefrontState {
  // State
  sections: ThemeSection[];
  activeSectionId: string | null;
  isDirty: boolean;
  isInitialized: boolean;
  duplicateSection: (id: string) => void;
  // Core Actions
  setInitialSections: (sections: ThemeSection[]) => void;
  setActiveSectionId: (id: string | null) => void;
  resetDirty: () => void;

  // Section CRUD
  addSection: (type: ThemeSection["type"]) => void;
  removeSection: (id: string) => void;
  // duplicateSection: (id: string) => void;

  // Section Ordering
  reorderSections: (oldIndex: number, newIndex: number) => void;
  moveSectionToIndex: (id: string, newIndex: number) => void;

  // Section Settings
  updateSectionSettings: (
    id: string,
    settings: Partial<Record<string, any>>,
  ) => void;
  updateSectionSettingsBulk: (
    updates: Array<{ id: string; settings: Record<string, any> }>,
  ) => void;

  // Section Visibility
  toggleSectionActive: (id: string) => void;
  setSectionActive: (id: string, isActive: boolean) => void;

  // Section Helpers
  getSectionById: (id: string) => ThemeSection | undefined;
  getActiveSection: () => ThemeSection | null;
  getActiveSections: () => ThemeSection[];
  getSectionIndex: (id: string) => number;

  // Hero Banner Specific
  updateHeroBannerImage: (
    sectionId: string,
    bannerIndex: number,
    field: string,
    imageUrl: string,
  ) => void;

  // Bulk Operations
  resetStore: () => void;
  validateSections: () => boolean;
}

// ============================================================
// 2. INITIAL STATE
// ============================================================

const INITIAL_STATE = {
  sections: [],
  activeSectionId: null,
  isDirty: false,
  isInitialized: false,
};

// ============================================================
// 3. STORE IMPLEMENTATION
// ============================================================

export const useStorefrontStore = create<StorefrontState>((set, get) => ({
  // ============================================================
  // INITIAL STATE
  // ============================================================
  ...INITIAL_STATE,

  // ============================================================
  // CORE ACTIONS
  // ============================================================

  /**
   * Set initial sections from backend
   * Resets dirty state and marks as initialized
   */
  setInitialSections: (sections) => {
    // Ensure all sections have valid settings
    const validatedSections = sections.map((section) => ({
      ...section,
      settings: {
        ...getDefaultSettings(section.type),
        ...section.settings,
      },
    }));

    set({
      sections: validatedSections,
      isDirty: false,
      isInitialized: true,
    });
  },

  /**
   * Set the active section ID
   */
  setActiveSectionId: (id) => {
    set({ activeSectionId: id });
  },

  /**
   * Reset dirty flag after saving
   */
  resetDirty: () => {
    set({ isDirty: false });
  },

  // ============================================================
  // SECTION CRUD
  // ============================================================

  /**
   * Add a new section with default settings
   */
  addSection: (type) => {
    const defaultSettings = getDefaultSettings(type);

    const newSection: ThemeSection = {
      id: `sec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type,
      isActive: true,
      settings: defaultSettings,
    };

    set((state) => ({
      sections: [...state.sections, newSection],
      activeSectionId: newSection.id,
      isDirty: true,
    }));
  },

  /**
   * Remove a section by ID
   */
  removeSection: (id) => {
    set((state) => {
      const filteredSections = state.sections.filter((s) => s.id !== id);
      const newActiveId =
        state.activeSectionId === id
          ? filteredSections.length > 0
            ? filteredSections[0].id
            : null
          : state.activeSectionId;

      return {
        sections: filteredSections,
        activeSectionId: newActiveId,
        isDirty: true,
      };
    });
  },

  /**
   * Duplicate an existing section
   */

  duplicateSection: (id) => {
    set((state) => {
      const original = state.sections.find((s) => s.id === id);
      if (!original) return state;

      const duplicated: ThemeSection = {
        ...original,
        id: `sec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        isActive: true,
        settings: { ...original.settings },
      };

      const index = state.sections.findIndex((s) => s.id === id);
      const newSections = [...state.sections];
      newSections.splice(index + 1, 0, duplicated);

      return {
        sections: newSections,
        activeSectionId: duplicated.id,
        isDirty: true,
      };
    });
  },

  // ============================================================
  // SECTION ORDERING
  // ============================================================

  /**
   * Reorder sections using array move (for DnD)
   */
  reorderSections: (oldIndex, newIndex) => {
    set((state) => ({
      sections: arrayMove(state.sections, oldIndex, newIndex),
      isDirty: true,
    }));
  },

  /**
   * Move a section to a specific index
   */
  moveSectionToIndex: (id, newIndex) => {
    set((state) => {
      const currentIndex = state.sections.findIndex((s) => s.id === id);
      if (currentIndex === -1 || currentIndex === newIndex) return state;

      const newSections = arrayMove(state.sections, currentIndex, newIndex);
      return {
        sections: newSections,
        isDirty: true,
      };
    });
  },

  // ============================================================
  // SECTION SETTINGS
  // ============================================================

  /**
   * Update settings for a single section
   */
  updateSectionSettings: (id, settings) => {
    set((state) => {
      const section = state.sections.find((s) => s.id === id);
      if (!section) return state;

      // Special handling for CATEGORY_ICON_STRIP columns
      let processedSettings = settings;
      if (
        section.type === "CATEGORY_ICON_STRIP" &&
        settings.columns !== undefined
      ) {
        // Ensure columns is a string
        processedSettings = {
          ...settings,
          columns: String(settings.columns),
        };
      }

      return {
        sections: state.sections.map((s) =>
          s.id === id
            ? {
                ...s,
                settings: {
                  ...s.settings,
                  ...processedSettings,
                },
              }
            : s,
        ),
        isDirty: true,
      };
    });
  },

  /**
   * Batch update settings for multiple sections
   */
  updateSectionSettingsBulk: (updates) => {
    set((state) => {
      const updatedSections = state.sections.map((section) => {
        const update = updates.find((u) => u.id === section.id);
        if (!update) return section;

        return {
          ...section,
          settings: {
            ...section.settings,
            ...update.settings,
          },
        };
      });

      return {
        sections: updatedSections,
        isDirty: true,
      };
    });
  },

  // ============================================================
  // SECTION VISIBILITY
  // ============================================================

  /**
   * Toggle section active state
   */
  toggleSectionActive: (id) => {
    set((state) => ({
      sections: state.sections.map((s) =>
        s.id === id ? { ...s, isActive: !s.isActive } : s,
      ),
      isDirty: true,
    }));
  },

  /**
   * Set section active state explicitly
   */
  setSectionActive: (id, isActive) => {
    set((state) => ({
      sections: state.sections.map((s) =>
        s.id === id ? { ...s, isActive } : s,
      ),
      isDirty: true,
    }));
  },

  // ============================================================
  // HERO BANNER SPECIFIC
  // ============================================================

  /**
   * Update hero banner image (preserves existing functionality)
   */
  updateHeroBannerImage: (sectionId, bannerIndex, field, imageUrl) => {
    set((state) => ({
      sections: state.sections.map((section) => {
        if (section.id !== sectionId) return section;

        const banners = [
          ...(((section.settings as any).banners as any[]) || []),
        ];
        if (!banners[bannerIndex]) {
          banners[bannerIndex] = {};
        }

        banners[bannerIndex] = {
          ...banners[bannerIndex],
          [field]: imageUrl,
        };

        return {
          ...section,
          settings: {
            ...section.settings,
            banners,
          },
        };
      }),
      isDirty: true,
    }));
  },

  // ============================================================
  // BULK OPERATIONS
  // ============================================================

  /**
   * Reset store to initial state
   */
  resetStore: () => {
    set(INITIAL_STATE);
  },

  /**
   * Validate all sections have valid settings
   */
  validateSections: () => {
    const { sections } = get();
    // Basic validation - check all sections have required fields
    return sections.every((section) => {
      if (!section.id || !section.type) return false;
      if (section.settings === undefined || section.settings === null)
        return false;
      return true;
    });
  },

  // ============================================================
  // SECTION HELPERS
  // ============================================================

  /**
   * Get a section by ID (safe)
   */
  getSectionById: (id) => {
    return get().sections.find((s) => s.id === id);
  },

  /**
   * Get the currently active section
   */
  getActiveSection: () => {
    const { sections, activeSectionId } = get();
    return activeSectionId
      ? sections.find((s) => s.id === activeSectionId) || null
      : null;
  },

  /**
   * Get all active sections (filtered)
   */
  getActiveSections: () => {
    return get().sections.filter((s) => s.isActive);
  },

  /**
   * Get index of a section
   */
  getSectionIndex: (id) => {
    return get().sections.findIndex((s) => s.id === id);
  },
}));

// ============================================================
// 4. SELECTORS (for use in components)
// ============================================================

/**
 * Select active section from store
 */
export const useActiveSection = () => {
  return useStorefrontStore((state) => {
    if (!state.activeSectionId) return null;
    return state.sections.find((s) => s.id === state.activeSectionId) || null;
  });
};

/**
 * Select sections count
 */
export const useSectionsCount = () => {
  return useStorefrontStore((state) => state.sections.length);
};

/**
 * Select active sections count
 */
export const useActiveSectionsCount = () => {
  return useStorefrontStore(
    (state) => state.sections.filter((s) => s.isActive).length,
  );
};

/**
 * Check if sections are dirty
 */
export const useIsDirty = () => {
  return useStorefrontStore((state) => state.isDirty);
};

/**
 * Check if a specific section type exists
 */
export const useHasSectionType = (type: ThemeSection["type"]) => {
  return useStorefrontStore((state) =>
    state.sections.some((s) => s.type === type),
  );
};

/**
 * Get typed settings for a section (with type guard)
 */
export const useTypedSectionSettings = <T = any>(sectionId: string) => {
  return useStorefrontStore((state) => {
    const section = state.sections.find((s) => s.id === sectionId);
    if (!section) return null;
    return section.settings as T;
  });
};

// ============================================================
// 5. DERIVED STATE HELPERS
// ============================================================

/**
 * Check if a section is the active one
 */
export const isActiveSection = (sectionId: string) => {
  return useStorefrontStore.getState().activeSectionId === sectionId;
};

/**
 * Get the index of a section
 */
export const getSectionIndex = (sectionId: string) => {
  return useStorefrontStore
    .getState()
    .sections.findIndex((s) => s.id === sectionId);
};

/**
 * Get the next section ID (for navigation)
 */
export const getNextSectionId = (sectionId: string) => {
  const { sections } = useStorefrontStore.getState();
  const index = sections.findIndex((s) => s.id === sectionId);
  if (index === -1 || index === sections.length - 1) return null;
  return sections[index + 1].id;
};

/**
 * Get the previous section ID (for navigation)
 */
export const getPreviousSectionId = (sectionId: string) => {
  const { sections } = useStorefrontStore.getState();
  const index = sections.findIndex((s) => s.id === sectionId);
  if (index <= 0) return null;
  return sections[index - 1].id;
};

// ============================================================
// 6. EXPORT TYPES
// ============================================================

export type { StorefrontState };
