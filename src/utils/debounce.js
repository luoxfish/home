export default function debounce(func, wait = 300) {
  let timeout;
  const debounced = (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      timeout = undefined;
      func(...args);
    }, wait);
  };
  debounced.cancel = () => {
    clearTimeout(timeout);
    timeout = undefined;
  };
  return debounced;
}
