<!-- https://www.sveltelab.dev/dc0nf9id4ust2vw -->

<script lang="ts">
  import { navigating } from "$app/stores";

  let loading: string = $state("no");
  let percentage: number = $state(0);

  $effect(() => {
    if ($navigating) {
      loading = "yes";
    } else {
      loading = "closing";
      setTimeout(() => {
        loading = "no";
      }, 300);
    }
  });

  $effect(() => {
    if (loading === "closing") {
      percentage = 1;
    }
  });

  const load = (_node: HTMLElement) => {
    let timeout: NodeJS.Timeout;
    const handle = () => {
      if (percentage < 0.7) {
        percentage += Math.random() * 0.3;

        // Let's call ourselves recursively to fill the loading bar
        timeout = setTimeout(handle, Math.random() * 1000);
      }
    };

    handle();

    return {
      destroy() {
        clearTimeout(timeout);
        percentage = 0;
      },
    };
  };
</script>

{#if loading !== "no"}
  <div
    class="fixed inset-0 bottom-auto z-50 h-1 bg-error-500"
    use:load
    style:--percentage={percentage}
  ></div>
{/if}

<style>
  div {
    transform-origin: left;
    transform: scaleX(calc(var(--percentage) * 100%));
    transition: transform 250ms;
  }
</style>
