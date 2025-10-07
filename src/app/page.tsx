
"use client";

import { useState } from "react";
import MyGardenView from "@/app/views/my-garden-view";
import IdentifyPlantView from "@/app/views/identify-plant-view";
import PlantDoctorView from "@/app/views/plant-doctor-view";
import BottomNav from "@/components/layout/bottom-nav";
import { LeafWiseLogo } from "@/components/icons";
import { AppProvider } from "@/hooks/use-garden.tsx";
import { Code } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type View = "identify" | "garden" | "doctor";

export default function Home() {
  const [activeView, setActiveView] = useState<View>("identify");

  const renderView = () => {
    switch (activeView) {
      case "identify":
        return <IdentifyPlantView />;
      case "garden":
        return <MyGardenView />;
      case "doctor":
        return <PlantDoctorView />;
      default:
        return <IdentifyPlantView />;
    }
  };

  return (
    <AppProvider>
      <TooltipProvider>
        <div className="flex flex-col h-screen w-full max-w-md mx-auto bg-background/90 backdrop-blur-sm">
          <header className="p-4 flex items-center justify-between bg-card/80 backdrop-blur-sm border-b">
            <div className="flex items-center gap-2">
              <LeafWiseLogo className="h-8 w-8 text-primary" />
              <h1 className="font-headline text-2xl font-bold text-foreground">
                LeafWise
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">By CodeCrafters</p>
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                    }}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Code className="h-5 w-5" />
                  </a>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="p-1">
                    <h3 className="font-bold mb-1">Developed By</h3>
                    <ul className="list-disc list-inside text-sm">
                      <li>Sahil Jagtap</li>
                      <li>Omkar Gawali</li>
                      <li>Adarsh Salunkhe</li>
                    </ul>
                    <h3 className="font-bold mt-2 mb-1">Guided By</h3>
                    <p className="text-sm">Yashanjali Sisodia</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
          </header>

          <main className="flex-grow overflow-y-auto p-4 pb-24">
            {renderView()}
          </main>

          <BottomNav activeView={activeView} setActiveView={setActiveView} />
        </div>
      </TooltipProvider>
    </AppProvider>
  );
}
