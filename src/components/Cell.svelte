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

  .cell.value--1 {
    color: #1600ff;
  }

  .cell.value--2 {
    color: #008000;
  }

  .cell.value--3 {
    color: #ff0000;
  }

  .cell.value--4 {
    color: #060080;
  }

  .cell.value--5 {
    color: #800000;
  }

  .cell.value--6 {
    color: #008080;
  }

  .cell.value--7 {
    color: #000;
  }

  .cell.value--8 {
    color: #808080;
  }

  .cell.hasBomb {
    background-color: tomato;
  }

  .cell.isOpen {
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
