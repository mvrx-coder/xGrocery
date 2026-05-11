export type User = {
  id: number;
  name: string;
};

export type Category = {
  id: number;
  nome: string;
  cor: string;
  ordem_exibicao: number;
};

export type Item = {
  id: number;
  nome: string;
  categoria_id: number;
  ativo: boolean;
  quantidade: number | null;
  updated_at: string;
};

export type PaletteKey = "nocturne" | "ocean" | "neon";
export type ApproachKey = "elevated" | "border" | "indicator";

export type Settings = {
  id: number;
  paleta: PaletteKey;
  estilo_diferenciacao: ApproachKey;
};
