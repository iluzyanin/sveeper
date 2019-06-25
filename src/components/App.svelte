<script>
  import buildBoard from '../board';
  import difficultyLevels from '../difficultyLevels';
  import Board from './Board.svelte';
  import GameOver from './GameOver.svelte';
  import Menu from './Menu.svelte';

  let board;
  let selectedDifficulty = difficultyLevels[0];
  let time = selectedDifficulty.maxTime;

  const restart = () => {
    const { boardWidth, boardHeight, bombsCount } = selectedDifficulty;
    board = buildBoard(boardWidth, boardHeight, bombsCount);
    time = selectedDifficulty.maxTime;
  };

  restart();

  $: remainingFlags =
    selectedDifficulty.bombsCount -
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

  $: isGameOver = hasDefusedAll || hasBlownUp || time === 0;

  $: isGameStarted =
    board.some(row => row.some(cell => cell.hasFlag || cell.isOpen)) &&
    !isGameOver;

  $: if (isGameOver) {
    board.forEach(row => row.forEach(cell => (cell.isOpen = true)));
  }
</script>

<style>
  .game {
    display: table;
    margin: 0 auto;
    position: relative;
  }
</style>

<div class="game">
  {#if isGameOver}
    <GameOver hasWon={hasDefusedAll} on:restart={restart} />
  {/if}
  <Menu
    bind:selectedDifficulty
    {remainingFlags}
    on:changeDifficulty={restart}
    {isGameStarted}
    bind:time />
  <Board bind:board />
</div>
