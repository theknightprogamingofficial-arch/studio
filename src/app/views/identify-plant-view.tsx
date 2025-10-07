
"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Camera, Loader2, Sparkles, CheckCircle, BookOpen, Droplets, Sun, Layers, Sprout, Home } from "lucide-react";
import { identifyPlantFromImage } from "@/ai/flows/identify-plant-from-image";
import { getPlantCareGuide } from "@/ai/flows/get-plant-care-guide";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useGarden } from "@/hooks/use-garden.tsx";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import type { IdentifyPlantFromImageOutput, GetPlantCareGuideOutput } from "@/lib/types";


export default function IdentifyPlantView() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<IdentifyPlantFromImageOutput | null>(null);
  const [careGuide, setCareGuide] = useState<GetPlantCareGuideOutput | null>(null);
  const [isLoadingCareGuide, setIsLoadingCareGuide] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addPlant, setIdentifiedPlant } = useGarden();
  const { toast } = useToast();

  useEffect(() => {
    if (result && imagePreview) {
      setIdentifiedPlant({
        commonName: result.commonName,
        latinName: result.latinName,
        funFact: result.funFact,
        photoDataUri: imagePreview,
      });
    } else {
      setIdentifiedPlant(null);
    }
  }, [result, imagePreview, setIdentifiedPlant]);


  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const photoDataUri = reader.result as string;
        setImagePreview(photoDataUri);
        setResult(null);
        setCareGuide(null);
        setError(null);
        setIsSaved(false);
        handleSubmit(photoDataUri);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (photoDataUri: string) => {
    setIsLoading(true);
    try {
      const identificationResult = await identifyPlantFromImage({ photoDataUri });
      setResult(identificationResult);
    } catch (e) {
      setError("Sorry, I couldn't identify that plant. Please try another image.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetCareGuide = async () => {
    if (!result) return;
    setIsLoadingCareGuide(true);
    setCareGuide(null);
    try {
      const guide = await getPlantCareGuide({ plantName: result.commonName });
      setCareGuide(guide);
    } catch (e) {
      setError("Sorry, I couldn't generate a care guide at this time.");
      console.error(e);
    } finally {
      setIsLoadingCareGuide(false);
    }
  };

  const handleSaveToGarden = () => {
    if (result && imagePreview) {
      addPlant({
        commonName: result.commonName,
        latinName: result.latinName,
        funFact: result.funFact,
        photoDataUri: imagePreview,
      });
      setIsSaved(true);
      toast({
        title: "Plant Saved!",
        description: `${result.commonName} has been added to your garden.`,
      });
    }
  };

  const triggerFileSelect = () => {
    setIdentifiedPlant(null);
    fileInputRef.current?.click();
  }

  return (
    <div className="space-y-6">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageChange}
        className="hidden"
        accept="image/*"
      />
      
      {!imagePreview && (
        <Card className="text-center shadow-lg border-2 border-dashed border-primary/50 hover:border-primary transition-colors duration-300">
          <CardHeader>
            <h2 className="font-headline text-2xl font-semibold">Identify a New Plant</h2>
            <CardDescription>Upload a photo to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <div 
              className="flex flex-col items-center justify-center p-8 bg-muted/50 rounded-lg cursor-pointer"
              onClick={triggerFileSelect}
              onKeyDown={(e) => e.key === 'Enter' && triggerFileSelect()}
              role="button"
              tabIndex={0}
              aria-label="Upload a plant photo"
            >
              <Camera className="w-16 h-16 text-primary mb-4" />
              <p className="text-muted-foreground">Tap here to upload a photo</p>
            </div>
          </CardContent>
        </Card>
      )}

      {imagePreview && (
        <Card className="overflow-hidden shadow-lg">
          <CardHeader>
             <h2 className="font-headline text-2xl font-semibold">Identification Result</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative w-full h-64 rounded-lg overflow-hidden">
              <Image src={imagePreview} alt="Uploaded plant" layout="fill" objectFit="cover" />
            </div>

            {isLoading && (
              <div className="flex items-center justify-center p-6 space-x-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Identifying your plant...</span>
              </div>
            )}

            {error && <p className="text-destructive text-center">{error}</p>}

            {result && (
              <Card className="bg-background">
                <CardHeader>
                  <CardTitle className="font-headline text-primary text-3xl">{result.commonName}</CardTitle>
                  <CardDescription className="italic">{result.latinName}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Sparkles className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                    <p><span className="font-bold">Fun Fact:</span> {result.funFact}</p>
                  </div>
                   <Dialog>
                    <DialogTrigger asChild>
                      <Button onClick={handleGetCareGuide} disabled={isLoadingCareGuide} className="w-full">
                        {isLoadingCareGuide ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating Guide...
                          </>
                        ) : (
                          <>
                          <BookOpen className="mr-2 h-4 w-4"/>
                            Get Care Guide
                          </>
                        )}
                      </Button>
                    </DialogTrigger>
                    {careGuide && (
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="font-headline text-2xl">{result.commonName} Care Guide</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
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
                              <Layers className="h-4 w-4" />
                              <AlertTitle>Soil</AlertTitle>
                              <AlertDescription>{careGuide.soil}</AlertDescription>
                          </Alert>
                           <Alert>
                              <Sprout className="h-4 w-4" />
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
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="outline">Close</Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    )}
                   </Dialog>
                </CardContent>
                <CardFooter className="flex-col gap-2">
                  <Button onClick={handleSaveToGarden} disabled={isSaved} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                    {isSaved ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Saved to Garden
                      </>
                    ) : (
                      "Save to My Garden"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            )}
          </CardContent>
          <CardFooter>
             <Button variant="outline" onClick={triggerFileSelect} className="w-full">
                Upload Another Photo
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
