<script>
  import Cell from "./Cell.svelte";
  import buildBoard from "../board.js";
  import difficultyLevels from "../difficultyLevels";

  let board;
  let selectedDifficulty = difficultyLevels[0];
  let remainingFlags = selectedDifficulty.values.bombsCount;
  onDifficultyChange();

  function onDifficultyChange() {
    const { width, height, bombsCount } = selectedDifficulty.values;
    board = buildBoard(width, height, bombsCount);
    remainingFlags = selectedDifficulty.values.bombsCount;
  }

  let isGameOver = false;

  function openCell(i, j) {
    const { width, height } = selectedDifficulty.values;
    if (i >= 0 && i < height && j >= 0 && j < width && !board[i][j].isOpen) {
      board[i][j].isOpen = true;
      if (board[i][j].hasBomb) {
        isGameOver = true;
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
    remainingFlags = board[i][j].hasFlag
      ? remainingFlags + 1
      : remainingFlags - 1;
    board[i][j].hasFlag = !board[i][j].hasFlag;

    if (remainingFlags === 0) {
      if (board.some(row => row.some(cell => cell.hasBomb && !cell.hasFlag))) {
        console.log("nope!");
      } else {
        console.log("win!");
      }
    }
  }
</script>

<style>
  .game {
    display: inline-block;
    margin: 0 auto;
  }
  .menu {
    display: flex;
    justify-content: space-between;
  }
  .row {
    display: flex;
  }
</style>

{#if isGameOver}GAME OVER{/if}
<div class="game">
  <div class="menu">
    <select bind:value={selectedDifficulty} on:change={onDifficultyChange}>
      {#each difficultyLevels as difficultyLevel}
        <option value={difficultyLevel}> {difficultyLevel.name} </option>
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
