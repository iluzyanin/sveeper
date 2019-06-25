<script>
  export let value = 0;
  export let hasFlag = false;
  export let hasBomb = false;
  export let isOpen = false;
</script>

<style>
  .cell {
    background-color: #ddd;
    border-color: #9a9a9a;
    border-style: solid;
    border-width: 0 1px 1px 0;
    box-sizing: border-box;
    cursor: pointer;
    font-family: 'Sweeper', sans-serif;
    font-size: 1em;
    font-weight: bold;
    height: 36px;
    line-height: 36px;
    position: relative;
    text-align: center;
    width: 36px;
  }

  .cell::after {
    border: 3px outset #fff;
    box-sizing: border-box;
    content: '';
    height: 100%;
    left: 0;
    position: absolute;
    width: 100%;
  }

  .cell.isOpen::after {
    border: none;
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
</style>

<div
  class="cell value--{value}"
  class:isOpen
  on:click
  on:contextmenu|preventDefault>
   {isOpen ? (hasBomb ? '💣' : value > 0 ? value : '') : hasFlag ? '⛳' : ''}
</div>
