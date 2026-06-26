// src/components/admin/sections/configs/CollectionsConfig.tsx

"use client";

import React from "react";
import {
  TitleInput,
  CollectionSelector,
  ToggleField,
} from "@/components/admin/shared/SectionConfigShared";
import type { ThemeSection } from "@/lib/validators/storefront";

interface CollectionsConfigProps {
  section: ThemeSection;
  collections: any[];
  isLoadingCollections: boolean;
  isFetching: boolean;
  onUpdate: (settings: Record<string, any>) => void;
  onRefreshCollections: () => void;
}

export function CollectionsConfig({
  section,
  collections,
  isLoadingCollections,
  isFetching,
  onUpdate,
  onRefreshCollections,
}: CollectionsConfigProps) {
  const settings = section.settings || {};

  return (
    <div className="space-y-6">
      <TitleInput
        value={settings.title || ""}
        onChange={(value) => onUpdate({ title: value })}
        placeholder="e.g. Shop by Collection"
      />

      <CollectionSelector
        collections={collections}
        selectedId={settings.collectionId || ""}
        onSelect={(id, slug) => onUpdate({ collectionId: id, collectionSlug: slug })}
        isLoading={isLoadingCollections}
        isFetching={isFetching}
        onRefresh={onRefreshCollections}
        label="Select One Collection to Preview"
      />

      <ToggleField
        label="Show Product Count"
        value={settings.showProductCount !== false}
        onChange={(value) => onUpdate({ showProductCount: value })}
      />
    </div>
  );
}