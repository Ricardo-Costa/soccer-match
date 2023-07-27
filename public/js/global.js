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
        prepareHtmlContent += (`<div title="${formatBlockID(counterColumns, counterRows)}" id="${formatBlockID(counterColumns, counterRows)}" class="field-block field-block-ball"></div>`);
      }
      // map goals blocks
      else if (isGoalBlock(fieldMaps, counterColumns, counterRows)) {
        prepareHtmlContent += (`<div title="${formatBlockID(counterColumns, counterRows)}" id="${formatBlockID(counterColumns, counterRows)}" class="field-block field-block-goal"></div>`);
      }
      // map players blocks
      else if (hasPlayer(gameState, counterColumns, counterRows)) {
        const player = gameState.players.find(player => `c${player.position.column}-r${player.position.row}` == `c${counterColumns}-r${counterRows}`);
        prepareHtmlContent += (`<div title="${player.name} - ${formatBlockID(counterColumns, counterRows)}" id="${formatBlockID(counterColumns, counterRows)}" class="field-block field-block-team-${player.team}"></div>`);
      }
      // map empty blocks
      else {
        prepareHtmlContent += (`<div title="${formatBlockID(counterColumns, counterRows)}" id="${formatBlockID(counterColumns, counterRows)}" class="field-block"></div>`);
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

  const fieldLimitInTop = newBallPosition.row <= FIELD_ROW_MIN_LIMIT;
  const fieldLimitInBottom = newBallPosition.row >= FIELD_ROW_MAX_LIMIT;
  const fieldLimitInLeft = newBallPosition.column <= FIELD_COLUMN_MIN_LIMIT;
  const fieldLimitInRight = newBallPosition.column >= FIELD_COLUMN_MAX_LIMIT;

  const ballGoingToTop_ = newBallPosition.row < currentBallPosition.row && newBallPosition.column == currentBallPosition.column;
  const ballGoingToBottom_ = newBallPosition.row > currentBallPosition.row && newBallPosition.column == currentBallPosition.column;
  const ballGoingToLeft_ = newBallPosition.column < currentBallPosition.column && newBallPosition.row == currentBallPosition.row;
  const ballGoingToRight_ = newBallPosition.column > currentBallPosition.column && newBallPosition.row == currentBallPosition.row;

  const ballGoingToTopLeft_ = newBallPosition.row < currentBallPosition.row && newBallPosition.column < currentBallPosition.column;
  const ballGoingToTopRight_ = newBallPosition.row < currentBallPosition.row && newBallPosition.column > currentBallPosition.column;
  const ballGoingToBottomLeft_ = newBallPosition.row > currentBallPosition.row && newBallPosition.column < currentBallPosition.column;
  const ballGoingToBottomRight_ = newBallPosition.row > currentBallPosition.row && newBallPosition.column > currentBallPosition.column;

  const hasPlayerInTop_ = hasPlayer(newGameStatusContext, newBallPosition.column, rowPositionToTop(newBallPosition.row));
  const hasPlayerInBottom_ = hasPlayer(newGameStatusContext, newBallPosition.column, rowPositionToBottom(newBallPosition.row));
  const hasPlayerInLeft_ = hasPlayer(newGameStatusContext, columnPositionToLeft(newBallPosition.column), newBallPosition.row);
  const hasPlayerInRight_ = hasPlayer(newGameStatusContext, columnPositionToRight(newBallPosition.column), newBallPosition.row);

  const hasPlayerInTopLeft_ = hasPlayer(newGameStatusContext, columnPositionToLeft(newBallPosition.column), rowPositionToTop(newBallPosition.row));
  const hasPlayerInTopRight_ = hasPlayer(newGameStatusContext, columnPositionToRight(newBallPosition.column), rowPositionToTop(newBallPosition.row));
  const hasPlayerInBottomLeft_ = hasPlayer(newGameStatusContext, columnPositionToLeft(newBallPosition.column), rowPositionToBottom(newBallPosition.row));
  const hasPlayerInBottomRight_ = hasPlayer(newGameStatusContext, columnPositionToRight(newBallPosition.column), rowPositionToBottom(newBallPosition.row));

  const treatCollision = ({ column, row }) => {

    const fieldLimitInTop = row <= FIELD_ROW_MIN_LIMIT;
    const fieldLimitInBottom = row >= FIELD_ROW_MAX_LIMIT;
    const fieldLimitInLeft = column <= FIELD_COLUMN_MIN_LIMIT;
    const fieldLimitInRight = column >= FIELD_COLUMN_MAX_LIMIT;
  
    const ballGoingToTop_ = row < newBallPosition.row && column == newBallPosition.column;
    const ballGoingToBottom_ = row > newBallPosition.row && column == newBallPosition.column;
    const ballGoingToLeft_ = column < newBallPosition.column && row == newBallPosition.row;
    const ballGoingToRight_ = column > newBallPosition.column && row == newBallPosition.row;
  
    const ballGoingToTopLeft_ = row < newBallPosition.row && column < newBallPosition.column;
    const ballGoingToTopRight_ = row < newBallPosition.row && column > newBallPosition.column;
    const ballGoingToBottomLeft_ = row > newBallPosition.row && column < newBallPosition.column;
    const ballGoingToBottomRight_ = row > newBallPosition.row && column > newBallPosition.column;

    const hasPlayer_ = hasPlayer(newGameStatusContext, column, row);

    // TODO resolver aqui
    // // collision in to ballGoingToTopLeft_
    // if (hasPlayer_ && ballGoingToTopLeft_ && ( !fieldLimitInBottom && !fieldLimitInRight )) {
    //   return { column: columnPositionToRight(column, true), row: rowPositionToBottom(row, true) }
    // }
    // // collision in to ballGoingToTopRight_
    // else if (hasPlayer_ && ballGoingToTopRight_ && ( !fieldLimitInBottom && !fieldLimitInLeft )) {
    //   return { column: columnPositionToLeft(column, true), row: rowPositionToBottom(row, true) }
    // }
    // // collision in to ballGoingToBottomLeft_
    // else if (hasPlayer_ && ballGoingToBottomLeft_ && ( !fieldLimitInTop && !fieldLimitInRight )) {
    //   return { column: columnPositionToRight(column, true), row: rowPositionToTop(row, true) }
    // }
    // // collision in to ballGoingToBottomRight_
    // else if (hasPlayer_ && ballGoingToBottomRight_ && ( !fieldLimitInTop && !fieldLimitInLeft )) {
    //   return { column: columnPositionToLeft(column, true), row: rowPositionToTop(row, true) }
    // }
    // // collision in to Top
    // else if (hasPlayer_ && ballGoingToTop_ && !fieldLimitInBottom) {
    //   return { column, row: rowPositionToBottom(row, true) }
    // }
    // // collision in to bottom
    // else if (hasPlayer_ && ballGoingToBottom_ && !fieldLimitInTop) {
    //   return { column, row: rowPositionToTop(row, true) }
    // }
    // // collision in to left
    // else if (hasPlayer_ && ballGoingToLeft_ && !fieldLimitInRight) {
    //   return { column: columnPositionToRight(column, true), row }
    // }
    // // collision in to right
    // else if (hasPlayer_ && ballGoingToRight_ && !fieldLimitInLeft) {
    //   return { column: columnPositionToLeft(column, true), row }
    // }
    // else if (fieldLimitInTop) {
    //   return { column, row: rowPositionToBottom(row, true) }
    // }
    // else if (fieldLimitInBottom) {
    //   return { column, row: rowPositionToTop(row, true) }
    // }
    // else if (fieldLimitInRight) {
    //   return { column: columnPositionToLeft(column, true), row }
    // }
    // else if (fieldLimitInLeft) {
    //   return { column: columnPositionToRight(column, true), row }
    // }

    return { column, row }
  };

  // diagonal BOTTOM-RIGHT
  if (ballGoingToBottomRight_ && hasPlayerInRight_) {
    return treatCollision({
      row: rowPositionToBottom(newBallPosition.row),
      column: columnPositionToLeft(newBallPosition.column)
    });
  } else if (ballGoingToBottomRight_ && hasPlayerInBottom_) {
    return treatCollision({
      row: rowPositionToTop(newBallPosition.row),
      column: columnPositionToRight(newBallPosition.column)
    });
  } else if (ballGoingToBottomRight_ && hasPlayerInBottomRight_) {
    return treatCollision({
      row: rowPositionToTop(newBallPosition.row),
      column: columnPositionToLeft(newBallPosition.column)
    });
  } else if (ballGoingToBottomRight_ && fieldLimitInBottom && fieldLimitInRight) {
    return treatCollision({
      row: rowPositionToTop(newBallPosition.row),
      column: columnPositionToLeft(newBallPosition.column)
    });
  } else if (ballGoingToBottomRight_ && fieldLimitInBottom) {
    return treatCollision({
      row: rowPositionToTop(newBallPosition.row),
      column: columnPositionToRight(newBallPosition.column)
    });
  } else if (ballGoingToBottomRight_ && fieldLimitInRight) {
    return treatCollision({
      row: rowPositionToBottom(newBallPosition.row),
      column: columnPositionToLeft(newBallPosition.column)
    });
  } else if (ballGoingToBottomRight_) {
    return treatCollision({
      row: rowPositionToBottom(newBallPosition.row),
      column: columnPositionToRight(newBallPosition.column)
    });
  }

  // diagonal BOTTOM-LEFT
  else if (ballGoingToBottomLeft_ && hasPlayerInLeft_) {
    return treatCollision({
      row: rowPositionToBottom(newBallPosition.row),
      column: columnPositionToRight(newBallPosition.column)
    });
  } else if (ballGoingToBottomLeft_ && hasPlayerInBottom_) {
    return treatCollision({
      row: rowPositionToTop(newBallPosition.row),
      column: columnPositionToLeft(newBallPosition.column)
    });
  } else if (ballGoingToBottomLeft_ && hasPlayerInBottomLeft_) {
    return treatCollision({
      row: rowPositionToTop(newBallPosition.row),
      column: columnPositionToRight(newBallPosition.column)
    });
  } else if (ballGoingToBottomLeft_ && fieldLimitInBottom && fieldLimitInLeft) {
    return treatCollision({
      row: rowPositionToTop(newBallPosition.row),
      column: columnPositionToRight(newBallPosition.column)
    });
  } else if (ballGoingToBottomLeft_ && fieldLimitInBottom) {
    return treatCollision({
      row: rowPositionToTop(newBallPosition.row),
      column: columnPositionToLeft(newBallPosition.column)
    });
  } else if (ballGoingToBottomLeft_ && fieldLimitInLeft) {
    return treatCollision({
      row: rowPositionToBottom(newBallPosition.row),
      column: columnPositionToRight(newBallPosition.column)
    });
  } else if (ballGoingToBottomLeft_) {
    return treatCollision({
      row: rowPositionToBottom(newBallPosition.row),
      column: columnPositionToLeft(newBallPosition.column)
    });
  }

  // diagonal TOP-RIGHT
  if (ballGoingToTopRight_ && hasPlayerInRight_) {
    return treatCollision({
      row: rowPositionToTop(newBallPosition.row),
      column: columnPositionToRight(newBallPosition.column)
    });
  } else if (ballGoingToTopRight_ && hasPlayerInTop_) {
    return treatCollision({
      row: rowPositionToBottom(newBallPosition.row),
      column: columnPositionToRight(newBallPosition.column)
    });
  } else if (ballGoingToTopRight_ && hasPlayerInTopRight_) {
    return treatCollision({
      row: rowPositionToBottom(newBallPosition.row),
      column: columnPositionToRight(newBallPosition.column)
    });
  } else if (ballGoingToTopRight_ && fieldLimitInTop && fieldLimitInRight) {
    return treatCollision({
      row: rowPositionToBottom(newBallPosition.row),
      column: columnPositionToLeft(newBallPosition.column)
    });
  } else if (ballGoingToTopRight_ && fieldLimitInTop) {
    return treatCollision({
      row: rowPositionToBottom(newBallPosition.row),
      column: columnPositionToRight(newBallPosition.column)
    });
  } else if (ballGoingToTopRight_ && fieldLimitInRight) {
    return treatCollision({
      row: rowPositionToTop(newBallPosition.row),
      column: columnPositionToLeft(newBallPosition.column)
    });
  } else if (ballGoingToTopRight_) {
    return treatCollision({
      row: rowPositionToTop(newBallPosition.row),
      column: columnPositionToRight(newBallPosition.column)
    });
  }

  // diagonal TOP-LEFT
  else if (ballGoingToTopLeft_ && hasPlayerInLeft_) {
    return treatCollision({
      row: rowPositionToTop(newBallPosition.row),
      column: columnPositionToRight(newBallPosition.column)
    });
  } else if (ballGoingToTopLeft_ && hasPlayerInTop_) {
    return treatCollision({
      row: rowPositionToBottom(newBallPosition.row),
      column: columnPositionToLeft(newBallPosition.column)
    });
  } else if (ballGoingToTopLeft_ && hasPlayerInTopLeft_) {
    return treatCollision({
      row: rowPositionToBottom(newBallPosition.row),
      column: columnPositionToRight(newBallPosition.column)
    });
  } else if (ballGoingToTopLeft_ && fieldLimitInTop && fieldLimitInLeft) {
    return treatCollision({
      row: rowPositionToBottom(newBallPosition.row),
      column: columnPositionToRight(newBallPosition.column)
    });
  } else if (ballGoingToTopLeft_ && fieldLimitInTop) {
    return treatCollision({
      row: rowPositionToBottom(newBallPosition.row),
      column: columnPositionToLeft(newBallPosition.column)
    });
  } else if (ballGoingToTopLeft_ && fieldLimitInLeft) {
    return treatCollision({
      row: rowPositionToTop(newBallPosition.row),
      column: columnPositionToRight(newBallPosition.column)
    });
  } else if (ballGoingToTopLeft_) {
    return treatCollision({
      row: rowPositionToTop(newBallPosition.row),
      column: columnPositionToLeft(newBallPosition.column)
    });
  }

  // horizontal
  if (ballGoingToTop_ && hasPlayerInTop_) {
    return treatCollision({
      row: rowPositionToBottom(newBallPosition.row),
      column: newBallPosition.column
    });
  } else if (ballGoingToBottom_ && hasPlayerInBottom_) {
    return treatCollision({
      row: rowPositionToTop(newBallPosition.row),
      column: newBallPosition.column
    });
  } else if (fieldLimitInTop) {
    return treatCollision({
      row: rowPositionToBottom(newBallPosition.row),
      column: newBallPosition.column
    });
  } else if (fieldLimitInBottom) {
    return treatCollision({
      row: rowPositionToTop(newBallPosition.row),
      column: newBallPosition.column
    });
  } else if (ballGoingToTop_) {
    return treatCollision({
      row: rowPositionToTop(newBallPosition.row),
      column: newBallPosition.column
    });
  } else if (ballGoingToBottom_) {
    return treatCollision({
      row: rowPositionToBottom(newBallPosition.row),
      column: newBallPosition.column
    });
  }
  
  // vertical
  else if (ballGoingToLeft_ && hasPlayerInLeft_) {
    return treatCollision({
      row: newBallPosition.row,
      column: columnPositionToRight(newBallPosition.column)
    });
  } else if (ballGoingToRight_ && hasPlayerInRight_) {
    return treatCollision({
      row: newBallPosition.row,
      column: columnPositionToLeft(newBallPosition.column)
    });
  } else if (fieldLimitInLeft) {
    return treatCollision({
      column: columnPositionToRight(newBallPosition.column),
      row: newBallPosition.row
    });
  } else if (fieldLimitInRight) {
    return treatCollision({
      column: columnPositionToLeft(newBallPosition.column),
      row: newBallPosition.row
    });
  } else if (ballGoingToLeft_) {
    return treatCollision({
      column: columnPositionToLeft(newBallPosition.column),
      row: newBallPosition.row
    });
  } else if (ballGoingToRight_) {
    return treatCollision({
      column: columnPositionToRight(newBallPosition.column),
      row: newBallPosition.row
    });
  } else {
    return treatCollision({
      column: newBallPosition.column,
      row: newBallPosition.row
    });
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