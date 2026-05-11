import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { Category, Item } from "../types";
import type { Palette } from "../data/palettes";

export type ItemFormData = {
  nome: string;
  categoria_id: number;
};

type Mode =
  | { kind: "create"; prefillName?: string }
  | { kind: "edit"; item: Item };

type ItemDrawerProps = {
  open: boolean;
  mode: Mode | null;
  categories: Category[];
  palette: Palette;
  accentColor: string;
  onClose: () => void;
  onSave: (data: ItemFormData, mode: Mode) => void | Promise<void>;
};

export function ItemDrawer({
  open,
  mode,
  categories,
  palette,
  accentColor,
  onClose,
  onSave,
}: ItemDrawerProps) {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !mode) return;
    if (mode.kind === "edit") {
      setName(mode.item.nome);
      setCategoryId(mode.item.categoria_id);
    } else {
      setName(mode.prefillName ?? "");
      setCategoryId(categories[0]?.id ?? null);
    }
    setTouched(false);
  }, [open, mode, categories]);

  const nameError = touched && name.trim().length === 0;
  const catError = touched && categoryId == null;

  async function handleSave() {
    setTouched(true);
    if (!name.trim() || categoryId == null || !mode) return;
    setSaving(true);
    try {
      await onSave({ nome: name.trim(), categoria_id: categoryId }, mode);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  const title = mode?.kind === "edit" ? "Editar item" : "Novo item";

  return (
    <AnimatePresence>
      {open && mode && (
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
                className="text-base font-semibold"
                style={{ color: palette.textPrimary }}
              >
                {title}
              </span>
              <button
                onClick={onClose}
                className="p-2 -mr-2 rounded-lg"
                aria-label="Fechar"
              >
                <X size={18} style={{ color: palette.textSecondary }} />
              </button>
            </div>

            <div className="px-5 py-5 space-y-5">
              <div className="space-y-2">
                <label
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: palette.textSecondary }}
                >
                  Nome
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Arroz"
                  maxLength={48}
                  className="w-full px-4 py-3 rounded-xl text-base outline-none"
                  style={{
                    backgroundColor: palette.surfaceAlt,
                    color: palette.textPrimary,
                    border: `1.5px solid ${nameError ? "#ff6b6b" : "transparent"}`,
                    caretColor: accentColor,
                  }}
                  autoFocus
                />
                {nameError && (
                  <p className="text-xs" style={{ color: "#ff6b6b" }}>
                    Informe um nome
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: palette.textSecondary }}
                >
                  Categoria
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => {
                    const isSelected = categoryId === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategoryId(cat.id)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg"
                        style={{
                          backgroundColor: isSelected
                            ? `${cat.cor}30`
                            : palette.surfaceAlt,
                          border: `1.5px solid ${isSelected ? cat.cor : "transparent"}`,
                        }}
                      >
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: cat.cor }}
                        />
                        <span
                          className="text-sm"
                          style={{
                            color: isSelected ? cat.cor : palette.textPrimary,
                            fontWeight: isSelected ? 600 : 400,
                          }}
                        >
                          {cat.nome}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {catError && (
                  <p className="text-xs" style={{ color: "#ff6b6b" }}>
                    Escolha uma categoria
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-2">
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
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl font-semibold disabled:opacity-50"
                  style={{ backgroundColor: accentColor, color: "#0a0a0a" }}
                >
                  {saving ? "Salvando…" : "Salvar"}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
