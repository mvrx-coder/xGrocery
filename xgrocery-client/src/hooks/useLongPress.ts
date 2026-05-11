import { useCallback, useRef } from "react";

type LongPressOptions = {
  onLongPress: () => void;
  onClick?: () => void;
  threshold?: number;
  enabled?: boolean;
};

export function useLongPress({
  onLongPress,
  onClick,
  threshold = 500,
  enabled = true,
}: LongPressOptions) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPress = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });

  const start = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      isLongPress.current = false;

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
    if (!timerRef.current) return;

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    const deltaX = Math.abs(clientX - startPos.current.x);
    const deltaY = Math.abs(clientY - startPos.current.y);

    if (deltaX > 10 || deltaY > 10) {
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

      if (!isLongPress.current && onClick) {
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
  }, []);

  return {
    onMouseDown: start,
    onMouseUp: end,
    onMouseLeave: cancel,
    onMouseMove: move,
    onTouchStart: start,
    onTouchEnd: end,
    onTouchMove: move,
  };
}
