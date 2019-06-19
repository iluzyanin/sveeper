const getRandomSequence = (totalCount, sequenceLength) => {
  const result = [];
  for (let i = 0; i < totalCount; i++) result[i] = i;

  for (let i = totalCount - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i);
    result[j] += result[i];
    result[i] = result[j] - result[i];
    result[j] -= result[i];
  }

  return result.slice(0, sequenceLength);
};

const bumpBombsCount = (board, x, y) => {
  const width = board[0].length;
  const height = board.length;
  if (x < 0 || x > width - 1 || y < 0 || y > height - 1) {
    return;
  }

  board[y][x].value++; // eslint-disable-line
};

const buildBoard = (width, height, bombsCount) => {
  const bombs = getRandomSequence(width * height, bombsCount);

  const board = [];
  for (let i = 0; i < height; i++) {
    const rowCells = [];
    for (let j = 0; j < width; j++) {
      rowCells.push({ value: 0, hasBomb: false, isOpen: false });
    }
    board.push(rowCells);
  }
  for (let i = 0; i < bombs.length; i++) {
    const y = Math.floor(bombs[i] / width);
    const x = bombs[i] % width;
    board[y][x].hasBomb = true;
    bumpBombsCount(board, x - 1, y - 1);
    bumpBombsCount(board, x, y - 1);
    bumpBombsCount(board, x + 1, y - 1);
    bumpBombsCount(board, x - 1, y);
    bumpBombsCount(board, x + 1, y);
    bumpBombsCount(board, x - 1, y + 1);
    bumpBombsCount(board, x, y + 1);
    bumpBombsCount(board, x + 1, y + 1);
  }

  return board;
};
export default buildBoard;
