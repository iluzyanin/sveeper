<script>
  export let value = 0;
  export let hasFlag = false;
  export let hasBomb = false;
  export let isOpen = false;
</script>

<style>
  .cell {
    background-color: gainsboro;
    border: 3px outset;
    cursor: pointer;
    font-size: 1.5em;
    font-weight: bold;
    height: 30px;
    line-height: 30px;
    text-align: center;
    width: 30px;
  }

  .value--1 {
    color: #1600ff;
  }

  .value--2 {
    color: #008000;
  }

  .value--3 {
    color: #f00;
  }

  .value--4 {
    color: #060080;
  }

  .value--5 {
    color: #800000;
  }

  .value--6 {
    color: #008080;
  }

  .value--7 {
    color: #000;
  }

  .value--8 {
    color: #808080;
  }

  .hasBomb {
    background-color: tomato;
  }

  .isOpen {
    border-style: inset;
  }
</style>

<div
  class="cell value--{value}"
  class:isOpen
  on:click
  on:contextmenu|preventDefault>
   {isOpen ? (hasBomb ? '💣' : value > 0 ? value : '') : hasFlag ? '⛳' : ''}
</div>
