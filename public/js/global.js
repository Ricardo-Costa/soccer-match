import {
  log,
  sleep,
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
  FIELD_ROW_MIN_LIMIT,
  RENDER_INTERVAL
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

const getNewBallPosition = async (newFieldMap, newGameStatusContext, currentBallPosition, newBallPosition) => {
  log(getNewBallPosition.name);

  console.log(`c${newBallPosition.column}-r${currentBallPosition.row}`)

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

  const hasObjectInLeft = () => (fieldLimitInLeft || hasPlayerInLeft_);
  const hasObjectInTopLeft = () => ((fieldLimitInTop && fieldLimitInLeft) || hasPlayerInTopLeft_);
  const hasObjectInTop = () => (fieldLimitInTop || hasPlayerInTop_);
  const hasObjectInTopRight = () => ((fieldLimitInTop && fieldLimitInRight) || hasPlayerInTopRight_);
  const hasObjectInRight = () => (fieldLimitInRight || hasPlayerInRight_);
  const hasObjectInBottomLeft = () => ((fieldLimitInBottom && fieldLimitInLeft) || hasPlayerInBottomLeft_);
  const hasObjectInBottom = () => (fieldLimitInBottom || hasPlayerInBottom_);
  const hasObjectInBottomRight = () => ((fieldLimitInBottom && fieldLimitInRight) || hasPlayerInBottomRight_);

  const showBallHtmlElement = async (currentBallPosition, newBallPosition) => {
    const el = document.getElementById(formatBlockID(
      currentBallPosition.column,
      currentBallPosition.row
    ));
    if (!el) return;

    const targetEl = document.getElementById(formatBlockID(
      newBallPosition.column,
      newBallPosition.row
    ));
    if (!targetEl) return;

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

    await sleep(RENDER_INTERVAL);
  }

  // diagonal BOTTOM-RIGHT
  if (ballGoingToBottomRight_ && hasObjectInRight()) {
    await showBallHtmlElement(newBallPosition, {
      row: rowPositionToBottom(newBallPosition.row),
      column: columnPositionToLeft(newBallPosition.column)
    });
    const nextBallPosition = await getNewBallPosition(newFieldMap, newGameStatusContext, newBallPosition, {
      row: rowPositionToBottom(newBallPosition.row),
      column: columnPositionToLeft(newBallPosition.column)
    });
    await showBallHtmlElement(newBallPosition, nextBallPosition);
    return nextBallPosition;
  } else if (ballGoingToBottomRight_ && hasObjectInBottom()) {
    await showBallHtmlElement(newBallPosition, {
      row: rowPositionToTop(newBallPosition.row),
      column: columnPositionToRight(newBallPosition.column)
    });
    const nextBallPosition = await getNewBallPosition(newFieldMap, newGameStatusContext, newBallPosition, {
      row: rowPositionToTop(newBallPosition.row),
      column: columnPositionToRight(newBallPosition.column)
    });
    await showBallHtmlElement(newBallPosition, nextBallPosition);
    return nextBallPosition;
  } else if (ballGoingToBottomRight_ && hasObjectInBottomRight()) {
    await showBallHtmlElement(newBallPosition, {
      row: rowPositionToTop(newBallPosition.row),
      column: columnPositionToLeft(newBallPosition.column)
    });
    const nextBallPosition = await getNewBallPosition(newFieldMap, newGameStatusContext, newBallPosition, {
      row: rowPositionToTop(newBallPosition.row),
      column: columnPositionToLeft(newBallPosition.column)
    });
    await showBallHtmlElement(newBallPosition, nextBallPosition);
    return nextBallPosition;
  } else if (ballGoingToBottomRight_) {
    const nextBallPosition = ({
      row: rowPositionToBottom(newBallPosition.row),
      column: columnPositionToRight(newBallPosition.column)
    });
    await showBallHtmlElement(newBallPosition, nextBallPosition);
    return nextBallPosition;
  }

  // diagonal BOTTOM-LEFT
  else if (ballGoingToBottomLeft_ && hasObjectInLeft()) {
    await showBallHtmlElement(newBallPosition, {
      row: rowPositionToBottom(newBallPosition.row),
      column: columnPositionToRight(newBallPosition.column)
    });
    const nextBallPosition = await getNewBallPosition(newFieldMap, newGameStatusContext, newBallPosition, {
      row: rowPositionToBottom(newBallPosition.row),
      column: columnPositionToRight(newBallPosition.column)
    });
    await showBallHtmlElement(newBallPosition, nextBallPosition);
    return nextBallPosition;
  } else if (ballGoingToBottomLeft_ && hasObjectInBottom()) {
    await showBallHtmlElement(newBallPosition, {
      row: rowPositionToTop(newBallPosition.row),
      column: columnPositionToLeft(newBallPosition.column)
    });
    const nextBallPosition = await getNewBallPosition(newFieldMap, newGameStatusContext, newBallPosition, {
      row: rowPositionToTop(newBallPosition.row),
      column: columnPositionToLeft(newBallPosition.column)
    });
    await showBallHtmlElement(newBallPosition, nextBallPosition);
    return nextBallPosition;
  } else if (ballGoingToBottomLeft_ && hasObjectInBottomLeft()) {
    await showBallHtmlElement(newBallPosition, {
      row: rowPositionToTop(newBallPosition.row),
      column: columnPositionToRight(newBallPosition.column)
    });
    const nextBallPosition = await getNewBallPosition(newFieldMap, newGameStatusContext, newBallPosition, {
      row: rowPositionToTop(newBallPosition.row),
      column: columnPositionToRight(newBallPosition.column)
    });
    await showBallHtmlElement(newBallPosition, nextBallPosition);
    return nextBallPosition;
  } else if (ballGoingToBottomLeft_) {
    const nextBallPosition = ({
      row: rowPositionToBottom(newBallPosition.row),
      column: columnPositionToLeft(newBallPosition.column)
    });
    await showBallHtmlElement(newBallPosition, nextBallPosition);
    return nextBallPosition;
  }

  // diagonal TOP-RIGHT
  if (ballGoingToTopRight_ && hasObjectInRight()) {
    await showBallHtmlElement(newBallPosition, {
      row: rowPositionToTop(newBallPosition.row),
      column: columnPositionToLeft(newBallPosition.column)
    });
    const nextBallPosition = await getNewBallPosition(newFieldMap, newGameStatusContext, newBallPosition, {
      row: rowPositionToTop(newBallPosition.row),
      column: columnPositionToLeft(newBallPosition.column)
    });
    await showBallHtmlElement(newBallPosition, nextBallPosition);
    return nextBallPosition;
  } else if (ballGoingToTopRight_ && hasObjectInTop()) {
    await showBallHtmlElement(newBallPosition, {
      row: rowPositionToBottom(newBallPosition.row),
      column: columnPositionToRight(newBallPosition.column)
    });
    const nextBallPosition = await getNewBallPosition(newFieldMap, newGameStatusContext, newBallPosition, {
      row: rowPositionToBottom(newBallPosition.row),
      column: columnPositionToRight(newBallPosition.column)
    });
    await showBallHtmlElement(newBallPosition, nextBallPosition);
    return nextBallPosition;
  } else if (ballGoingToTopRight_ && hasObjectInTopRight()) {
    await showBallHtmlElement(newBallPosition, {
      row: rowPositionToBottom(newBallPosition.row),
      column: columnPositionToLeft(newBallPosition.column)
    });
    const nextBallPosition = await getNewBallPosition(newFieldMap, newGameStatusContext, newBallPosition, {
      row: rowPositionToBottom(newBallPosition.row),
      column: columnPositionToLeft(newBallPosition.column)
    });
    await showBallHtmlElement(newBallPosition, nextBallPosition);
    return nextBallPosition;
  } else if (ballGoingToTopRight_) {
    const nextBallPosition = ({
      row: rowPositionToTop(newBallPosition.row),
      column: columnPositionToRight(newBallPosition.column)
    });
    await showBallHtmlElement(newBallPosition, nextBallPosition);
    return nextBallPosition;
  }

  // diagonal TOP-LEFT
  else if (ballGoingToTopLeft_ && hasObjectInLeft()) {
    await showBallHtmlElement(newBallPosition, {
      row: rowPositionToTop(newBallPosition.row),
      column: columnPositionToRight(newBallPosition.column)
    });
    const nextBallPosition = await getNewBallPosition(newFieldMap, newGameStatusContext, newBallPosition, {
      row: rowPositionToTop(newBallPosition.row),
      column: columnPositionToRight(newBallPosition.column)
    });
    await showBallHtmlElement(newBallPosition, nextBallPosition);
    return nextBallPosition;
  } else if (ballGoingToTopLeft_ && hasObjectInTop()) {
    await showBallHtmlElement(newBallPosition, {
      row: rowPositionToBottom(newBallPosition.row),
      column: columnPositionToLeft(newBallPosition.column)
    });
    const nextBallPosition = await getNewBallPosition(newFieldMap, newGameStatusContext, newBallPosition, {
      row: rowPositionToBottom(newBallPosition.row),
      column: columnPositionToLeft(newBallPosition.column)
    });
    await showBallHtmlElement(newBallPosition, nextBallPosition);
    return nextBallPosition;
  } else if (ballGoingToTopLeft_ && hasObjectInTopLeft()) {
    await showBallHtmlElement(newBallPosition, {
      row: rowPositionToBottom(newBallPosition.row),
      column: columnPositionToRight(newBallPosition.column)
    });
    const nextBallPosition = await getNewBallPosition(newFieldMap, newGameStatusContext, newBallPosition, {
      row: rowPositionToBottom(newBallPosition.row),
      column: columnPositionToRight(newBallPosition.column)
    });
    await showBallHtmlElement(newBallPosition, nextBallPosition);
    return nextBallPosition;
  } else if (ballGoingToTopLeft_) {
    const nextBallPosition = ({
      row: rowPositionToTop(newBallPosition.row),
      column: columnPositionToLeft(newBallPosition.column)
    });
    await showBallHtmlElement(newBallPosition, nextBallPosition);
    return nextBallPosition;
  }

  // horizontal
  if (ballGoingToTop_ && hasObjectInTop()) {
    await showBallHtmlElement(newBallPosition, {
      row: rowPositionToBottom(newBallPosition.row),
      column: newBallPosition.column
    });
    const nextBallPosition = await getNewBallPosition(newFieldMap, newGameStatusContext, newBallPosition, {
      row: rowPositionToBottom(newBallPosition.row),
      column: newBallPosition.column
    });
    await showBallHtmlElement(newBallPosition, nextBallPosition);
    return nextBallPosition;
  } else if (ballGoingToBottom_ && hasObjectInBottom()) {
    await showBallHtmlElement(newBallPosition, {
      row: rowPositionToTop(newBallPosition.row),
      column: newBallPosition.column
    });
    const nextBallPosition = await getNewBallPosition(newFieldMap, newGameStatusContext, newBallPosition, {
      row: rowPositionToTop(newBallPosition.row),
      column: newBallPosition.column
    });
    await showBallHtmlElement(newBallPosition, nextBallPosition);
    return nextBallPosition;
  } else if (ballGoingToTop_) {
    const nextBallPosition = ({
      row: rowPositionToTop(newBallPosition.row),
      column: newBallPosition.column
    });
    await showBallHtmlElement(newBallPosition, nextBallPosition);
    return nextBallPosition;
  } else if (ballGoingToBottom_) {
    const nextBallPosition = ({
      row: rowPositionToBottom(newBallPosition.row),
      column: newBallPosition.column
    });
    await showBallHtmlElement(newBallPosition, nextBallPosition);
    return nextBallPosition;
  }
  
  // vertical
  else if (ballGoingToLeft_ && hasObjectInLeft()) {
    await showBallHtmlElement(newBallPosition, {
      row: newBallPosition.row,
      column: columnPositionToRight(newBallPosition.column)
    });
    const nextBallPosition = await getNewBallPosition(newFieldMap, newGameStatusContext, newBallPosition, {
      row: newBallPosition.row,
      column: columnPositionToRight(newBallPosition.column)
    });
    await showBallHtmlElement(newBallPosition, nextBallPosition);
    return nextBallPosition;
  } else if (ballGoingToRight_ && hasObjectInRight()) {
    await showBallHtmlElement(newBallPosition, {
      row: newBallPosition.row,
      column: columnPositionToLeft(newBallPosition.column)
    });
    const nextBallPosition = await getNewBallPosition(newFieldMap, newGameStatusContext, newBallPosition, {
      row: newBallPosition.row,
      column: columnPositionToLeft(newBallPosition.column)
    });
    await showBallHtmlElement(newBallPosition, nextBallPosition);
    return nextBallPosition;
  } else if (ballGoingToLeft_) {
    const nextBallPosition = ({
      column: columnPositionToLeft(newBallPosition.column),
      row: newBallPosition.row
    });
    await showBallHtmlElement(newBallPosition, nextBallPosition);
    return nextBallPosition;
  } else if (ballGoingToRight_) {
    const nextBallPosition = ({
      column: columnPositionToRight(newBallPosition.column),
      row: newBallPosition.row
    });
    await showBallHtmlElement(newBallPosition, nextBallPosition);
    return nextBallPosition;
  }
  
  // default
  else {
    const nextBallPosition = ({
      column: newBallPosition.column,
      row: newBallPosition.row
    });
    await showBallHtmlElement(newBallPosition, nextBallPosition);
    return nextBallPosition;
  }
}

const refreshGame = async (currentFieldMap, newFieldMap, currentGameStatus, newGameStatus) => {
  log(refreshGame.name);

  let newFieldMapContext = newFieldMap;
  let newGameStatusContext = newGameStatus;

  // update ball position
  if (
    currentFieldMap.ball.column != newFieldMap.ball.column ||
    currentFieldMap.ball.row != newFieldMap.ball.row
  ) {
    log('update ball position...');

    newFieldMapContext.ball = await getNewBallPosition(
      newFieldMap,
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