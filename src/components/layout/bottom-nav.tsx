"use client";

import type { Dispatch, SetStateAction } from "react";
import { Camera, Sprout, Stethoscope } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { View } from "@/app/page";

interface BottomNavProps {
  activeView: View;
  setActiveView: Dispatch<SetStateAction<View>>;
}

const navItems: { view: View; icon: React.ElementType; label: string }[] = [
  { view: "identify", icon: Camera, label: "Identify" },
  { view: "garden", icon: Sprout, label: "My Garden" },
  { view: "doctor", icon: Stethoscope, label: "Plant Doctor" },
];

export default function BottomNav({ activeView, setActiveView }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-card border-t max-w-md mx-auto">
      <div className="flex justify-around items-center h-full">
        {navItems.map((item) => (
          <Button
            key={item.view}
            variant="ghost"
            className={cn(
              "flex flex-col items-center justify-center h-full rounded-none space-y-1 w-full",
              activeView === item.view
                ? "text-accent-foreground bg-accent/80"
                : "text-muted-foreground"
            )}
            onClick={() => setActiveView(item.view)}
            aria-current={activeView === item.view ? "page" : undefined}
          >
            <item.icon className="h-6 w-6" />
            <span className="text-xs font-medium">{item.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
