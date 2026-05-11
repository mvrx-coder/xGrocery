import { AnimatePresence, motion } from "framer-motion";
import { Edit3, Trash2, X } from "lucide-react";
import { useState } from "react";
import type { Item } from "../types";
import type { Palette } from "../data/palettes";

type ContextMenuProps = {
  item: Item | null;
  onClose: () => void;
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
  palette: Palette;
  accentColor: string;
};

export function ContextMenu({
  item,
  onClose,
  onEdit,
  onDelete,
  palette,
  accentColor,
}: ContextMenuProps) {
  const [confirming, setConfirming] = useState(false);

  if (!item) return null;

  function close() {
    setConfirming(false);
    onClose();
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center"
        onClick={close}
      >
        <div
          className="absolute inset-0"
          style={{ backgroundColor: `${palette.background}cc` }}
        />

        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="relative w-full max-w-md mx-4 mb-8 rounded-2xl overflow-hidden"
          style={{ backgroundColor: palette.surface }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="flex items-center justify-between px-4 py-3 border-b"
            style={{ borderColor: palette.surfaceAlt }}
          >
            <span
              className="text-base font-semibold truncate pr-4"
              style={{ color: palette.textPrimary }}
            >
              {item.nome}
            </span>
            <button
              onClick={close}
              className="p-2 -mr-2 rounded-lg flex-shrink-0"
              aria-label="Fechar"
            >
              <X size={20} style={{ color: palette.textSecondary }} />
            </button>
          </div>

          {!confirming && (
            <div className="p-2">
              <button
                onClick={() => {
                  onEdit(item);
                  close();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors"
                style={{ color: palette.textPrimary }}
              >
                <Edit3 size={20} style={{ color: accentColor }} />
                <span className="text-base">Editar item</span>
              </button>

              <button
                onClick={() => setConfirming(true)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors"
                style={{ color: palette.textPrimary }}
              >
                <Trash2 size={20} style={{ color: "#ff6b6b" }} />
                <span className="text-base">Excluir item</span>
              </button>
            </div>
          )}

          {confirming && (
            <div className="p-4 space-y-3">
              <p style={{ color: palette.textPrimary }}>
                Excluir <strong>{item.nome}</strong>?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirming(false)}
                  className="flex-1 py-3 rounded-xl"
                  style={{
                    backgroundColor: palette.surfaceAlt,
                    color: palette.textPrimary,
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    onDelete(item);
                    close();
                  }}
                  className="flex-1 py-3 rounded-xl font-semibold"
                  style={{ backgroundColor: "#ff6b6b", color: "#0a0a0a" }}
                >
                  Excluir
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
