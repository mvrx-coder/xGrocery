import { motion } from "framer-motion";
import { Layers, Palette as PaletteIcon, X } from "lucide-react";
import { approaches, palettes } from "../data/palettes";
import type { Palette } from "../data/palettes";
import type { ApproachKey, Item, PaletteKey } from "../types";

type ComparisonViewProps = {
  mode: "palettes" | "approaches" | null;
  onClose: () => void;
  currentPalette: PaletteKey;
  currentApproach: ApproachKey;
  sampleColor: string;
};

const sampleActiveItem: Pick<Item, "nome" | "ativo" | "quantidade"> = {
  nome: "Queijo mussarela",
  ativo: true,
  quantidade: 2,
};

const sampleInactiveItem: Pick<Item, "nome" | "ativo" | "quantidade"> = {
  nome: "Iogurte natural",
  ativo: false,
  quantidade: null,
};

function PreviewItem({
  item,
  palette,
  approach,
  categoryColor,
}: {
  item: Pick<Item, "nome" | "ativo" | "quantidade">;
  palette: Palette;
  approach: ApproachKey;
  categoryColor: string;
}) {
  if (approach === "elevated") {
    return (
      <div
        className="rounded-xl p-3"
        style={{
          backgroundColor: item.ativo
            ? `${categoryColor}15`
            : palette.surfaceAlt,
          boxShadow: item.ativo ? `0 4px 15px ${categoryColor}30` : "none",
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{
              backgroundColor: item.ativo
                ? categoryColor
                : palette.textSecondary,
              opacity: item.ativo ? 1 : 0.3,
            }}
          />
          <span
            className="text-sm truncate"
            style={{
              color: item.ativo ? palette.textPrimary : palette.textSecondary,
            }}
          >
            {item.nome}
          </span>
        </div>
      </div>
    );
  }

  if (approach === "border") {
    return (
      <div
        className="rounded-xl p-3 relative overflow-hidden"
        style={{
          backgroundColor: item.ativo ? palette.surface : palette.surfaceAlt,
        }}
      >
        {item.ativo && (
          <div
            className="absolute left-0 top-0 bottom-0 w-1"
            style={{ backgroundColor: categoryColor }}
          />
        )}
        <div className="flex items-center gap-2">
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: item.ativo
                ? `${categoryColor}30`
                : "transparent",
              border: item.ativo
                ? "none"
                : `1px solid ${palette.textSecondary}`,
            }}
          >
            {item.ativo && (
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path
                  d="M1 4L3.5 6.5L9 1"
                  stroke={categoryColor}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
          <span
            className="text-sm truncate"
            style={{
              color: item.ativo ? palette.textPrimary : palette.textSecondary,
              fontWeight: item.ativo ? 600 : 400,
            }}
          >
            {item.nome}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl p-3"
      style={{
        backgroundColor: item.ativo ? `${categoryColor}10` : palette.surfaceAlt,
        boxShadow: item.ativo ? `inset 0 2px 8px ${categoryColor}15` : "none",
      }}
    >
      <div className="flex items-center gap-2">
        <div
          className="rounded-full flex-shrink-0"
          style={{
            width: item.ativo ? 10 : 7,
            height: item.ativo ? 10 : 7,
            backgroundColor: item.ativo ? categoryColor : palette.textSecondary,
            opacity: item.ativo ? 1 : 0.4,
          }}
        />
        <span
          className="text-sm truncate"
          style={{
            color: item.ativo ? palette.textPrimary : palette.textSecondary,
          }}
        >
          {item.nome}
        </span>
      </div>
    </div>
  );
}

export function ComparisonView({
  mode,
  onClose,
  currentPalette,
  currentApproach,
  sampleColor,
}: ComparisonViewProps) {
  if (!mode) return null;

  const paletteData = palettes[currentPalette];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ backgroundColor: paletteData.background }}
    >
      <div
        className="sticky top-0 z-10 flex items-center justify-between px-4 py-4 border-b"
        style={{
          backgroundColor: paletteData.background,
          borderColor: paletteData.surfaceAlt,
        }}
      >
        <div className="flex items-center gap-2">
          {mode === "palettes" ? (
            <PaletteIcon size={20} style={{ color: paletteData.textPrimary }} />
          ) : (
            <Layers size={20} style={{ color: paletteData.textPrimary }} />
          )}
          <h2
            className="text-lg font-semibold"
            style={{ color: paletteData.textPrimary }}
          >
            {mode === "palettes" ? "Comparar Paletas" : "Comparar Estilos"}
          </h2>
        </div>
        <button onClick={onClose} className="p-2 -mr-2 rounded-lg">
          <X size={20} style={{ color: paletteData.textSecondary }} />
        </button>
      </div>

      <div className="p-4 space-y-6">
        {mode === "palettes" &&
          (Object.keys(palettes) as PaletteKey[]).map((key) => {
            const p = palettes[key];
            return (
              <div
                key={key}
                className="rounded-2xl overflow-hidden"
                style={{ backgroundColor: p.surface }}
              >
                <div
                  className="px-4 py-3 border-b"
                  style={{ borderColor: p.surfaceAlt }}
                >
                  <h3
                    className="font-semibold"
                    style={{ color: p.textPrimary }}
                  >
                    {p.name}
                  </h3>
                  <p className="text-sm" style={{ color: p.textSecondary }}>
                    {p.description}
                  </p>
                </div>
                <div
                  className="p-4 space-y-2"
                  style={{ backgroundColor: p.background }}
                >
                  <PreviewItem
                    item={sampleActiveItem}
                    palette={p}
                    approach={currentApproach}
                    categoryColor={sampleColor}
                  />
                  <PreviewItem
                    item={sampleInactiveItem}
                    palette={p}
                    approach={currentApproach}
                    categoryColor={sampleColor}
                  />
                </div>
              </div>
            );
          })}

        {mode === "approaches" &&
          (Object.keys(approaches) as ApproachKey[]).map((key) => {
            const a = approaches[key];
            return (
              <div
                key={key}
                className="rounded-2xl overflow-hidden"
                style={{ backgroundColor: paletteData.surface }}
              >
                <div
                  className="px-4 py-3 border-b"
                  style={{ borderColor: paletteData.surfaceAlt }}
                >
                  <h3
                    className="font-semibold"
                    style={{ color: paletteData.textPrimary }}
                  >
                    {a.name}
                  </h3>
                  <p
                    className="text-sm"
                    style={{ color: paletteData.textSecondary }}
                  >
                    {a.description}
                  </p>
                </div>
                <div
                  className="p-4 space-y-2"
                  style={{ backgroundColor: paletteData.background }}
                >
                  <PreviewItem
                    item={sampleActiveItem}
                    palette={paletteData}
                    approach={key}
                    categoryColor={sampleColor}
                  />
                  <PreviewItem
                    item={sampleInactiveItem}
                    palette={paletteData}
                    approach={key}
                    categoryColor={sampleColor}
                  />
                </div>
              </div>
            );
          })}
      </div>
    </motion.div>
  );
}
