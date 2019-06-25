<script>
  import difficultyLevels from '../difficultyLevels';
  import Number from './Number.svelte';
  import { createEventDispatcher, onDestroy } from 'svelte';

  export let remainingFlags = 0;
  export let selectedDifficulty;
  export let isGameStarted;
  export let time = 0;

  const dispatch = createEventDispatcher();

  const handleChange = () => {
    dispatch('changeDifficulty');
  };

  let interval;

  $: if (isGameStarted) {
    if (!interval) {
      interval = setInterval(() => {
        time += 1;
      }, 1000);
    }
  } else {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
  }

  onDestroy(() => interval && clearInterval(interval));
</script>

<style>
  .menu {
    display: flex;
    justify-content: space-between;
  }

  .remainingFlags {
    align-items: center;
    display: flex;
  }

  .flagIcon {
    font-size: 1.5em;
    margin-right: 5px;
  }
</style>

<div class="menu">
  <select bind:value={selectedDifficulty} on:change={handleChange}>
    {#each difficultyLevels as difficultyLevel}
      <option value={difficultyLevel}>{difficultyLevel.name}</option>
    {/each}
  </select>
  <Number maxDigits={3} value={time} />
  <div class="remainingFlags">
    <div class="flagIcon">⛳</div>
    <Number maxDigits={2} value={remainingFlags} color="green" />
  </div>
</div>
