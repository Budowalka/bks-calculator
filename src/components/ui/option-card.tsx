"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";
import Image from "next/image";

interface OptionCardProps {
  title: string;
  description?: string;
  image?: string;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function OptionCard({
  title,
  description,
  image,
  selected = false,
  onClick,
  disabled = false,
  className,
  children
}: OptionCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md",
        "border-2",
        selected 
          ? "border-primary bg-primary/5 shadow-md" 
          : "border-border hover:border-primary/50",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onClick={disabled ? undefined : onClick}
    >
      <CardContent className="p-4 relative">
        {selected && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
            <Check className="w-4 h-4 text-primary-foreground" />
          </div>
        )}
        
        {image && (
          <div className="mb-3 relative h-32 w-full rounded-md overflow-hidden bg-gray-50 border border-gray-100">
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover transition-transform duration-200 hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}
        
        <div className="space-y-1">
          <h3 className="font-medium text-foreground">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        
        {children}
      </CardContent>
    </Card>
  );
}