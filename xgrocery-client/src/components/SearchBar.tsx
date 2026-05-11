import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Plus,
  Search,
  Settings as SettingsIcon,
  SlidersHorizontal,
} from "lucide-react";
import type { Category } from "../types";
import type { Palette } from "../data/palettes";
import { useLongPress } from "../hooks/useLongPress";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onAddItem: () => void;
  onAddCategory: () => void;
  onOpenSettings: () => void;
  categoryFilter: number | null;
  onCategoryFilter: (categoryId: number | null) => void;
  categories: Category[];
  palette: Palette;
  accentColor: string;
};

export function SearchBar({
  value,
  onChange,
  onAddItem,
  onAddCategory,
  onOpenSettings,
  categoryFilter,
  onCategoryFilter,
  categories,
  palette,
  accentColor,
}: SearchBarProps) {
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);

  const handleCategoryClick = (categoryId: number) => {
    if (categoryFilter === categoryId) {
      onCategoryFilter(null);
    } else {
      onCategoryFilter(categoryId);
    }
    setShowCategoryFilter(false);
  };

  const addButtonHandlers = useLongPress({
    onLongPress: onAddCategory,
    onClick: onAddItem,
    threshold: 500,
  });

  const selectedCategoryColor = categoryFilter
    ? categories.find((c) => c.id === categoryFilter)?.cor || accentColor
    : accentColor;

  return (
    <div
      className="sticky top-0 z-20"
      style={{ backgroundColor: palette.background }}
    >
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-2 relative">
        <div
          className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl"
          style={{ backgroundColor: palette.surface }}
        >
          <Search size={20} style={{ color: palette.textSecondary }} />
          <input
            type="text"
            placeholder="Buscar item..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 bg-transparent outline-none text-base placeholder:opacity-50 min-w-0"
            style={{ color: palette.textPrimary }}
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-lg leading-none px-1"
              style={{ color: palette.textSecondary }}
              aria-label="Limpar busca"
            >
              ×
            </button>
          )}
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: accentColor }}
          {...addButtonHandlers}
        >
          <Plus size={24} color={palette.background} strokeWidth={2.5} />
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCategoryFilter(!showCategoryFilter)}
          className="w-12 h-12 rounded-xl flex items-center justify-center relative flex-shrink-0"
          style={{
            backgroundColor:
              categoryFilter || showCategoryFilter
                ? accentColor
                : palette.surface,
          }}
        >
          <SlidersHorizontal
            size={20}
            style={{
              color:
                categoryFilter || showCategoryFilter
                  ? palette.background
                  : palette.textSecondary,
            }}
          />
          {categoryFilter && (
            <div
              className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2"
              style={{
                backgroundColor: selectedCategoryColor,
                borderColor: palette.background,
              }}
            />
          )}
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onOpenSettings}
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: palette.surface }}
          aria-label="Configurações"
        >
          <SettingsIcon size={20} style={{ color: palette.textSecondary }} />
        </motion.button>

        <AnimatePresence>
          {showCategoryFilter && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="absolute left-0 right-0 top-full px-4 py-3 flex flex-wrap items-start justify-center gap-x-4 gap-y-3"
              style={{ backgroundColor: palette.background }}
            >
              <motion.button
                animate={{ opacity: categoryFilter ? 1 : 0.35 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  onCategoryFilter(null);
                  setShowCategoryFilter(false);
                }}
                className="flex flex-col items-center gap-1"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-dashed"
                  style={{
                    borderColor: categoryFilter
                      ? palette.textPrimary
                      : palette.textSecondary,
                    boxShadow: !categoryFilter
                      ? `0 0 0 3px ${palette.background}, 0 0 0 5px ${palette.textSecondary}`
                      : "none",
                  }}
                >
                  <span
                    style={{
                      color: categoryFilter
                        ? palette.textPrimary
                        : palette.textSecondary,
                    }}
                    className="text-sm leading-none"
                  >
                    ×
                  </span>
                </div>
                <span
                  className="text-[10px] font-medium"
                  style={{ color: palette.textSecondary }}
                >
                  Todas
                </span>
              </motion.button>

              {categories.map((cat) => (
                <motion.button
                  key={cat.id}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleCategoryClick(cat.id)}
                  className="relative flex flex-col items-center gap-1"
                >
                  <div
                    className="w-8 h-8 rounded-full transition-all"
                    style={{
                      backgroundColor: cat.cor,
                      boxShadow:
                        categoryFilter === cat.id
                          ? `0 0 0 3px ${palette.background}, 0 0 0 5px ${cat.cor}`
                          : "none",
                    }}
                  />
                  <span
                    className="text-[10px] font-medium"
                    style={{ color: palette.textSecondary }}
                  >
                    {cat.nome}
                  </span>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
