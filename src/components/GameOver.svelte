<script>
  import { createEventDispatcher } from 'svelte';
  import { fade } from 'svelte/transition';

  export let hasWon = false;

  const dispatch = createEventDispatcher();

  const handleClick = () => {
    dispatch('restart');
  };
</script>

<style>
  .over {
    align-items: center;
    background-color: indianred;
    display: flex;
    flex-direction: column;
    font-size: 2em;
    height: calc(100% - 32px);
    justify-content: center;
    opacity: 0.9;
    position: absolute;
    top: 32px;
    width: 100%;
    z-index: 1;
  }

  .over.hasWon {
    background-color: lightgreen;
  }

  .restart {
    cursor: pointer;
  }
</style>

<div class="over" class:hasWon transition:fade={{ duration: 100 }}>
  <div>{hasWon ? '😅👍🎉' : '😱💥💀'}</div>
  <div class="restart" on:click={handleClick}>🔄</div>
</div>
