<script>
  import { onDestroy } from 'svelte';

  export let value = 0;
  export let maxDigits = 1;
  export let color = '#e93f33';
</script>

<style>
  .number {
    font-family: 'Digital', monospace;
    font-size: 2em;
    position: relative;
  }

  .placeholder {
    opacity: 0.2;
  }

  .value {
    position: absolute;
    top: 0;
  }
</style>

<div class="number">
  <div style="color: {color};" class="placeholder">
     {''.padStart(maxDigits, '8')}
  </div>
  <div style="color: {color};" class="value">
     {value.toString().padStart(maxDigits, '0')}
  </div>
</div>
