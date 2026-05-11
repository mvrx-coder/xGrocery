import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { Item } from "../types";
import type { Palette } from "../data/palettes";
import { firstName } from "../constants";

type QuantityDrawerProps = {
  item: Item | null;
  userName: string;
  accentColor: string;
  palette: Palette;
  onClose: () => void;
  onSave: (quantity: number | null) => void;
};

export function QuantityDrawer({
  item,
  userName,
  accentColor,
  palette,
  onClose,
  onSave,
}: QuantityDrawerProps) {
  const [value, setValue] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (item) {
      setValue(item.quantidade != null ? String(item.quantidade) : "");
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [item]);

  function handleSave() {
    const parsed = parseInt(value, 10);
    if (Number.isNaN(parsed) || parsed <= 0) {
      onSave(null);
    } else {
      onSave(parsed);
    }
  }

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center"
          onClick={onClose}
        >
          <div
            className="absolute inset-0"
            style={{ backgroundColor: `${palette.background}cc` }}
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="relative w-full max-w-md rounded-t-3xl overflow-hidden"
            style={{ backgroundColor: palette.surface }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div
                className="w-10 h-1 rounded-full"
                style={{ backgroundColor: palette.surfaceAlt }}
              />
            </div>

            <div
              className="flex items-center justify-between px-5 py-3 border-b"
              style={{ borderColor: palette.surfaceAlt }}
            >
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: palette.textSecondary }}
              >
                Quantidade
              </span>
              <button
                onClick={onClose}
                className="p-2 -mr-2 rounded-lg"
                aria-label="Fechar"
              >
                <X size={18} style={{ color: palette.textSecondary }} />
              </button>
            </div>

            <div className="px-5 py-6 space-y-5">
              <div>
                <p
                  className="text-lg font-semibold leading-snug"
                  style={{ color: palette.textPrimary }}
                >
                  {firstName(userName)}, você quer quantos desse?
                </p>
                <p
                  className="text-sm mt-1"
                  style={{ color: palette.textSecondary }}
                >
                  {item.nome}
                </p>
              </div>

              <input
                ref={inputRef}
                type="number"
                inputMode="numeric"
                min={1}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSave();
                }}
                placeholder="Ex: 6"
                className="w-full text-center text-4xl font-bold py-4 rounded-2xl outline-none tabular-nums"
                style={{
                  backgroundColor: palette.surfaceAlt,
                  color: accentColor,
                  caretColor: accentColor,
                }}
              />

              <p
                className="text-xs text-center"
                style={{ color: palette.textSecondary }}
              >
                Deixe em branco ou 1 para não exibir o contador.
              </p>

              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl"
                  style={{
                    backgroundColor: palette.surfaceAlt,
                    color: palette.textPrimary,
                  }}
                >
                  Cancelar
                </button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  className="flex-1 py-3 rounded-xl font-semibold"
                  style={{ backgroundColor: accentColor, color: "#0a0a0a" }}
                >
                  Salvar
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
