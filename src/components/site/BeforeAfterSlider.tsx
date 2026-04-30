import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  before: string;
  after: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
};

export const BeforeAfterSlider = ({
  before,
  after,
  beforeLabel = "Avant",
  afterLabel = "Après",
  className = "",
}: Props) => {
  const [pos, setPos] = useState(50);
  const wrapRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updateFromClient = useCallback((clientX: number) => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const next = ((clientX - r.left) / r.width) * 100;
    setPos(Math.max(0, Math.min(100, next)));
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => { if (dragging.current) updateFromClient(e.clientX); };
    const onUp = () => { dragging.current = false; };
    const onTouch = (e: TouchEvent) => { if (dragging.current && e.touches[0]) updateFromClient(e.touches[0].clientX); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("touchend", onUp);
    };
  }, [updateFromClient]);

  return (
    <div
      ref={wrapRef}
      className={`relative w-full overflow-hidden select-none cursor-ew-resize ${className}`}
      onMouseDown={(e) => { dragging.current = true; updateFromClient(e.clientX); }}
      onTouchStart={(e) => { dragging.current = true; if (e.touches[0]) updateFromClient(e.touches[0].clientX); }}
    >
      <img src={after} alt="" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
      <div
        className="absolute inset-y-0 left-0 overflow-hidden"
        style={{ width: `${pos}%` }}
      >
        <img
          src={before}
          alt=""
          className="absolute inset-0 h-full object-cover"
          style={{ width: wrapRef.current?.offsetWidth ?? "100%", maxWidth: "none" }}
          draggable={false}
        />
      </div>

      {/* Labels */}
      <span className="absolute top-5 left-5 text-[10px] uppercase tracking-[0.3em] bg-background/90 px-3 py-2 text-foreground">
        {beforeLabel}
      </span>
      <span className="absolute top-5 right-5 text-[10px] uppercase tracking-[0.3em] bg-foreground text-background px-3 py-2">
        {afterLabel}
      </span>

      {/* Divider line + handle */}
      <div
        className="absolute top-0 bottom-0 pointer-events-none"
        style={{ left: `${pos}%`, transform: "translateX(-0.5px)" }}
      >
        <div className="w-px h-full bg-background/85" />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full border border-background/90 bg-background/15 backdrop-blur-sm flex items-center justify-center"
          aria-hidden
        >
          <span className="block w-3 h-px bg-background" />
          <span className="block w-3 h-px bg-background -ml-3" />
        </div>
      </div>
    </div>
  );
};