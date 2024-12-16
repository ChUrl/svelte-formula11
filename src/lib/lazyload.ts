// https://www.alexschnabl.com/blog/articles/lazy-loading-images-and-components-in-svelte-and-sveltekit-using-typescript

let observer: IntersectionObserver;

const getObserver = () => {
  if (observer) return;

  observer = new IntersectionObserver((entries: IntersectionObserverEntry[]) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.dispatchEvent(new CustomEvent("LazyVisible"));
      }
    });
  });
};

/**
 * Use this as an action on elements that should be only loaded when moved into view.
 * Note that if the element's size is 0 on mount, multiple elements could be in-view that
 * would be out-of-view with their correct size.
 * This happens for <div> elements without content for example.
 */
export const lazyload = (node: HTMLElement) => {
  // The observer determines if the element is visible on screen
  getObserver();

  // If the element is visible, the "LazyVisible" event will be dispatched
  observer.observe(node);

  return {
    destroy() {
      observer.unobserve(node);
    },
  };
};
