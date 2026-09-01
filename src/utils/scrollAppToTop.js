/** Scroll the app shell's main content area (not window — layouts use overflow on main). */
export function scrollAppToTop(behavior = 'smooth') {
  const main = document.querySelector('main.overflow-y-auto');
  if (main) {
    main.scrollTo({ top: 0, behavior });
    return;
  }
  window.scrollTo({ top: 0, behavior });
}
