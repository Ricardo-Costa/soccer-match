import {
  log,
  sleep,
  formatBlockID,
  hasPlayer,
  removeFromHtmlClasses,
  addToHtmlClasses
} from './helpers.js';
import {
  ACTION_BOTTOM,
  ACTION_LEFT,
  ACTION_RIGHT,
  ACTION_TOP,
  FIELD_COLUMN_MAX_LIMIT,
  FIELD_COLUMN_MIN_LIMIT,
  FIELD_ROW_MAX_LIMIT,
  FIELD_ROW_MIN_LIMIT,
  MAX_ACCEPTED_RECURSIVE_CALLS,
  RENDER_INTERVAL
} from './configs.js';
import FieldMapsModel from './models/FieldMapsModel.js';
import GameStateModel from './models/GameStateModel.js';
import PositionModel from './models/PositionModel.js';

/**
 * @param {number} column 
 * @param {boolean} skip 
 * @returns {number}
 */
const columnPositionToLeft = (column, skip = false) => (column - 1 - (skip ? 1 : 0 ));
/**
 * @param {number} column 
 * @param {boolean} skip 
 * @returns {number}
 */
const columnPositionToRight = (column, skip = false) => (column + 1 + (skip ? 1 : 0 ));
/**
 * @param {number} column 
 * @param {boolean} skip 
 * @returns {number}
 */
const rowPositionToTop = (row, skip = false) => (row - 1 - (skip ? 1 : 0 ));
/**
 * @param {number} column 
 * @param {boolean} skip 
 * @returns {number}
 */
const rowPositionToBottom = (row, skip = false) => (row + 1 + (skip ? 1 : 0 ));

/**
 * Predict the new position that the ball will go.
 * 
 * @param {PositionModel} currentBallPosition 
 * 
 * @returns {PositionModel}
 */
const predictNewBallPosition = (currentBallPosition) => {
  if (
    currentBallPosition.action.includes(ACTION_BOTTOM) &&
    currentBallPosition.action.includes(ACTION_RIGHT)
  ) {
    return new PositionModel(
      columnPositionToRight(currentBallPosition.column),
      rowPositionToBottom(currentBallPosition.row),
      currentBallPosition.action
    );
  } else if (
    currentBallPosition.action.includes(ACTION_BOTTOM) &&
    currentBallPosition.action.includes(ACTION_LEFT)
  ) {
    return new PositionModel(
      columnPositionToLeft(currentBallPosition.column),
      rowPositionToBottom(currentBallPosition.row),
      currentBallPosition.action
    );
  } else if (
    currentBallPosition.action.includes(ACTION_TOP) &&
    currentBallPosition.action.includes(ACTION_LEFT)
  ) {
    return new PositionModel(
      columnPositionToLeft(currentBallPosition.column),
      rowPositionToTop(currentBallPosition.row),
      currentBallPosition.action
    );
  } else if (
    currentBallPosition.action.includes(ACTION_TOP) &&
    currentBallPosition.action.includes(ACTION_RIGHT)
  ) {
    return new PositionModel(
      columnPositionToRight(currentBallPosition.column),
      rowPositionToTop(currentBallPosition.row),
      currentBallPosition.action
    );
  } else if (
    currentBallPosition.action.includes(ACTION_TOP)
  ) {
    return new PositionModel(
      currentBallPosition.column,
      rowPositionToTop(currentBallPosition.row),
      currentBallPosition.action
    );
  } else if (
    currentBallPosition.action.includes(ACTION_BOTTOM)
  ) {
    return new PositionModel(
      currentBallPosition.column,
      rowPositionToBottom(currentBallPosition.row),
      currentBallPosition.action
    );
  }

  return currentBallPosition;
}

let getNewBallPositionMethodCounter = 0;

/**
 * get new position of the ball based on its action.
 * 
 * @param {FieldMapsModel} fieldMaps 
 * @param {GameStateModel} gameState
 * @param {PositionModel} newBallPosition
 * 
 * @returns {Promise<{PositionModel}>}
 */
