import { nextTick, onBeforeUnmount, watch } from "vue";

export function useDialog(isOpen, close, selector) {
  let previousFocus;
  const handleKeydown = (event) => {
    if (!isOpen()) return;
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    } else if (event.key === "Tab") {
      const elements = [
        ...(document
          .querySelector(selector)
          ?.querySelectorAll(
            'a[href], button:not([disabled]), input, [tabindex="0"]',
          ) || []),
      ].filter((element) => element.getClientRects().length);
      const first = elements[0];
      const last = elements.at(-1);
      if (!first) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  };
  document.addEventListener("keydown", handleKeydown);
  watch(
    isOpen,
    async (open) => {
      if (open) {
        previousFocus = document.activeElement;
        await nextTick();
        document
          .querySelector(selector)
          ?.querySelector('button, [tabindex="0"]')
          ?.focus();
      } else {
        await nextTick();
        if (previousFocus?.isConnected) previousFocus.focus();
      }
    },
    { flush: "sync", immediate: true },
  );
  onBeforeUnmount(() => document.removeEventListener("keydown", handleKeydown));
}
