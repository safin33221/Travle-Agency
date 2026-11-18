'use client';

import React, { createContext, useContext } from 'react';
import { DEFAULT_LIVE_BRAND, LiveBrandInfo } from '@/lib/brand';

const BrandContext = createContext<LiveBrandInfo>(DEFAULT_LIVE_BRAND);

export function BrandProvider({
  brand,
  children,
}: {
  brand: LiveBrandInfo;
  children: React.ReactNode;
}) {
  return (
    <BrandContext.Provider value={brand}>{children}</BrandContext.Provider>
  );
}

export function useBrand(): LiveBrandInfo {
  return useContext(BrandContext);
}
