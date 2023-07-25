import {
  log,
  addToField,
  clearField,
  formatBlockID,
  isGoalBlock,
  isBallBlock,
  hasPlayer,
  removeFromHtmlClasses,
  addToHtmlClasses,
  hasHtmlClasses
} from './helpers.js';
import {
  FIELD_COLUMN_MAX_LIMIT,
  FIELD_COLUMN_MIN_LIMIT,
  FIELD_ROW_MAX_LIMIT,
  FIELD_ROW_MIN_LIMIT
} from './configs.js';

const startGame = (fieldMaps, gameState) => {
  log(startGame.name);

  clearField();

  let prepareHtmlContent = '';
  for (let counterColumns = 1; counterColumns <= fieldMaps.columns; counterColumns++) {
    prepareHtmlContent = (`<div id="field-col-c${counterColumns}" class="field-col">`);
    for (let counterRows = 1; counterRows <= fieldMaps.rows; counterRows++) {
      // map ball block
      if (isBallBlock(fieldMaps, counterColumns, counterRows)) {
        prepareHtmlContent += (`<div id="${formatBlockID(counterColumns, counterRows)}" class="field-block field-block-ball"></div>`);
      }
      // map goals blocks
      else if (isGoalBlock(fieldMaps, counterColumns, counterRows)) {
        prepareHtmlContent += (`<div id="${formatBlockID(counterColumns, counterRows)}" class="field-block field-block-goal"></div>`);
      }
      // map players blocks
      else if (hasPlayer(gameState, counterColumns, counterRows)) {
        const player = gameState.players.find(player => `c${player.position.column}-r${player.position.row}` == `c${counterColumns}-r${counterRows}`);
        prepareHtmlContent += (`<div id="${formatBlockID(counterColumns, counterRows)}" class="field-block field-block-team-${player.team}"></div>`);
      }
      // map empty blocks
      else {
        prepareHtmlContent += (`<div id="${formatBlockID(counterColumns, counterRows)}" class="field-block"></div>`);
      }
    }
    prepareHtmlContent += (`</div>`);
    addToField(prepareHtmlContent);
  }

}

const columnPositionToLeft = (column, skip = false) => (column - 1 - (skip ? 1 : 0 )); // move one block by time
const columnPositionToRight = (column, skip = false) => (column + 1 + (skip ? 1 : 0 )); // move one block by time
const rowPositionToTop = (row, skip = false) => (row - 1 - (skip ? 1 : 0 )); // move one block by time
const rowPositionToBottom = (row, skip = false) => (row + 1 + (skip ? 1 : 0 )); // move one block by time

const getNewBallPosition = (newGameStatusContext, currentBallPosition, newBallPosition) => {
  log(getNewBallPosition.name);

  // vertical
  if (
    (newBallPosition.row < currentBallPosition.row) &&
    hasPlayer(newGameStatusContext, newBallPosition.column, rowPositionToTop(newBallPosition.row))
  ) {
    return {
      row: rowPositionToBottom(newBallPosition.row),
      column: newBallPosition.column
    }
  } else if (
    (newBallPosition.row > currentBallPosition.row) &&
    hasPlayer(newGameStatusContext, newBallPosition.column, rowPositionToBottom(newBallPosition.row))
  ) {
    return {
      row: rowPositionToTop(newBallPosition.row),
      column: newBallPosition.column
    }
  } else if (newBallPosition.row <= FIELD_ROW_MIN_LIMIT) {
    return {
      row: rowPositionToBottom(newBallPosition.row),
      column: newBallPosition.column
    }
  } else if (newBallPosition.row >= FIELD_ROW_MAX_LIMIT) {
    return {
      row: rowPositionToTop(newBallPosition.row),
      column: newBallPosition.column
    }
  } else if (newBallPosition.row < currentBallPosition.row) {
    return {
      row: rowPositionToTop(newBallPosition.row),
      column: newBallPosition.column
    }
  } else if (newBallPosition.row > currentBallPosition.row) {
    return {
      row: rowPositionToBottom(newBallPosition.row),
      column: newBallPosition.column
    }
  }
  
  // horizontal
  else if (
    (newBallPosition.column < currentBallPosition.column) &&
    hasPlayer(newGameStatusContext, columnPositionToLeft(newBallPosition.column), newBallPosition.row)
  ) {
    return {
      row: newBallPosition.row,
      column: columnPositionToRight(newBallPosition.column)
    }
  } else if (
    (newBallPosition.column > currentBallPosition.column) &&
    hasPlayer(newGameStatusContext, columnPositionToRight(newBallPosition.column), newBallPosition.row)
  ) {
    return {
      row: newBallPosition.row,
      column: columnPositionToLeft(newBallPosition.column)
    }
  } else if (newBallPosition.column <= FIELD_COLUMN_MIN_LIMIT) {
    return {
      column: columnPositionToRight(newBallPosition.column),
      row: newBallPosition.row
    }
  } else if (newBallPosition.column >= FIELD_COLUMN_MAX_LIMIT) {
    return {
      column: columnPositionToLeft(newBallPosition.column),
      row: newBallPosition.row
    }
  } else if (newBallPosition.column < currentBallPosition.column) {
    return {
      column: columnPositionToLeft(newBallPosition.column),
      row: newBallPosition.row
    }
  } else if (newBallPosition.column > currentBallPosition.column) {
    return {
      column: columnPositionToRight(newBallPosition.column),
      row: newBallPosition.row
    }
  } else {
    return {
      column: newBallPosition.column,
      row: newBallPosition.row
    }
  }
}

const refreshGame = (currentFieldMap, newFieldMap, currentGameStatus, newGameStatus) => {
  log(refreshGame.name);

  let newFieldMapContext = newFieldMap;
  let newGameStatusContext = newGameStatus;

  // update ball position
  if (
    currentFieldMap.ball.column != newFieldMap.ball.column ||
    currentFieldMap.ball.row != newFieldMap.ball.row
  ) {
    log('update ball position...');

    const el = document.getElementById(formatBlockID(
      currentFieldMap.ball.column,
      currentFieldMap.ball.row
    ));
    const targetEl = document.getElementById(formatBlockID(
      newFieldMap.ball.column,
      newFieldMap.ball.row
    ));
    removeFromHtmlClasses(
      el.className,
      'field-block-ball',
      el
    );
    addToHtmlClasses(
      targetEl.className,
      'field-block-ball',
      targetEl
    );

    newFieldMapContext.ball = getNewBallPosition(
      newGameStatusContext,
      currentFieldMap.ball,
      newFieldMap.ball
    );
  }

  return {
    newFieldMap: newFieldMapContext,
    newGameStatus: newGameStatusContext
  };
}

export { startGame, refreshGame };