"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useGarden } from "@/hooks/use-garden.tsx";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { diagnosePlantProblems, type DiagnosePlantProblemsOutput } from "@/ai/flows/diagnose-plant-problems";
import { Loader2, Sparkles, Stethoscope } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { IdentifiedPlant, Plant } from "@/lib/types";


export default function PlantDoctorView() {
  const { garden, isInitialized, identifiedPlant, setIdentifiedPlant } = useGarden();
  const [selectedPlant, setSelectedPlant] = useState<string>("");
  const [problemDescription, setProblemDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState<DiagnosePlantProblemsOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [activePlantForDiagnosis, setActivePlantForDiagnosis] = useState<Plant | IdentifiedPlant | undefined>();

  useEffect(() => {
    if (selectedPlant === "identified" && identifiedPlant) {
      setActivePlantForDiagnosis(identifiedPlant);
    } else {
      setActivePlantForDiagnosis(garden.find(p => p.id === selectedPlant));
    }
  }, [selectedPlant, identifiedPlant, garden]);


  useEffect(() => {
    if (identifiedPlant) {
      setSelectedPlant("identified");
    } else if (garden.length > 0 && selectedPlant === 'identified') {
        setSelectedPlant(garden[0]?.id || "");
    } else if (garden.length > 0 && !garden.find(p => p.id === selectedPlant)) {
        setSelectedPlant(garden[0]?.id || "");
    }
  }, [identifiedPlant, garden, selectedPlant]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlant || !problemDescription) {
      setError("Please select a plant and describe the problem.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setDiagnosis(null);

    // Find the plant name to send to the AI flow.
    const plantName = activePlantForDiagnosis?.commonName;
    if (!plantName) {
        setError("Could not find the selected plant.");
        setIsLoading(false);
        return;
    }

    try {
      const result = await diagnosePlantProblems({
        plantName: plantName,
        problemDescription,
      });
      setDiagnosis(result);
    } catch (e) {
      setError("Sorry, the Plant Doctor couldn't make a diagnosis. Please try again.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSelectChange = (value: string) => {
    if (value !== 'identified') {
        // When user selects a plant from the garden, we can clear the identifiedPlant from context
        setIdentifiedPlant(null);
    }
    setSelectedPlant(value);
  }

  if (!isInitialized) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (garden.length === 0 && !identifiedPlant) {
    return (
       <div className="text-center flex flex-col items-center justify-center h-full text-muted-foreground">
        <Stethoscope className="w-24 h-24 mb-4 text-primary/50" />
        <h2 className="font-headline text-2xl font-semibold text-foreground">Identify or Add a Plant First</h2>
        <p>You need a plant to use the Plant Doctor.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center gap-2"><Stethoscope className="text-primary"/>Plant Doctor</CardTitle>
          <CardDescription>Get an AI-powered diagnosis for your plant's problems.</CardDescription>
        </CardHeader>
        <CardContent>
          {activePlantForDiagnosis?.photoDataUri && (
            <div className="relative w-full h-48 rounded-lg overflow-hidden mb-4">
              <Image src={activePlantForDiagnosis.photoDataUri} alt={activePlantForDiagnosis.commonName} layout="fill" objectFit="cover" />
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="plant-select">Which plant is having issues?</Label>
              <Select onValueChange={handleSelectChange} value={selectedPlant}>
                <SelectTrigger id="plant-select">
                  <SelectValue placeholder="Select a plant" />
                </SelectTrigger>
                <SelectContent>
                  {identifiedPlant && (
                    <SelectItem key="identified" value="identified">{identifiedPlant.commonName} (Newly Identified)</SelectItem>
                  )}
                  {garden.map((plant) => (
                    <SelectItem key={plant.id} value={plant.id}>{plant.commonName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="problem-description">Describe the problem</Label>
              <Textarea
                id="problem-description"
                placeholder="e.g., The leaves are turning yellow and have brown spots."
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
                rows={4}
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Diagnosing...
                </>
              ) : "Get Diagnosis"}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {error && <p className="text-destructive text-center">{error}</p>}
      
      {diagnosis && activePlantForDiagnosis && (
        <Card className="shadow-md">
           <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><Sparkles className="text-accent" /> Diagnosis for {activePlantForDiagnosis.commonName}</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
                <AlertDescription>{diagnosis.diagnosis}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
