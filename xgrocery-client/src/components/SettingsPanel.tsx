import { AnimatePresence, motion } from "framer-motion";
import {
  Grid2x2,
  Layers,
  LogOut,
  Palette as PaletteIcon,
  X,
} from "lucide-react";
import { approaches, palettes } from "../data/palettes";
import type { Palette } from "../data/palettes";
import type { ApproachKey, PaletteKey } from "../types";

type SettingsPanelProps = {
  open: boolean;
  onClose: () => void;
  currentPalette: PaletteKey;
  currentApproach: ApproachKey;
  onPaletteChange: (palette: PaletteKey) => void;
  onApproachChange: (approach: ApproachKey) => void;
  onCompare: (mode: "palettes" | "approaches") => void;
  onLogout: () => void;
  palette: Palette;
  accentColor: string;
};

export function SettingsPanel({
  open,
  onClose,
  currentPalette,
  currentApproach,
  onPaletteChange,
  onApproachChange,
  onCompare,
  onLogout,
  palette,
  accentColor,
}: SettingsPanelProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50"
          onClick={onClose}
        >
          <div
            className="absolute inset-0"
            style={{ backgroundColor: `${palette.background}90` }}
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute right-0 top-0 bottom-0 w-full max-w-sm overflow-y-auto"
            style={{ backgroundColor: palette.surface }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="sticky top-0 flex items-center justify-between px-4 py-4 border-b z-10"
              style={{
                borderColor: palette.surfaceAlt,
                backgroundColor: palette.surface,
              }}
            >
              <h2
                className="text-lg font-semibold"
                style={{ color: palette.textPrimary }}
              >
                Configurações
              </h2>
              <button onClick={onClose} className="p-2 -mr-2 rounded-lg">
                <X size={20} style={{ color: palette.textSecondary }} />
              </button>
            </div>

            <div className="p-4 space-y-6">
              <section className="flex gap-2">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onClose();
                    onCompare("palettes");
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl"
                  style={{
                    backgroundColor: palette.surfaceAlt,
                    color: palette.textPrimary,
                  }}
                >
                  <Grid2x2 size={18} />
                  <span className="text-sm font-medium">Comparar Paletas</span>
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onClose();
                    onCompare("approaches");
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl"
                  style={{
                    backgroundColor: palette.surfaceAlt,
                    color: palette.textPrimary,
                  }}
                >
                  <Grid2x2 size={18} />
                  <span className="text-sm font-medium">Comparar Estilos</span>
                </motion.button>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-3">
                  <PaletteIcon
                    size={18}
                    style={{ color: palette.textSecondary }}
                  />
                  <h3
                    className="text-sm font-semibold uppercase tracking-wider"
                    style={{ color: palette.textSecondary }}
                  >
                    Paleta de Cores
                  </h3>
                </div>

                <div className="space-y-2">
                  {(Object.keys(palettes) as PaletteKey[]).map((key) => {
                    const p = palettes[key];
                    const isSelected = key === currentPalette;

                    return (
                      <motion.button
                        key={key}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onPaletteChange(key)}
                        className="w-full p-4 rounded-xl text-left transition-all"
                        style={{
                          backgroundColor: isSelected
                            ? palette.surfaceAlt
                            : "transparent",
                          border: isSelected
                            ? `2px solid ${accentColor}`
                            : `2px solid transparent`,
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className="font-semibold"
                            style={{ color: palette.textPrimary }}
                          >
                            {p.name}
                          </span>
                          {isSelected && (
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: accentColor }}
                            />
                          )}
                        </div>
                        <p
                          className="text-sm"
                          style={{ color: palette.textSecondary }}
                        >
                          {p.description}
                        </p>
                      </motion.button>
                    );
                  })}
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Layers size={18} style={{ color: palette.textSecondary }} />
                  <h3
                    className="text-sm font-semibold uppercase tracking-wider"
                    style={{ color: palette.textSecondary }}
                  >
                    Estilo Visual
                  </h3>
                </div>

                <div className="space-y-2">
                  {(Object.keys(approaches) as ApproachKey[]).map((key) => {
                    const a = approaches[key];
                    const isSelected = key === currentApproach;

                    return (
                      <motion.button
                        key={key}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onApproachChange(key)}
                        className="w-full p-4 rounded-xl text-left transition-all"
                        style={{
                          backgroundColor: isSelected
                            ? palette.surfaceAlt
                            : "transparent",
                          border: isSelected
                            ? `2px solid ${accentColor}`
                            : `2px solid transparent`,
                        }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className="font-semibold"
                            style={{ color: palette.textPrimary }}
                          >
                            {a.name}
                          </span>
                          {isSelected && (
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: accentColor }}
                            />
                          )}
                        </div>
                        <p
                          className="text-sm"
                          style={{ color: palette.textSecondary }}
                        >
                          {a.description}
                        </p>
                      </motion.button>
                    );
                  })}
                </div>
              </section>

              <section
                className="pt-4 border-t"
                style={{ borderColor: palette.surfaceAlt }}
              >
                <button
                  onClick={onLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl"
                  style={{
                    backgroundColor: palette.surfaceAlt,
                    color: palette.textPrimary,
                  }}
                >
                  <LogOut size={18} />
                  <span className="text-sm font-medium">Sair</span>
                </button>
              </section>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
