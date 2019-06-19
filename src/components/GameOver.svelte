<script>
  import { createEventDispatcher } from 'svelte';
  export let hasWon = false;

  const dispatch = createEventDispatcher();

  function handleClick() {
    dispatch('restart');
  }
</script>

<style>
  .over {
    align-items: center;
    background-color: grey;
    display: flex;
    flex-direction: column;
    font-size: 2em;
    height: 100%;
    justify-content: center;
    opacity: 0.9;
    position: absolute;
    width: 100%;
  }

  .restart {
    cursor: pointer;
  }
</style>

<div class="over">
  <div>{hasWon ? '😅👍🎉' : '😱💥💀'}</div>
  <div class="restart" on:click={handleClick}>🔄</div>
</div>
