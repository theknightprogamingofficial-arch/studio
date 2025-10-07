
"use client";

import Image from "next/image";
import { format, parseISO } from "date-fns";
import { useGarden } from "@/hooks/use-garden.tsx";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getPlantCareGuide, type GetPlantCareGuideOutput } from "@/ai/flows/get-plant-care-guide";
import { useState, useRef } from "react";
import { Loader2, Trash2, Droplets, BookOpen, MoreVertical, Notebook, Camera, Sun, Wind, TestTube, Home, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Sprout } from 'lucide-react';
import type { Plant, JournalEntry } from "@/lib/types";

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
                  <Droplets className="h-4 w-4" />
                  <AlertTitle>Watering</AlertTitle>
                  <AlertDescription>{careGuide.watering}</AlertDescription>
              </Alert>
              <Alert>
                  <Sun className="h-4 w-4" />
                  <AlertTitle>Sunlight</AlertTitle>
                  <AlertDescription>{careGuide.sunlight}</AlertDescription>
              </Alert>
              <Alert>
                  <Wind className="h-4 w-4" />
                  <AlertTitle>Soil</AlertTitle>
                  <AlertDescription>{careGuide.soil}</AlertDescription>
              </Alert>
              <Alert>
                  <TestTube className="h-4 w-4" />
                  <AlertTitle>Fertilizer</AlertTitle>
                  <AlertDescription>{careGuide.fertilizer}</AlertDescription>
              </Alert>
              <Alert>
                  <Home className="h-4 w-4" />
                  <AlertTitle>Placement</AlertTitle>
                  <AlertDescription>
                    {careGuide.isIndoor && careGuide.isOutdoor ? "Suitable for both indoor and outdoor environments." :
                      careGuide.isIndoor ? "Best kept as an indoor plant." :
                      careGuide.isOutdoor ? "Thrives as an outdoor plant." : "Placement information not available."}
                  </AlertDescription>
              </Alert>
              <Alert>
                  <Sparkles className="h-4 w-4" />
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

const JournalDialog = ({ plant }: { plant: Plant }) => {
  const { addJournalEntry } = useGarden();
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddEntry = () => {
    if (!note && !photo) return;
    addJournalEntry(plant.id, {
      note,
      photoDataUri: photo || undefined,
    });
    setNote("");
    setPhoto(null);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileSelect = () => fileInputRef.current?.click();

  const sortedJournalEntries = plant.journalEntries?.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) || [];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm" className="w-full">
          <Notebook className="mr-2 h-4 w-4" /> Journal
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">{plant.commonName} Journal</DialogTitle>
          <DialogDescription>Add notes and photos to track your plant's progress.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Textarea
              placeholder="Add a new note..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
             <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={triggerFileSelect}>
                    <Camera className="mr-2 h-4 w-4" /> {photo ? "Change Photo" : "Add Photo"}
                </Button>
                {photo && <Image src={photo} alt="Note preview" width={40} height={40} className="rounded-md object-cover" />}
            </div>
          </div>
          <Button onClick={handleAddEntry} disabled={!note && !photo}>Add Entry</Button>
          <div className="max-h-[30vh] overflow-y-auto space-y-4 pr-2">
            <h3 className="font-semibold">Activity Log</h3>
            {sortedJournalEntries.length > 0 ? (
                sortedJournalEntries.map(entry => (
                    <Card key={entry.id}>
                        <CardContent className="pt-4">
                            <p className="text-sm text-muted-foreground mb-2">{format(parseISO(entry.date), "MMM d, yyyy 'at' h:mm a")}</p>
                            {entry.note && <p className="mb-2">{entry.note}</p>}
                            {entry.photoDataUri && (
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Image src={entry.photoDataUri} alt="Journal entry" width={100} height={100} className="rounded-md object-cover cursor-pointer" />
                                    </DialogTrigger>
                                    <DialogContent className="p-0 border-0 max-w-screen-sm">
                                        <DialogHeader className="p-4 absolute top-0 left-0 bg-gradient-to-b from-black/50 to-transparent w-full rounded-t-lg">
                                            <DialogTitle className="text-white font-headline">Journal Photo from {format(parseISO(entry.date), "MMM d, yyyy")}</DialogTitle>
                                        </DialogHeader>
                                        <Image src={entry.photoDataUri} alt="Journal entry" width={600} height={600} className="rounded-lg object-contain" />
                                    </DialogContent>
                                </Dialog>
                            )}
                        </CardContent>
                    </Card>
                ))
            ) : (
                <p className="text-sm text-muted-foreground text-center">No journal entries yet.</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

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
                <Dialog>
                    <DialogTrigger className="w-full h-full">
                        <Image src={plant.photoDataUri} alt={plant.commonName} layout="fill" objectFit="cover" />
                    </DialogTrigger>
                    <DialogContent className="p-0 border-0 max-w-screen-sm">
                        <DialogHeader className="p-4 absolute top-0 left-0 bg-gradient-to-b from-black/50 to-transparent w-full rounded-t-lg">
                            <DialogTitle className="text-white font-headline">{plant.commonName}</DialogTitle>
                        </DialogHeader>
                        <Image src={plant.photoDataUri} alt={plant.commonName} width={600} height={600} className="rounded-lg object-contain" />
                    </DialogContent>
                </Dialog>
            </div>
            <div className="w-2/3">
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="font-headline text-xl">{plant.commonName}</CardTitle>
                  <CardDescription>
                    {plant.lastWateringDate
                      ? `Last watered: ${format(parseISO(plant.lastWateringDate), "MMM d 'at' h:mm a")}`
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
                <JournalDialog plant={plant} />
              </CardContent>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

    