import type { ApproachKey, PaletteKey } from "../types";

export type Palette = {
  name: string;
  description: string;
  background: string;
  surface: string;
  surfaceAlt: string;
  textPrimary: string;
  textSecondary: string;
};

export const palettes: Record<PaletteKey, Palette> = {
  nocturne: {
    name: "Nocturne Premium",
    description: "Elegante e sofisticado com tons azulados profundos",
    background: "#0a0a0a",
    surface: "#1a1a2e",
    surfaceAlt: "#16213e",
    textPrimary: "#e8e8e8",
    textSecondary: "#9ca3af",
  },
  ocean: {
    name: "Deep Ocean",
    description: "Tons marinhos profundos com cores terrosas",
    background: "#0f1419",
    surface: "#1a2332",
    surfaceAlt: "#0d1117",
    textPrimary: "#f0f2f5",
    textSecondary: "#8892a4",
  },
  neon: {
    name: "Neon Edge",
    description: "Vibrante e futurista com cores neon intensas",
    background: "#0d1b2a",
    surface: "#1e3a5f",
    surfaceAlt: "#15263a",
    textPrimary: "#f0f9ff",
    textSecondary: "#94a3b8",
  },
};

export type Approach = {
  name: string;
  description: string;
};

export const approaches: Record<ApproachKey, Approach> = {
  elevated: {
    name: "Elevated & Glow",
    description: "Gradiente sutil, sombra com glow colorido e dot lateral",
  },
  border: {
    name: "Border & Accent",
    description:
      "Borda esquerda colorida, checkmark e peso de fonte diferenciado",
  },
  indicator: {
    name: "Status Indicator",
    description: "Dot pulsante grande, tint sutil no fundo e sombra interna",
  },
};

export const PRESET_COLORS: { label: string; value: string }[] = [
  { label: "Coral", value: "#FF6B6B" },
  { label: "Laranja", value: "#FF9F43" },
  { label: "Amarelo", value: "#FECA57" },
  { label: "Lima", value: "#A8E063" },
  { label: "Menta", value: "#26de81" },
  { label: "Turquesa", value: "#2BCBBA" },
  { label: "Ciano", value: "#45AAF2" },
  { label: "Azul", value: "#4B7BEC" },
  { label: "Índigo", value: "#6C5CE7" },
  { label: "Rosa", value: "#FD79A8" },
  { label: "Vermelho", value: "#D63031" },
  { label: "Lavanda", value: "#A29BFE" },
];
