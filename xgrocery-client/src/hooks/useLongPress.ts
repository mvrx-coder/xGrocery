import { useCallback, useRef } from "react";

type LongPressOptions = {
  onLongPress: () => void;
  onClick?: () => void;
  threshold?: number;
  enabled?: boolean;
};

// Distância em pixels que distingue "tap" de "scroll/drag".
// Acima desse delta, a interação é tratada como gesto de rolagem e o click
// não dispara, mesmo que o touchend ocorra em cima do card.
const MOVE_THRESHOLD_PX = 10;

export function useLongPress({
  onLongPress,
  onClick,
  threshold = 500,
  enabled = true,
}: LongPressOptions) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPress = useRef(false);
  const moved = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });

  const start = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      isLongPress.current = false;
      moved.current = false;

      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      startPos.current = { x: clientX, y: clientY };

      timerRef.current = setTimeout(() => {
        isLongPress.current = true;
        if (enabled) onLongPress();
      }, threshold);
    },
    [onLongPress, threshold, enabled],
  );

  const move = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (moved.current) return;

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    const deltaX = Math.abs(clientX - startPos.current.x);
    const deltaY = Math.abs(clientY - startPos.current.y);

    if (deltaX > MOVE_THRESHOLD_PX || deltaY > MOVE_THRESHOLD_PX) {
      moved.current = true;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }
  }, []);

  const end = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      // Só dispara click se NÃO foi long press E o usuário NÃO arrastou.
      // Sem checar `moved`, qualquer toque para rolar a lista vira toggle.
      if (!isLongPress.current && !moved.current && onClick) {
        onClick();
      }

      if ("touches" in e) {
        e.preventDefault();
      }
    },
    [onClick],
  );

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    // touchcancel é disparado pelo iOS quando o navegador "rouba" o gesto
    // para fazer scroll. Marcar moved=true garante que o end subsequente
    // (se vier) não dispare click. Também cobre mouseleave em desktop.
    moved.current = true;
  }, []);

  return {
    onMouseDown: start,
    onMouseUp: end,
    onMouseLeave: cancel,
    onMouseMove: move,
    onTouchStart: start,
    onTouchEnd: end,
    onTouchMove: move,
    onTouchCancel: cancel,
  };
}
