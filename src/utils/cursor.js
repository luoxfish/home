export default function cursorInit() {
  const cursor = document.createElement("div");
  cursor.id = "cursor";
  cursor.className = "hidden";
  cursor.setAttribute("aria-hidden", "true");
  document.body.append(cursor);
  const controller = new AbortController();
  const options = { signal: controller.signal, passive: true };
  let frame = null;
  let current;
  let target;
  const move = () => {
    frame = null;
    if (!current || !target) return;
    current.x += (target.x - current.x) * 0.35;
    current.y += (target.y - current.y) * 0.35;
    cursor.style.transform =
      "translate3d(" + current.x + "px, " + current.y + "px, 0)";
    if (Math.abs(target.x - current.x) + Math.abs(target.y - current.y) > 0.1) {
      frame = requestAnimationFrame(move);
    }
  };
  document.addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerType === "touch") return;
      target = { x: event.clientX - 9, y: event.clientY - 9 };
      current ||= { ...target };
      cursor.classList.remove("hidden");
      if (frame === null) frame = requestAnimationFrame(move);
    },
    options,
  );
  document.addEventListener(
    "pointerleave",
    () => cursor.classList.add("hidden"),
    options,
  );
  document.addEventListener(
    "pointerdown",
    () => cursor.classList.add("active"),
    options,
  );
  document.addEventListener(
    "pointerup",
    () => cursor.classList.remove("active"),
    options,
  );
  return {
    destroy() {
      controller.abort();
      if (frame !== null) cancelAnimationFrame(frame);
      cursor.remove();
    },
  };
}
