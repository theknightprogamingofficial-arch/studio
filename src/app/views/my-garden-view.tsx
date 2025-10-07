"use client";

import Image from "next/image";
import { format, parseISO } from "date-fns";
import { useGarden } from "@/hooks/use-garden.tsx";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getPlantCareGuide, type GetPlantCareGuideOutput } from "@/ai/flows/get-plant-care-guide";
import { useState } from "react";
import { Loader2, Trash2, Droplets, BookOpen, MoreVertical } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Sprout } from 'lucide-react';
import type { Plant } from "@/lib/types";

const CareGuideDialog = ({ plant }: { plant: Plant }) => {
  const [careGuide, setCareGuide] = useState<GetPlantCareGuideOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetCareGuide = async () => {
    setIsLoading(true);
    setError(null);
    setCareGuide(null);
    try {
      const guide = await getPlantCareGuide({ plantName: plant.commonName });
      setCareGuide(guide);
    } catch (e) {
      setError("Sorry, I couldn't generate a care guide at this time.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog onOpenChange={(open) => !open && setCareGuide(null)}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm" className="w-full">
          <BookOpen className="mr-2 h-4 w-4" /> View Care Guide
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">{plant.commonName} Care Guide</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
          {!careGuide && !isLoading && !error && (
            <div className="text-center">
                <Button onClick={handleGetCareGuide}>Generate Care Guide</Button>
            </div>
          )}
          {isLoading && (
              <div className="flex items-center justify-center p-6 space-x-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Generating Guide...</span>
              </div>
          )}
          {error && <p className="text-destructive text-center">{error}</p>}
          {careGuide && (
            <div className="space-y-2">
              <Alert>
                  <AlertTitle>Watering</AlertTitle>
                  <AlertDescription>{careGuide.watering}</AlertDescription>
              </Alert>
              <Alert>
                  <AlertTitle>Sunlight</AlertTitle>
                  <AlertDescription>{careGuide.sunlight}</AlertDescription>
              </Alert>
              <Alert>
                  <AlertTitle>Soil</AlertTitle>
                  <AlertDescription>{careGuide.soil}</AlertDescription>
              </Alert>
              <Alert>
                  <AlertTitle>Fertilizer</AlertTitle>
                  <AlertDescription>{careGuide.fertilizer}</AlertDescription>
              </Alert>
              <Alert>
                  <AlertTitle>Placement</AlertTitle>
                  <AlertDescription>
                    {careGuide.isIndoor && careGuide.isOutdoor ? "Suitable for both indoor and outdoor environments." :
                      careGuide.isIndoor ? "Best kept as an indoor plant." :
                      careGuide.isOutdoor ? "Thrives as an outdoor plant." : "Placement information not available."}
                  </AlertDescription>
              </Alert>
              <Alert>
                  <AlertTitle>Extra Tips</AlertTitle>
                  <AlertDescription>{careGuide.extraTips}</AlertDescription>
              </Alert>
            </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


export default function MyGardenView() {
  const { garden, updatePlant, removePlant, isInitialized } = useGarden();

  const handleWaterPlant = (plantId: string) => {
    const plantToUpdate = garden.find(p => p.id === plantId);
    if (plantToUpdate) {
      updatePlant({ ...plantToUpdate, lastWateringDate: new Date().toISOString() });
    }
  };

  if (!isInitialized) {
     return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  
  if (garden.length === 0) {
    return (
      <div className="text-center flex flex-col items-center justify-center h-full text-muted-foreground">
        <Sprout className="w-24 h-24 mb-4 text-primary/50" />
        <h2 className="font-headline text-2xl font-semibold text-foreground">Your Garden is Empty</h2>
        <p>Use the 'Identify' tab to add your first plant!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
       <h2 className="font-headline text-2xl font-semibold">My Garden</h2>
      {garden.map((plant) => (
        <Card key={plant.id} className="overflow-hidden shadow-lg">
          <div className="flex">
            <div className="w-1/3 relative">
              <Image src={plant.photoDataUri} alt={plant.commonName} layout="fill" objectFit="cover" />
            </div>
            <div className="w-2/3">
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="font-headline text-xl">{plant.commonName}</CardTitle>
                  <CardDescription>
                    {plant.lastWateringDate
                      ? `Last watered: ${format(parseISO(plant.lastWateringDate), 'MMM d, yyyy')}`
                      : 'Not watered yet'}
                  </CardDescription>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => removePlant(plant.id)} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button size="sm" onClick={() => handleWaterPlant(plant.id)} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Droplets className="mr-2 h-4 w-4"/> Watered Today
                </Button>
                <CareGuideDialog plant={plant} />
              </CardContent>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
