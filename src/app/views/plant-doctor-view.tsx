
"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useGarden } from "@/hooks/use-garden.tsx";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { diagnosePlantProblems } from "@/ai/flows/diagnose-plant-problems";
import { Loader2, Send, Stethoscope, User, Bot } from "lucide-react";
import type { IdentifiedPlant, Plant } from "@/lib/types";

type ChatMessage = {
  role: 'user' | 'model';
  content: string;
};

export default function PlantDoctorView() {
  const { garden, isInitialized, identifiedPlant, setIdentifiedPlant } = useGarden();
  const [selectedPlant, setSelectedPlant] = useState<string>("");
  const [activePlantForDiagnosis, setActivePlantForDiagnosis] = useState<Plant | IdentifiedPlant | undefined>();
  
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedPlant === "identified" && identifiedPlant) {
      setActivePlantForDiagnosis(identifiedPlant);
    } else {
      const foundPlant = garden.find(p => p.id === selectedPlant);
      setActivePlantForDiagnosis(foundPlant);
    }
  }, [selectedPlant, identifiedPlant, garden]);

  useEffect(() => {
    if (identifiedPlant) {
      if(selectedPlant !== "identified"){
        setChatHistory([]); // Reset chat when plant changes
      }
      setSelectedPlant("identified");
    } else if (garden.length > 0 && (selectedPlant === 'identified' || !garden.find(p => p.id === selectedPlant))) {
        setSelectedPlant(garden[0]?.id || "");
        setChatHistory([]); // Reset chat when plant changes
    }
  }, [identifiedPlant, garden]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || !activePlantForDiagnosis) return;

    const newUserMessage: ChatMessage = { role: 'user', content: userInput };
    setChatHistory(prev => [...prev, newUserMessage]);
    setUserInput("");
    setIsLoading(true);

    try {
      const result = await diagnosePlantProblems({
        plantName: activePlantForDiagnosis.commonName,
        problemDescription: userInput,
        chatHistory: chatHistory,
      });
      const modelMessage: ChatMessage = { role: 'model', content: result.diagnosis };
      setChatHistory(prev => [...prev, modelMessage]);
    } catch (e) {
      const errorMessage: ChatMessage = { role: 'model', content: "Sorry, the Plant Doctor is having trouble responding. Please try again." };
      setChatHistory(prev => [...prev, errorMessage]);
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectChange = (value: string) => {
    if (value !== 'identified') {
      setIdentifiedPlant(null);
    }
    setSelectedPlant(value);
    setChatHistory([]); // Reset chat when plant selection changes
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
    <div className="flex flex-col h-full">
      <Card className="shadow-lg flex-shrink-0">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center gap-2"><Stethoscope className="text-primary"/>Plant Doctor</CardTitle>
          <CardDescription>Chat with an AI expert about your plant's problems.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
              <Label htmlFor="plant-select">Which plant are we talking about?</Label>
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
        </CardContent>
      </Card>
      
      <div className="flex-grow mt-4 bg-muted/30 rounded-lg p-4 space-y-4 overflow-y-auto" ref={chatContainerRef}>
        {activePlantForDiagnosis && chatHistory.length === 0 && (
             <div className="text-center text-muted-foreground p-4">
                <Bot className="mx-auto h-8 w-8 mb-2" />
                <p>Hello! I'm the LeafWise Plant Doctor. How can I help with your {activePlantForDiagnosis.commonName} today?</p>
             </div>
        )}
        {chatHistory.map((message, index) => (
            <div key={index} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                {message.role === 'model' && <Bot className="h-6 w-6 text-primary flex-shrink-0" />}
                <div className={`rounded-lg p-3 max-w-sm ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-background shadow-sm'}`}>
                    <p className="text-sm">{message.content}</p>
                </div>
                 {message.role === 'user' && <User className="h-6 w-6 text-muted-foreground flex-shrink-0" />}
            </div>
        ))}
         {isLoading && (
          <div className="flex items-start gap-3">
            <Bot className="h-6 w-6 text-primary flex-shrink-0" />
            <div className="rounded-lg p-3 max-w-sm bg-background shadow-sm">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <p className="text-sm text-muted-foreground">Thinking...</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSendMessage} className="mt-4 flex items-center gap-2">
        <Input
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder={activePlantForDiagnosis ? `Message about ${activePlantForDiagnosis.commonName}...` : "Select a plant first"}
          disabled={!activePlantForDiagnosis || isLoading}
        />
        <Button type="submit" size="icon" disabled={!activePlantForDiagnosis || isLoading || !userInput.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
