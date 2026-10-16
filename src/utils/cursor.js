export default function cursorInit() {
  const cursor = document.createElement("div");
  cursor.id = "cursor";
  cursor.className = "hidden";
  cursor.setAttribute("aria-hidden", "true");
  document.body.append(cursor);
  const controller = new AbortController();
  const options = { signal: controller.signal, passive: true };
  document.addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerType === "touch") return;
      cursor.style.translate = `${event.clientX - 9}px ${event.clientY - 9}px`;
      cursor.classList.remove("hidden");
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
      cursor.remove();
    },
  };
}