const getNewBallPosition = async (fieldMaps, gameState, newBallPosition) => {
  log(getNewBallPosition.name);

  getNewBallPositionMethodCounter++;
  if (getNewBallPositionMethodCounter >= MAX_ACCEPTED_RECURSIVE_CALLS) throw Error('Max recursive calls stack for this method...');

  const currentBallPosition = fieldMaps.ball.position;

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

  const hasPlayerInTop_ = hasPlayer(gameState, newBallPosition.column, rowPositionToTop(newBallPosition.row));
  const hasPlayerInBottom_ = hasPlayer(gameState, newBallPosition.column, rowPositionToBottom(newBallPosition.row));
  const hasPlayerInLeft_ = hasPlayer(gameState, columnPositionToLeft(newBallPosition.column), newBallPosition.row);
  const hasPlayerInRight_ = hasPlayer(gameState, columnPositionToRight(newBallPosition.column), newBallPosition.row);

  const hasPlayerInTopLeft_ = hasPlayer(gameState, columnPositionToLeft(newBallPosition.column), rowPositionToTop(newBallPosition.row));
  const hasPlayerInTopRight_ = hasPlayer(gameState, columnPositionToRight(newBallPosition.column), rowPositionToTop(newBallPosition.row));
  const hasPlayerInBottomLeft_ = hasPlayer(gameState, columnPositionToLeft(newBallPosition.column), rowPositionToBottom(newBallPosition.row));
  const hasPlayerInBottomRight_ = hasPlayer(gameState, columnPositionToRight(newBallPosition.column), rowPositionToBottom(newBallPosition.row));

  const hasObjectInLeft = () => (fieldLimitInLeft || hasPlayerInLeft_);
  const hasObjectInTopLeft = () => ((fieldLimitInTop && fieldLimitInLeft) || hasPlayerInTopLeft_);
  const hasObjectInTop = () => (fieldLimitInTop || hasPlayerInTop_);
  const hasObjectInTopRight = () => ((fieldLimitInTop && fieldLimitInRight) || hasPlayerInTopRight_);
  const hasObjectInRight = () => (fieldLimitInRight || hasPlayerInRight_);
  const hasObjectInBottomLeft = () => ((fieldLimitInBottom && fieldLimitInLeft) || hasPlayerInBottomLeft_);
  const hasObjectInBottom = () => (fieldLimitInBottom || hasPlayerInBottom_);
  const hasObjectInBottomRight = () => ((fieldLimitInBottom && fieldLimitInRight) || hasPlayerInBottomRight_);

  /**
   * Show in screem ball position.
   * 
   * @param {PositionModel} currentBallPosition 
   * @param {PositionModel} newBallPosition 
   * @returns 
   */
  const showBallHtmlElement = async (currentBallPosition, newBallPosition) => {
    log(showBallHtmlElement.name);

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


  if (
    ballGoingToTopRight_ ||
    (ballGoingToBottomLeft_ && hasObjectInBottomLeft()) ||
    (ballGoingToBottomRight_ && hasObjectInBottom()) ||
    (ballGoingToTopLeft_ && hasObjectInLeft())
  ) {
    let position = new PositionModel(
      columnPositionToRight(newBallPosition.column),
      rowPositionToTop(newBallPosition.row),
      [ ACTION_TOP, ACTION_RIGHT ]
    );
    await showBallHtmlElement(newBallPosition, position);
    const nextBallPosition = await getNewBallPosition(fieldMaps, gameState,  position);
    await showBallHtmlElement(newBallPosition, nextBallPosition);
    return nextBallPosition;
  }

  else if (
    ballGoingToTopLeft_ ||
    (ballGoingToTopRight_ && hasObjectInRight()) ||
    (ballGoingToBottomRight_ && hasObjectInBottomRight()) ||
    (ballGoingToBottomLeft_ && hasObjectInBottom())
  ) {
    let position = new PositionModel(
      columnPositionToLeft(newBallPosition.column),
      rowPositionToTop(newBallPosition.row),
      [ ACTION_TOP, ACTION_LEFT ]
    );
    await showBallHtmlElement(newBallPosition, position);
    const nextBallPosition = await getNewBallPosition(fieldMaps, gameState,  position);
    await showBallHtmlElement(newBallPosition, nextBallPosition);
    return nextBallPosition;
  }

  else if (
    ballGoingToBottomRight_ ||
    (ballGoingToBottomLeft_ && hasObjectInLeft()) ||
    (ballGoingToTopRight_ && hasObjectInTop()) ||
    (ballGoingToTopLeft_ && hasObjectInTopLeft())
  ) {
    let position = new PositionModel(
      columnPositionToRight(newBallPosition.column),
      rowPositionToBottom(newBallPosition.row),
      [ ACTION_BOTTOM, ACTION_RIGHT ]
    );
    await showBallHtmlElement(newBallPosition, position);
    const nextBallPosition = await getNewBallPosition(fieldMaps, gameState,  position);
    await showBallHtmlElement(newBallPosition, nextBallPosition);
    return nextBallPosition;
  }

  else if (
    ballGoingToBottomLeft_ ||
    (ballGoingToBottomRight_ && hasObjectInRight()) ||
    (ballGoingToTopRight_ && hasObjectInTopRight()) ||
    (ballGoingToTopLeft_ && hasObjectInTop())
  ) {
    let position = new PositionModel(
      columnPositionToLeft(newBallPosition.column),
      rowPositionToBottom(newBallPosition.row),
      [ ACTION_BOTTOM, ACTION_LEFT ]
    );
    await showBallHtmlElement(newBallPosition, position);
    const nextBallPosition = await getNewBallPosition(fieldMaps, gameState,  position);
    await showBallHtmlElement(newBallPosition, nextBallPosition);
    return nextBallPosition;
  }

  else if (
    ballGoingToBottom_ ||
    (ballGoingToTop_ && hasObjectInTop())
  ) {
    let position = new PositionModel(
      newBallPosition.column,
      rowPositionToBottom(newBallPosition.row),
      [ ACTION_BOTTOM ]
    );
    await showBallHtmlElement(newBallPosition, position);
    const nextBallPosition = await getNewBallPosition(fieldMaps, gameState,  position);
    await showBallHtmlElement(newBallPosition, nextBallPosition);
    return nextBallPosition;
  }

  else if (
    ballGoingToTop_ ||
    (ballGoingToBottom_ && hasObjectInBottom())
  ) {
    let position = new PositionModel(
      newBallPosition.column,
      rowPositionToTop(newBallPosition.row),
      [ ACTION_TOP ]
    );
    await showBallHtmlElement(newBallPosition, position);
    const nextBallPosition = await getNewBallPosition(fieldMaps, gameState,  position);
    await showBallHtmlElement(newBallPosition, nextBallPosition);
    return nextBallPosition;
  }

  else if (
    ballGoingToRight_ ||
    (ballGoingToLeft_ && hasObjectInLeft())
  ) {
    let position = new PositionModel(
      columnPositionToRight(newBallPosition.column),
      newBallPosition.row,
      [ ACTION_RIGHT ]
    );
    await showBallHtmlElement(newBallPosition, position);
    const nextBallPosition = await getNewBallPosition(fieldMaps, gameState,  position);
    await showBallHtmlElement(newBallPosition, nextBallPosition);
    return nextBallPosition;
  } 

  else if (
    ballGoingToLeft_ ||
    (ballGoingToRight_ && hasObjectInRight())
  ) {
    let position = new PositionModel(
      columnPositionToLeft(newBallPosition.column),
      newBallPosition.row,
      [ ACTION_LEFT ]
    );
    await showBallHtmlElement(newBallPosition, position);
    const nextBallPosition = await getNewBallPosition(fieldMaps, gameState,  position);
    await showBallHtmlElement(newBallPosition, nextBallPosition);
    return nextBallPosition;
  }

  return newBallPosition;
}

export {
  predictNewBallPosition,
  getNewBallPosition
}