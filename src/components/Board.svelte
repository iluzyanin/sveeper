<script>
  import Cell from './Cell.svelte';

  export let board = [];

  const openCell = (i, j) => {
    const height = board.length;
    const width = board[0].length;
    if (i >= 0 && i < height && j >= 0 && j < width && !board[i][j].isOpen) {
      board[i][j].isOpen = true;
      board[i][j].hasFlag = false;
      if (board[i][j].hasBomb) {
        return;
      }
      if (board[i][j].value === 0) {
        openCell(i - 1, j - 1);
        openCell(i, j - 1);
        openCell(i + 1, j - 1);
        openCell(i - 1, j);
        openCell(i + 1, j);
        openCell(i - 1, j + 1);
        openCell(i, j + 1);
        openCell(i + 1, j + 1);
      }
    }
  };

  const putFlag = (i, j) => {
    if (board[i][j].isOpen) {
      return;
    }
    board[i][j].hasFlag = !board[i][j].hasFlag;
  };
</script>

<style>
  .board {
    border: #9a9a9a solid;
    border-width: 1px 0 0 1px;
  }

  .row {
    display: flex;
  }
</style>

<div class="board">
  {#each board as row, i}
    <div class="row">
      {#each row as cell, j}
        <Cell
          {...cell}
          on:click={() => openCell(i, j)}
          on:contextmenu={() => putFlag(i, j)} />
      {/each}
    </div>
  {/each}
</div>
