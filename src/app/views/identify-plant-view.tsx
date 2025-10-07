"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Camera, Loader2, Sparkles, CheckCircle } from "lucide-react";
import { identifyPlantFromImage, type IdentifyPlantFromImageOutput } from "@/ai/flows/identify-plant-from-image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useGarden } from "@/hooks/use-garden";
import { useToast } from "@/hooks/use-toast";

export default function IdentifyPlantView() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<IdentifyPlantFromImageOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addPlant } = useGarden();
  const { toast } = useToast();

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setResult(null);
        setError(null);
        setIsSaved(false);
        handleSubmit(reader.result as string);
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

  const triggerFileSelect = () => fileInputRef.current?.click();

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
                <CardContent className="flex items-start space-x-3">
                  <Sparkles className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                  <p><span className="font-bold">Fun Fact:</span> {result.funFact}</p>
                </CardContent>
                <CardFooter>
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
