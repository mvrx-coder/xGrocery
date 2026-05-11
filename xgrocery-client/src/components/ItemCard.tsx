import { motion } from "framer-motion";
import { Check, Circle, MoreVertical } from "lucide-react";
import type { ApproachKey, Category, Item } from "../types";
import type { Palette } from "../data/palettes";
import { useLongPress } from "../hooks/useLongPress";

type ItemCardProps = {
  item: Item;
  category: Category;
  palette: Palette;
  approach: ApproachKey;
  onToggle: (item: Item) => void;
  onContextMenu: (item: Item, position: { x: number; y: number }) => void;
  onLongPressActive: (item: Item) => void;
};

export function ItemCard({
  item,
  category,
  palette,
  approach,
  onToggle,
  onContextMenu,
  onLongPressActive,
}: ItemCardProps) {
  const categoryColor = category.cor;

  const longPressHandlers = useLongPress({
    onLongPress: () => {
      if (item.ativo) {
        onLongPressActive(item);
      }
    },
    onClick: () => onToggle(item),
    enabled: item.ativo,
  });

  const showBadge =
    item.ativo && item.quantidade != null && item.quantidade > 1;

  // Approach A: Elevated & Glow
  if (approach === "elevated") {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
        className="relative mb-1.5 rounded-xl px-4 py-2.5 cursor-pointer select-none"
        style={{
          backgroundColor: item.ativo
            ? `${categoryColor}15`
            : palette.surfaceAlt,
          boxShadow: item.ativo
            ? `0 4px 20px ${categoryColor}30, 0 2px 8px ${categoryColor}20`
            : "none",
        }}
        {...longPressHandlers}
      >
        <div className="flex items-center gap-3">
          <motion.div
            animate={{
              scale: item.ativo ? 1 : 0.7,
              opacity: item.ativo ? 1 : 0.3,
            }}
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{
              backgroundColor: item.ativo
                ? categoryColor
                : palette.textSecondary,
            }}
          />

          <div className="flex-1 min-w-0 flex items-center gap-2">
            {showBadge && (
              <span
                className="text-xs font-semibold px-1.5 py-0.5 rounded-md flex-shrink-0 tabular-nums"
                style={{
                  backgroundColor: `${categoryColor}30`,
                  color: categoryColor,
                }}
              >
                {item.quantidade}x
              </span>
            )}
            <span
              className="text-base font-medium truncate"
              style={{
                color: item.ativo ? palette.textPrimary : palette.textSecondary,
              }}
            >
              {item.nome}
            </span>
          </div>

          <button
            type="button"
            className="p-2 -mr-2 rounded-lg opacity-50 hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onContextMenu(item, { x: e.clientX, y: e.clientY });
            }}
          >
            <MoreVertical size={18} style={{ color: palette.textSecondary }} />
          </button>
        </div>
      </motion.div>
    );
  }

  // Approach B: Border & Accent
  if (approach === "border") {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
        className="relative mb-1.5 rounded-xl px-4 py-2.5 cursor-pointer select-none overflow-hidden"
        style={{
          backgroundColor: item.ativo ? palette.surface : palette.surfaceAlt,
        }}
        {...longPressHandlers}
      >
        <motion.div
          initial={{ scaleY: 0 }}
          animate={{ scaleY: item.ativo ? 1 : 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 200 }}
          className="absolute left-0 top-0 bottom-0 w-1 origin-top"
          style={{ backgroundColor: categoryColor }}
        />

        <div className="flex items-center gap-3">
          <motion.div
            animate={{ scale: item.ativo ? 1 : 0.9 }}
            className="flex-shrink-0"
          >
            {item.ativo ? (
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${categoryColor}30` }}
              >
                <Check size={14} style={{ color: categoryColor }} />
              </div>
            ) : (
              <Circle
                size={24}
                style={{ color: palette.textSecondary }}
                strokeWidth={1.5}
              />
            )}
          </motion.div>

          <div className="flex-1 min-w-0 flex items-center gap-2">
            {showBadge && (
              <span
                className="text-xs font-semibold px-1.5 py-0.5 rounded-md flex-shrink-0 tabular-nums"
                style={{
                  backgroundColor: `${categoryColor}30`,
                  color: categoryColor,
                }}
              >
                {item.quantidade}x
              </span>
            )}
            <span
              className="text-base truncate"
              style={{
                color: item.ativo ? palette.textPrimary : palette.textSecondary,
                fontWeight: item.ativo ? 600 : 400,
              }}
            >
              {item.nome}
            </span>
          </div>

          <button
            type="button"
            className="p-2 -mr-2 rounded-lg opacity-50 hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onContextMenu(item, { x: e.clientX, y: e.clientY });
            }}
          >
            <MoreVertical size={18} style={{ color: palette.textSecondary }} />
          </button>
        </div>
      </motion.div>
    );
  }

  // Approach C: Status Indicator
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", damping: 20, stiffness: 100 }}
      className="relative mb-1.5 rounded-xl px-4 py-2.5 cursor-pointer select-none"
      style={{
        backgroundColor: item.ativo ? `${categoryColor}10` : palette.surfaceAlt,
        boxShadow: item.ativo ? `inset 0 2px 8px ${categoryColor}15` : "none",
      }}
      {...longPressHandlers}
    >
      <div className="flex items-center gap-3">
        <div className="relative flex-shrink-0">
          <motion.div
            animate={{
              scale: item.ativo ? [1, 1.2, 1] : 1,
              opacity: item.ativo ? 1 : 0.4,
            }}
            transition={{
              scale: {
                repeat: item.ativo ? Infinity : 0,
                duration: 2,
                ease: "easeInOut",
              },
            }}
            className="rounded-full"
            style={{
              width: item.ativo ? 12 : 8,
              height: item.ativo ? 12 : 8,
              backgroundColor: item.ativo
                ? categoryColor
                : palette.textSecondary,
            }}
          />
          {item.ativo && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: [0.5, 0], scale: [1, 1.8] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
              className="absolute inset-0 rounded-full"
              style={{ backgroundColor: categoryColor }}
            />
          )}
        </div>

        <div className="flex-1 min-w-0 flex items-center gap-2">
          {showBadge && (
            <span
              className="text-xs font-semibold px-1.5 py-0.5 rounded-md flex-shrink-0 tabular-nums"
              style={{
                backgroundColor: `${categoryColor}30`,
                color: categoryColor,
              }}
            >
              {item.quantidade}x
            </span>
          )}
          <span
            className="text-base font-medium truncate"
            style={{
              color: item.ativo ? palette.textPrimary : palette.textSecondary,
            }}
          >
            {item.nome}
          </span>
        </div>

        <button
          type="button"
          className="p-2 -mr-2 rounded-lg opacity-50 hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onContextMenu(item, { x: e.clientX, y: e.clientY });
          }}
        >
          <MoreVertical size={18} style={{ color: palette.textSecondary }} />
        </button>
      </div>
    </motion.div>
  );
}
