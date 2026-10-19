import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { photoUrl } from "../api";
import type { Item } from "../types";
import type { Palette } from "../data/palettes";

type PhotoViewerProps = {
  item: Item | null;
  onClose: () => void;
  palette: Palette;
};

// Foto em tela cheia. Toque em qualquer lugar fecha.
export function PhotoViewer({ item, onClose, palette }: PhotoViewerProps) {
  return (
    <AnimatePresence>
      {item && item.foto_versao != null && (
        <motion.div
          key={item.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.92)" }}
          onClick={onClose}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full"
            style={{ backgroundColor: `${palette.surface}cc` }}
            aria-label="Fechar"
          >
            <X size={22} style={{ color: palette.textPrimary }} />
          </button>

          <motion.img
            initial={{ scale: 0.92 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 25, stiffness: 250 }}
            src={photoUrl(item)}
            alt={item.nome}
            className="max-w-full max-h-[80dvh] rounded-xl object-contain"
            // Miniatura (já em cache) como fundo enquanto a foto cheia carrega.
            style={{
              backgroundImage: `url("${photoUrl(item, true)}")`,
              backgroundSize: "cover",
            }}
          />

          <span
            className="mt-4 text-lg font-semibold text-center"
            style={{ color: "#ffffff" }}
          >
            {item.nome}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
