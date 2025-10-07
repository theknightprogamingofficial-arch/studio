"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Plant } from '@/lib/types';

const GARDEN_STORAGE_KEY = 'leafwise-garden';

export function useGarden() {
  const [garden, setGarden] = useState<Plant[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

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

  return { garden, addPlant, updatePlant, removePlant, isInitialized };
}
