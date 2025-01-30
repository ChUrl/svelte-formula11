<script lang="ts">
  interface CountdownProps {
    date: string;
    extraclass?: string;
  }

  let { date, extraclass = "" }: CountdownProps = $props();

  // Set the date we're counting down to
  const countDownDate = new Date(date).getTime();

  let distance: number = $state(0);
  let days: number = $state(0);
  let hours: number = $state(0);
  let minutes: number = $state(0);
  let seconds: number = $state(0);

  // Update the countdown every 1 second
  setInterval(function () {
    // Get today's date and time
    const now = new Date().getTime();

    // Find the distance between now and the countdown date
    distance = countDownDate - now;

    // Time calculations for days, hours, minutes and seconds
    days = Math.floor(distance / (1000 * 60 * 60 * 24));
    hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    seconds = Math.floor((distance % (1000 * 60)) / 1000);
  }, 1000);
</script>

<span class={extraclass}>
  {#if distance > 0}
    {days + "d " + hours + "h " + minutes + "m " + seconds + "s"}
  {:else}
    GO GO GO GO
  {/if}
</span>
