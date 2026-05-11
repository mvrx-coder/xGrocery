import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Tag, X } from "lucide-react";
import type { Palette } from "../data/palettes";
import { PRESET_COLORS } from "../data/palettes";

export type CategoryFormData = {
  nome: string;
  cor: string;
};

type CategoryDrawerProps = {
  open: boolean;
  onClose: () => void;
  onSave: (data: CategoryFormData) => void | Promise<void>;
  palette: Palette;
};

export function CategoryDrawer({
  open,
  onClose,
  onSave,
  palette,
}: CategoryDrawerProps) {
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0].value);
  const [nameTouched, setNameTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  const nameError = nameTouched && name.trim().length === 0;

  async function handleSave() {
    setNameTouched(true);
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSave({ nome: name.trim(), cor: selectedColor });
      setName("");
      setSelectedColor(PRESET_COLORS[0].value);
      setNameTouched(false);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  function handleClose() {
    setName("");
    setSelectedColor(PRESET_COLORS[0].value);
    setNameTouched(false);
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-end justify-center"
          onClick={handleClose}
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
              className="flex items-center justify-between px-5 py-4 border-b"
              style={{ borderColor: palette.surfaceAlt }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-200"
                  style={{ backgroundColor: `${selectedColor}25` }}
                >
                  <Tag size={16} style={{ color: selectedColor }} />
                </div>
                <div>
                  <p
                    className="text-xs font-medium uppercase tracking-wider"
                    style={{ color: palette.textSecondary }}
                  >
                    Nova categoria
                  </p>
                  <p
                    className="text-base font-semibold leading-tight truncate max-w-[180px]"
                    style={{
                      color: name.trim()
                        ? palette.textPrimary
                        : palette.textSecondary,
                    }}
                  >
                    {name.trim() || "Sem nome"}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 -mr-1 rounded-xl"
                style={{ backgroundColor: palette.surfaceAlt }}
              >
                <X size={18} style={{ color: palette.textSecondary }} />
              </button>
            </div>

            <div className="px-5 py-5 space-y-6">
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
                  onBlur={() => setNameTouched(true)}
                  placeholder="Ex: Hortifruti, Padaria…"
                  maxLength={32}
                  className="w-full px-4 py-3 rounded-xl text-base outline-none transition-all"
                  style={{
                    backgroundColor: palette.surfaceAlt,
                    color: palette.textPrimary,
                    border: `1.5px solid ${nameError ? "#ff6b6b" : "transparent"}`,
                    caretColor: selectedColor,
                  }}
                />
                {nameError && (
                  <p className="text-xs" style={{ color: "#ff6b6b" }}>
                    Informe um nome para a categoria
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <label
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: palette.textSecondary }}
                >
                  Cor
                </label>
                <div className="grid grid-cols-6 gap-3">
                  {PRESET_COLORS.map((preset) => {
                    const isSelected = selectedColor === preset.value;
                    return (
                      <motion.button
                        key={preset.value}
                        whileTap={{ scale: 0.88 }}
                        onClick={() => setSelectedColor(preset.value)}
                        className="relative aspect-square rounded-xl flex items-center justify-center"
                        style={{
                          backgroundColor: `${preset.value}22`,
                          border: `2px solid ${isSelected ? preset.value : "transparent"}`,
                        }}
                        aria-label={preset.label}
                        title={preset.label}
                      >
                        <div
                          className="w-5 h-5 rounded-lg"
                          style={{ backgroundColor: preset.value }}
                        />
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{
                              type: "spring",
                              damping: 20,
                              stiffness: 300,
                            }}
                            className="absolute inset-0 flex items-center justify-center rounded-xl"
                            style={{ backgroundColor: `${preset.value}55` }}
                          >
                            <Check
                              size={14}
                              style={{ color: preset.value }}
                              strokeWidth={3}
                            />
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                <div
                  className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{ backgroundColor: `${selectedColor}15` }}
                >
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: selectedColor }}
                  />
                  <span
                    className="text-sm font-medium"
                    style={{ color: selectedColor }}
                  >
                    {PRESET_COLORS.find((p) => p.value === selectedColor)
                      ?.label ?? "Cor personalizada"}
                  </span>
                  <span
                    className="ml-auto text-xs font-mono tracking-wider"
                    style={{ color: `${selectedColor}99` }}
                  >
                    {selectedColor.toUpperCase()}
                  </span>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={saving}
                className="w-full py-3.5 rounded-xl text-base font-semibold transition-opacity disabled:opacity-50"
                style={{
                  backgroundColor: selectedColor,
                  color: "#0a0a0a",
                }}
              >
                {saving ? "Criando…" : "Criar categoria"}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
