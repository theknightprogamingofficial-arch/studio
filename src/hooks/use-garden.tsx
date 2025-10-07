"use client";

import { useState, useEffect, useCallback, createContext, useContext, type ReactNode, type FC } from 'react';
import type { Plant, IdentifiedPlant, AppContextType } from '@/lib/types';

const GARDEN_STORAGE_KEY = 'leafwise-garden';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [garden, setGarden] = useState<Plant[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [identifiedPlant, setIdentifiedPlant] = useState<IdentifiedPlant | null>(null);

  useEffect(() => {
    try {
      const storedGarden = localStorage.getItem(GARDEN_STORAGE_KEY);
      if (storedGarden) {
        setGarden(JSON.parse(storedGarden));
      }
    } catch (error) {
      console.error("Failed to load garden from localStorage", error);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem(GARDEN_STORAGE_KEY, JSON.stringify(garden));
      } catch (error) {
        console.error("Failed to save garden to localStorage", error);
      }
    }
  }, [garden, isInitialized]);

  const addPlant = useCallback((plant: Omit<Plant, 'id'>) => {
    const newPlant: Plant = { ...plant, id: new Date().toISOString() };
    setGarden(prevGarden => [...prevGarden, newPlant]);
  }, []);

  const updatePlant = useCallback((updatedPlant: Plant) => {
    setGarden(prevGarden => prevGarden.map(p => p.id === updatedPlant.id ? updatedPlant : p));
  }, []);
  
  const removePlant = useCallback((plantId: string) => {
    setGarden(prevGarden => prevGarden.filter(p => p.id !== plantId));
  }, []);

  const value = {
    garden,
    addPlant,
    updatePlant,
    removePlant,
    isInitialized,
    identifiedPlant,
    setIdentifiedPlant,
  };
  
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};


export function useGarden() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useGarden must be used within an AppProvider');
  }
  return context;
}
