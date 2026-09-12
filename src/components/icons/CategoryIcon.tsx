import React from "react";
import {
  ShieldCheck,
  Sparkles,
  Headphones,
  Volume2,
  Zap,
  Watch,
  Radio,
  Cable,
  Grid
} from "lucide-react";

interface CategoryIconProps {
  categoryId: string;
  className?: string;
  active?: boolean;
}

export default function CategoryIcon({
  categoryId,
  className = "w-4 h-4",
  active = false,
}: CategoryIconProps) {
  const getIcon = () => {
    switch (categoryId) {
      case "cases-covers":
        return <ShieldCheck className={`${className} ${active ? "text-white" : "text-blue-600"}`} />;
      case "screen-protectors":
        return <Sparkles className={`${className} ${active ? "text-white" : "text-cyan-600"}`} />;
      case "earphones-tws":
        return <Headphones className={`${className} ${active ? "text-white" : "text-purple-600"}`} />;
      case "headphones":
        return <Volume2 className={`${className} ${active ? "text-white" : "text-pink-600"}`} />;
      case "chargers-powerbanks":
        return <Zap className={`${className} ${active ? "text-white" : "text-amber-500 fill-amber-500/20"}`} />;
      case "smartwatches":
        return <Watch className={`${className} ${active ? "text-white" : "text-orange-600"}`} />;
      case "bluetooth-speakers":
        return <Radio className={`${className} ${active ? "text-white" : "text-indigo-600"}`} />;
      case "cables-adapters":
        return <Cable className={`${className} ${active ? "text-white" : "text-emerald-600"}`} />;
      default:
        return <Grid className={`${className} ${active ? "text-white" : "text-slate-600"}`} />;
    }
  };

  return <span className="inline-flex items-center justify-center shrink-0">{getIcon()}</span>;
}
