<script>
  import Cell from './Cell.svelte';
  import GameOver from './GameOver.svelte';
  import buildBoard from '../board';
  import difficultyLevels from '../difficultyLevels';

  let board;
  let selectedDifficulty = difficultyLevels[0];

  function restart() {
    const { width, height, bombsCount } = selectedDifficulty.values;
    board = buildBoard(width, height, bombsCount);
  }
  restart();

  $: remainingFlags =
    selectedDifficulty.values.bombsCount -
    board.reduce(
      (total, rows) =>
        total +
        rows.reduce((sumRow, cell) => sumRow + (cell.hasFlag ? 1 : 0), 0),
      0
    );

  $: hasDefusedAll = !board.some(row =>
    row.some(cell => cell.hasBomb && !cell.hasFlag)
  );

  $: hasBlownUp = board.some(row =>
    row.some(cell => cell.hasBomb && cell.isOpen)
  );

  function openCell(i, j) {
    const { width, height } = selectedDifficulty.values;
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
  }

  function putFlag(i, j) {
    board[i][j].hasFlag = !board[i][j].hasFlag;
  }
</script>

<style>
  .game {
    display: inline-block;
    margin: 0 auto;
    position: relative;
  }

  .menu {
    display: flex;
    justify-content: space-between;
  }

  .row {
    display: flex;
  }
</style>

<div class="game">
  {#if hasBlownUp}
    <GameOver hasWon={false} on:restart={restart} />
  {/if}
  {#if hasDefusedAll}
    <GameOver hasWon={true} on:restart={restart} />
  {/if}
  <div class="menu">
    <select bind:value={selectedDifficulty} on:change={restart}>
      {#each difficultyLevels as difficultyLevel}
        <option value={difficultyLevel}>{difficultyLevel.name}</option>
      {/each}
    </select>
    ⛳ x {remainingFlags}
  </div>

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
