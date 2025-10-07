export type Plant = {
  id: string;
  commonName: string;
  latinName: string;
  funFact: string;
  photoDataUri: string;
  lastWateringDate?: string;
};

export type IdentifiedPlant = Omit<Plant, 'id' | 'lastWateringDate'>;

export type AppContextType = {
  garden: Plant[];
  addPlant: (plant: Omit<Plant, 'id'>) => void;
  updatePlant: (updatedPlant: Plant) => void;
  removePlant: (plantId: string) => void;
  isInitialized: boolean;
  identifiedPlant: IdentifiedPlant | null;
  setIdentifiedPlant: (plant: IdentifiedPlant | null) => void;
};
