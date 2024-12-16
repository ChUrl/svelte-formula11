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

// This is used as an action on lazyloaded elements
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
