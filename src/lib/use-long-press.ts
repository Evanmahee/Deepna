import { useCallback, useRef } from "react";

type LongPressOptions = {
  onLongPress: () => void;
  delay?: number;
  moveThreshold?: number;
};

export function useLongPress({
  onLongPress,
  delay = 450,
  moveThreshold = 12,
}: LongPressOptions) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const firedRef = useRef(false);

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if ((e.target as HTMLElement).closest("[data-no-long-press]")) {
        return;
      }
      firedRef.current = false;
      startRef.current = {
        x: e.touches[0]?.clientX ?? 0,
        y: e.touches[0]?.clientY ?? 0,
      };
      clear();
      timerRef.current = setTimeout(() => {
        firedRef.current = true;
        navigator.vibrate?.(12);
        onLongPress();
      }, delay);
    },
    [clear, delay, onLongPress],
  );

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      const start = startRef.current;
      if (!start || !timerRef.current) {
        return;
      }
      const x = e.touches[0]?.clientX ?? 0;
      const y = e.touches[0]?.clientY ?? 0;
      if (
        Math.abs(x - start.x) > moveThreshold ||
        Math.abs(y - start.y) > moveThreshold
      ) {
        clear();
      }
    },
    [clear, moveThreshold],
  );

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (firedRef.current) {
        e.preventDefault();
      }
      clear();
      startRef.current = null;
    },
    [clear],
  );

  const onContextMenu = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest("[data-no-long-press]")) {
        return;
      }
      e.preventDefault();
      onLongPress();
    },
    [onLongPress],
  );

  return {
    longPressProps: {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
      onTouchCancel: onTouchEnd,
      onContextMenu,
    },
    didLongPress: () => firedRef.current,
    resetLongPress: () => {
      firedRef.current = false;
    },
  };
}
