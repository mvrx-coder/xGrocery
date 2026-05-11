import { useCallback, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { ArrowDownAZ } from "lucide-react";
import { api } from "../api";
import { removeAccents } from "../constants";
import type { ApproachKey, Category, Item, PaletteKey, User } from "../types";
import { palettes } from "../data/palettes";
import { useShoppingData } from "../hooks/useShoppingData";
import { SearchBar } from "./SearchBar";
import { ItemCard } from "./ItemCard";
import { ContextMenu } from "./ContextMenu";
import { SettingsPanel } from "./SettingsPanel";
import { ComparisonView } from "./ComparisonView";
import { CategoryDrawer, type CategoryFormData } from "./CategoryDrawer";
import { ItemDrawer, type ItemFormData } from "./ItemDrawer";
import { QuantityDrawer } from "./QuantityDrawer";

// Accent fixo da marca xGrocery — verde da paleta Nocturne (food).
// Mantém botões/foco com identidade consistente independente da ordem das
// categorias no banco.
const ACCENT = "#39ff14";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

type ItemDrawerMode =
  | { kind: "create"; prefillName?: string }
  | { kind: "edit"; item: Item }
  | null;

type Props = {
  user: User;
  onLogout: () => void;
};

export function ShoppingList({ user, onLogout }: Props) {
  const {
    items,
    categories,
    settings,
    loading,
    error,
    setItems,
    setCategories,
    setSettings,
    pausePolling,
    resumePolling,
  } = useShoppingData(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<number | null>(null);
  const [contextMenuItem, setContextMenuItem] = useState<Item | null>(null);
  const [comparisonMode, setComparisonMode] = useState<
    "palettes" | "approaches" | null
  >(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [categoryDrawerOpen, setCategoryDrawerOpen] = useState(false);
  const [itemDrawer, setItemDrawer] = useState<ItemDrawerMode>(null);
  const [quantityItem, setQuantityItem] = useState<Item | null>(null);
  const [alphaMode, setAlphaMode] = useState(false);

  const currentPalette: PaletteKey = settings?.paleta ?? "nocturne";
  const currentApproach: ApproachKey =
    settings?.estilo_diferenciacao ?? "elevated";
  const palette = palettes[currentPalette];

  const accentColor = ACCENT;

  const categoryById = useMemo(() => {
    const map: Record<number, Category> = {};
    for (const cat of categories) map[cat.id] = cat;
    return map;
  }, [categories]);

  const filteredItems = useMemo(() => {
    let result = items;

    if (categoryFilter != null) {
      result = result.filter((it) => it.categoria_id === categoryFilter);
    }

    if (searchQuery.trim()) {
      const q = removeAccents(searchQuery.toLowerCase());
      result = result.filter((it) =>
        removeAccents(it.nome.toLowerCase()).includes(q),
      );
    }

    return result;
  }, [items, searchQuery, categoryFilter]);

  // Zona ativa: agrupa por categoria (ordem_exibicao); dentro de cada grupo, alfabético.
  const activeItemsOrdered = useMemo(() => {
    const active = filteredItems.filter((it) => it.ativo);
    const byCat: Record<number, Item[]> = {};
    for (const it of active) {
      (byCat[it.categoria_id] ||= []).push(it);
    }
    const ordered: Item[] = [];
    for (const cat of categories) {
      const group = byCat[cat.id];
      if (!group) continue;
      group.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
      ordered.push(...group);
    }
    return ordered;
  }, [filteredItems, categories]);

  const inactiveItems = useMemo(() => {
    return filteredItems
      .filter((it) => !it.ativo)
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  }, [filteredItems]);

  // Agrupa inativos pela primeira letra (sem acentos) quando o modo
  // alfabético está ligado. Letras sem itens não viram grupo; ficam apenas
  // desabilitadas na sidebar.
  const inactiveByLetter = useMemo(() => {
    if (!alphaMode) return null;
    const groups: Record<string, Item[]> = {};
    for (const item of inactiveItems) {
      const first = removeAccents(item.nome).charAt(0).toUpperCase();
      const letter = /[A-Z]/.test(first) ? first : "#";
      (groups[letter] ||= []).push(item);
    }
    return groups;
  }, [alphaMode, inactiveItems]);

  const availableLetters = useMemo(() => {
    if (!inactiveByLetter) return new Set<string>();
    return new Set(Object.keys(inactiveByLetter));
  }, [inactiveByLetter]);

  const orderedLetterGroups = useMemo(() => {
    if (!inactiveByLetter) return [];
    return Object.keys(inactiveByLetter).sort();
  }, [inactiveByLetter]);

  const scrollToLetter = useCallback(
    (letter: string) => {
      if (!availableLetters.has(letter)) return;
      const el = document.getElementById(`alpha-${letter}`);
      if (!el) return;
      // Calcula offset manualmente em vez de scrollIntoView smooth: este
      // ultimo ficou inconsistente em iOS Safari (so disparava no primeiro
      // tap, ignorava os seguintes). window.scrollTo + getBoundingClientRect
      // funciona de forma confiavel toda vez.
      const HEADER_OFFSET = 80; // compensa SearchBar sticky
      const targetTop =
        el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
      window.scrollTo({ top: targetTop, behavior: "smooth" });
    },
    [availableLetters],
  );

  const activeCount = filteredItems.filter((it) => it.ativo).length;

  const handleToggle = useCallback(
    async (item: Item) => {
      const optimistic: Item = {
        ...item,
        ativo: !item.ativo,
        quantidade: !item.ativo ? item.quantidade : null,
      };
      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? optimistic : it)),
      );
      try {
        const saved = await api.items.patch(item.id, {
          ativo: optimistic.ativo,
        });
        setItems((prev) => prev.map((it) => (it.id === item.id ? saved : it)));
      } catch {
        setItems((prev) => prev.map((it) => (it.id === item.id ? item : it)));
      }
    },
    [setItems],
  );

  const handleContextMenu = useCallback((item: Item) => {
    setContextMenuItem(item);
  }, []);

  const handleLongPressActive = useCallback(
    (item: Item) => {
      pausePolling("quantity-drawer");
      setQuantityItem(item);
    },
    [pausePolling],
  );

  const handleQuantitySave = useCallback(
    async (qty: number | null) => {
      if (!quantityItem) return;
      const target = quantityItem;
      setQuantityItem(null);
      try {
        const saved = await api.items.patch(target.id, { quantidade: qty });
        setItems((prev) =>
          prev.map((it) => (it.id === target.id ? saved : it)),
        );
      } finally {
        resumePolling("quantity-drawer");
      }
    },
    [quantityItem, resumePolling, setItems],
  );

  const handleQuantityClose = useCallback(() => {
    setQuantityItem(null);
    resumePolling("quantity-drawer");
  }, [resumePolling]);

  const handleEdit = useCallback((item: Item) => {
    setItemDrawer({ kind: "edit", item });
  }, []);

  const handleDelete = useCallback(
    async (item: Item) => {
      setItems((prev) => prev.filter((it) => it.id !== item.id));
      try {
        await api.items.delete(item.id);
      } catch {
        setItems((prev) => [...prev, item]);
      }
    },
    [setItems],
  );

  const handleAddItem = useCallback(() => {
    setItemDrawer({
      kind: "create",
      prefillName: searchQuery.trim() || undefined,
    });
  }, [searchQuery]);

  const handleAddCategory = useCallback(() => {
    setCategoryDrawerOpen(true);
  }, []);

  const handleSaveCategory = useCallback(
    async (data: CategoryFormData) => {
      const created = await api.categories.create({
        nome: data.nome,
        cor: data.cor,
        ordem_exibicao: categories.length + 1,
      });
      setCategories((prev) => [...prev, created]);
    },
    [categories.length, setCategories],
  );

  const handleSaveItem = useCallback(
    async (data: ItemFormData, mode: NonNullable<ItemDrawerMode>) => {
      if (mode.kind === "create") {
        const created = await api.items.create({
          nome: data.nome,
          categoria_id: data.categoria_id,
          ativo: true,
          quantidade: null,
        });
        setItems((prev) => [...prev, created]);
        setSearchQuery("");
      } else {
        const saved = await api.items.patch(mode.item.id, {
          nome: data.nome,
          categoria_id: data.categoria_id,
        });
        setItems((prev) =>
          prev.map((it) => (it.id === mode.item.id ? saved : it)),
        );
      }
    },
    [setItems],
  );

  const handlePaletteChange = useCallback(
    async (next: PaletteKey) => {
      const saved = await api.settings.patch({ paleta: next });
      setSettings(saved);
    },
    [setSettings],
  );

  const handleApproachChange = useCallback(
    async (next: ApproachKey) => {
      const saved = await api.settings.patch({ estilo_diferenciacao: next });
      setSettings(saved);
    },
    [setSettings],
  );

  if (loading) {
    return (
      <div
        className="min-h-dvh flex items-center justify-center"
        style={{
          backgroundColor: palette.background,
          color: palette.textSecondary,
        }}
      >
        Carregando…
      </div>
    );
  }

  return (
    <div
      className="min-h-dvh pb-12"
      style={{ backgroundColor: palette.background }}
    >
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        onAddItem={handleAddItem}
        onAddCategory={handleAddCategory}
        onOpenSettings={() => setSettingsOpen(true)}
        categoryFilter={categoryFilter}
        onCategoryFilter={setCategoryFilter}
        categories={categories}
        palette={palette}
        accentColor={accentColor}
      />

      <div
        className={`max-w-2xl mx-auto pl-4 transition-[padding] ${alphaMode ? "pr-14" : "pr-4"}`}
      >
        <div
          className="py-2 flex items-center justify-between gap-2"
          style={{ backgroundColor: palette.background }}
        >
          <span
            className="text-sm truncate"
            style={{ color: palette.textSecondary }}
          >
            {activeCount} de {filteredItems.length} itens ativos
          </span>
          <div className="flex items-center gap-2 flex-shrink-0">
            {error && (
              <span className="text-xs" style={{ color: "#ff6b6b" }}>
                {error}
              </span>
            )}
            <button
              type="button"
              onClick={() => setAlphaMode((v) => !v)}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{
                backgroundColor: alphaMode ? `${ACCENT}25` : "transparent",
                color: alphaMode ? ACCENT : palette.textSecondary,
              }}
              aria-label="Alternar ordem alfabética com índice lateral"
              aria-pressed={alphaMode}
            >
              <ArrowDownAZ size={18} />
            </button>
          </div>
        </div>

        {activeItemsOrdered.length > 0 && (
          <section className="mb-2">
            <AnimatePresence mode="popLayout">
              {activeItemsOrdered.map((item) => {
                const category = categoryById[item.categoria_id];
                if (!category) return null;
                return (
                  <ItemCard
                    key={item.id}
                    item={item}
                    category={category}
                    palette={palette}
                    approach={currentApproach}
                    onToggle={handleToggle}
                    onContextMenu={handleContextMenu}
                    onLongPressActive={handleLongPressActive}
                  />
                );
              })}
            </AnimatePresence>
          </section>
        )}

        {inactiveItems.length > 0 && activeItemsOrdered.length > 0 && (
          <div
            className="my-4 h-px"
            style={{ backgroundColor: palette.surfaceAlt }}
          />
        )}

        {inactiveItems.length > 0 && (
          <section>
            <div className="py-2 flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: palette.textSecondary }}
              />
              <span
                className="text-sm font-semibold uppercase tracking-wider"
                style={{ color: palette.textSecondary }}
              >
                Itens Inativos
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: palette.surfaceAlt,
                  color: palette.textSecondary,
                }}
              >
                {inactiveItems.length}
              </span>
            </div>

            {alphaMode && inactiveByLetter ? (
              orderedLetterGroups.map((letter) => (
                <div key={letter}>
                  <div id={`alpha-${letter}`} className="py-1 scroll-mt-20">
                    <span
                      className="text-xs font-bold uppercase tracking-wider"
                      style={{ color: ACCENT }}
                    >
                      {letter}
                    </span>
                  </div>
                  {inactiveByLetter[letter].map((item) => {
                    const category = categoryById[item.categoria_id];
                    if (!category) return null;
                    return (
                      <ItemCard
                        key={item.id}
                        item={item}
                        category={category}
                        palette={palette}
                        approach={currentApproach}
                        onToggle={handleToggle}
                        onContextMenu={handleContextMenu}
                        onLongPressActive={handleLongPressActive}
                      />
                    );
                  })}
                </div>
              ))
            ) : (
              <AnimatePresence mode="popLayout">
                {inactiveItems.map((item) => {
                  const category = categoryById[item.categoria_id];
                  if (!category) return null;
                  return (
                    <ItemCard
                      key={item.id}
                      item={item}
                      category={category}
                      palette={palette}
                      approach={currentApproach}
                      onToggle={handleToggle}
                      onContextMenu={handleContextMenu}
                      onLongPressActive={handleLongPressActive}
                    />
                  );
                })}
              </AnimatePresence>
            )}
          </section>
        )}

        {filteredItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div
              className="text-6xl mb-4 opacity-20"
              style={{ color: palette.textPrimary }}
            >
              ?
            </div>
            <p className="text-base" style={{ color: palette.textSecondary }}>
              Nenhum item encontrado
            </p>
          </div>
        )}

        <SettingsPanel
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          currentPalette={currentPalette}
          currentApproach={currentApproach}
          onPaletteChange={handlePaletteChange}
          onApproachChange={handleApproachChange}
          onCompare={setComparisonMode}
          onLogout={onLogout}
          palette={palette}
          accentColor={accentColor}
        />

        <AnimatePresence>
          {comparisonMode && (
            <ComparisonView
              mode={comparisonMode}
              onClose={() => setComparisonMode(null)}
              currentPalette={currentPalette}
              currentApproach={currentApproach}
              sampleColor={accentColor}
            />
          )}
        </AnimatePresence>

        <ContextMenu
          item={contextMenuItem}
          onClose={() => setContextMenuItem(null)}
          onEdit={handleEdit}
          onDelete={handleDelete}
          palette={palette}
          accentColor={accentColor}
        />

        <CategoryDrawer
          open={categoryDrawerOpen}
          onClose={() => setCategoryDrawerOpen(false)}
          onSave={handleSaveCategory}
          palette={palette}
        />

        <ItemDrawer
          open={itemDrawer != null}
          mode={itemDrawer}
          categories={categories}
          palette={palette}
          accentColor={accentColor}
          onClose={() => setItemDrawer(null)}
          onSave={handleSaveItem}
        />

        <QuantityDrawer
          item={quantityItem}
          userName={user.name}
          accentColor={accentColor}
          palette={palette}
          onClose={handleQuantityClose}
          onSave={handleQuantitySave}
        />
      </div>

      {/* Sidebar alfabética — fixed à borda direita da viewport, só aparece
          quando alphaMode está ligado e há itens inativos. Letras sem itens
          ficam visíveis mas com opacidade reduzida e não respondem ao tap. */}
      {alphaMode && inactiveItems.length > 0 && (
        <nav
          aria-label="Índice alfabético"
          className="fixed right-1 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center select-none py-1.5 px-1 rounded-xl border"
          style={{
            backgroundColor: `${palette.background}f0`,
            borderColor: `${palette.surfaceAlt}80`,
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            // touch-action manipulation garante que cada tap dispare onClick
            // mesmo apos uma scroll animation anterior (sem isso, em iOS o
            // segundo tap as vezes era absorvido pelo gesto inacabado).
            touchAction: "manipulation",
          }}
        >
          {ALPHABET.map((letter) => {
            const has = availableLetters.has(letter);
            return (
              <button
                key={letter}
                type="button"
                onClick={() => scrollToLetter(letter)}
                disabled={!has}
                className="w-10 h-7 flex items-center justify-center text-[13px] font-bold leading-none"
                style={{
                  color: has ? ACCENT : palette.textSecondary,
                  opacity: has ? 1 : 0.3,
                  touchAction: "manipulation",
                }}
                aria-label={`Ir para letra ${letter}`}
              >
                {letter}
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}
