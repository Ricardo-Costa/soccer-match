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
const columnPositionToLeft = (column) => {
  // if (column - 1 < FIELD_COLUMN_MIN_LIMIT) return column;
  return (column - 1);
};

/**
 * @param {number} column 
 * @param {boolean} skip 
 * @returns {number}
 */
const columnPositionToRight = (column) => {
  // if (column + 1 > FIELD_COLUMN_MAX_LIMIT) return column;
  return (column + 1);
};

/**
 * @param {number} column 
 * @param {boolean} skip 
 * @returns {number}
 */
const rowPositionToTop = (row) => {
  // if (row - 1 < FIELD_ROW_MIN_LIMIT) return row;
  return (row - 1);
};

/**
 * @param {number} column 
 * @param {boolean} skip 
 * @returns {number}
 */
const rowPositionToBottom = (row) => {
  // if (row + 1 > FIELD_ROW_MAX_LIMIT) return row;
  return (row + 1);
};

/**
 * Predict the new position that the ball will go.
 * 
 * @param {PositionModel} currentBallPosition 
 * 
 * @returns {PositionModel}
 */
const predictNewBallPosition = (currentBallPosition) => {

  if (
    currentBallPosition.row < FIELD_ROW_MIN_LIMIT ||
    currentBallPosition.row > FIELD_ROW_MAX_LIMIT ||
    currentBallPosition.column < FIELD_COLUMN_MIN_LIMIT ||
    currentBallPosition.column > FIELD_COLUMN_MAX_LIMIT
  ) {
    // no should to change current position
    return currentBallPosition;
  }

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

window['treatNewBallPositionMethodCounter'] = 0;

/**
 * Treat new position of the ball based on it's actions.
 * 
 * @param {FieldMapsModel} fieldMaps 
 * @param {GameStateModel} gameState
 * @param {PositionModel} currentBallPosition
 * @param {PositionModel} newBallPosition
 * 
 * @returns {Promise<{PositionModel}>}
 */
const treatNewBallPosition = async (fieldMaps, gameState, currentBallPosition, newBallPosition) => {
  log(treatNewBallPosition.name);


  window['treatNewBallPositionMethodCounter']++;
  if (window['treatNewBallPositionMethodCounter'] >= MAX_ACCEPTED_RECURSIVE_CALLS) {
    throw Error('Max recursive calls stack for this method...');
  }

  const fieldLimitInTop = newBallPosition.row < FIELD_ROW_MIN_LIMIT;
  const fieldLimitInBottom = newBallPosition.row > FIELD_ROW_MAX_LIMIT;
  const fieldLimitInLeft = newBallPosition.column < FIELD_COLUMN_MIN_LIMIT;
  const fieldLimitInRight = newBallPosition.column > FIELD_COLUMN_MAX_LIMIT;

  const ballGoingToTop_ = newBallPosition.action.length === 1 && newBallPosition.action.includes(ACTION_TOP);
  const ballGoingToBottom_ = newBallPosition.action.length === 1 && newBallPosition.action.includes(ACTION_BOTTOM);
  const ballGoingToLeft_ = newBallPosition.action.length === 1 && newBallPosition.action.includes(ACTION_LEFT);
  const ballGoingToRight_ = newBallPosition.action.length === 1 && newBallPosition.action.includes(ACTION_RIGHT);
  const ballGoingToTopLeft_ = newBallPosition.action.length === 2 && newBallPosition.action.includes(ACTION_TOP) && newBallPosition.action.includes(ACTION_LEFT);
  const ballGoingToTopRight_ = newBallPosition.action.length === 2 && newBallPosition.action.includes(ACTION_TOP) && newBallPosition.action.includes(ACTION_RIGHT);
  const ballGoingToBottomLeft_ = newBallPosition.action.length === 2 && newBallPosition.action.includes(ACTION_BOTTOM) && newBallPosition.action.includes(ACTION_LEFT);
  const ballGoingToBottomRight_ = newBallPosition.action.length === 2 && newBallPosition.action.includes(ACTION_BOTTOM) && newBallPosition.action.includes(ACTION_RIGHT);

  const hasPlayer_ = hasPlayer(gameState, newBallPosition.column, newBallPosition.row);

  const hasObjectInLeft = () => (fieldLimitInLeft || hasPlayer(gameState, columnPositionToLeft(currentBallPosition.column), currentBallPosition.row));
  const hasObjectInTopLeft = () => ((fieldLimitInTop && fieldLimitInLeft) || hasPlayer_);
  const hasObjectInTop = () => (fieldLimitInTop || hasPlayer(gameState, currentBallPosition.column, rowPositionToTop(currentBallPosition.row)));
  const hasObjectInTopRight = () => ((fieldLimitInTop && fieldLimitInRight) || hasPlayer_);
  const hasObjectInRight = () => (fieldLimitInRight || hasPlayer(gameState, columnPositionToRight(currentBallPosition.column), currentBallPosition.row));
  const hasObjectInBottomLeft = () => ((fieldLimitInBottom && fieldLimitInLeft)) || hasPlayer_;
  const hasObjectInBottom = () => (fieldLimitInBottom || hasPlayer(gameState, currentBallPosition.column, rowPositionToBottom(currentBallPosition.row)));
  const hasObjectInBottomRight = () => ((fieldLimitInBottom && fieldLimitInRight) || hasPlayer_);

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

    // await sleep(parseInt(RENDER_INTERVAL / 2));

    addToHtmlClasses(
      targetEl.className,
      'field-block-ball',
      targetEl
    );

    await sleep(parseInt(RENDER_INTERVAL / 2));
  }

  const prepareReturn = async (fieldMaps, gameState, currentBallPosition, position) => {
    const nextBallPosition = await treatNewBallPosition(fieldMaps, gameState,  currentBallPosition, position);
    await showBallHtmlElement(currentBallPosition, nextBallPosition);
    return nextBallPosition;
  }

  if (
    ((ballGoingToTopRight_ && !hasObjectInTopRight()) &&
    (ballGoingToTopRight_ && !hasObjectInRight()) &&
    (ballGoingToTopRight_ && !hasObjectInTop())) ||
    ((ballGoingToTopLeft_ && !hasObjectInTopLeft()) &&
    (ballGoingToTopLeft_ && !hasObjectInLeft()) &&
    (ballGoingToTopLeft_ && !hasObjectInTop())) ||
    ((ballGoingToBottomRight_ && !hasObjectInBottomRight()) &&
    (ballGoingToBottomRight_ && !hasObjectInBottom()) &&
    (ballGoingToBottomRight_ && !hasObjectInRight())) ||
    ((ballGoingToBottomLeft_ && !hasObjectInBottomLeft()) &&
    (ballGoingToBottomLeft_ && !hasObjectInLeft()) &&
    (ballGoingToBottomLeft_ && !hasObjectInBottom())) ||
    (ballGoingToBottom_ && !hasObjectInBottom()) ||
    (ballGoingToTop_ && !hasObjectInTop()) ||
    (ballGoingToLeft_ && !hasObjectInLeft()) ||
    (ballGoingToRight_ && !hasObjectInRight())
  ) {
    await showBallHtmlElement(currentBallPosition, newBallPosition);
    return newBallPosition;
  }

  else if (ballGoingToTopRight_ && hasObjectInTop()) {
    let position = new PositionModel(
      columnPositionToRight(currentBallPosition.column),
      rowPositionToBottom(currentBallPosition.row),
      [ ACTION_BOTTOM, ACTION_RIGHT ]
    );
    return await prepareReturn(fieldMaps, gameState, currentBallPosition, position);
  }

  else if (ballGoingToTopLeft_ && hasObjectInTop()) {
    let position = new PositionModel(
      columnPositionToLeft(currentBallPosition.column),
      rowPositionToBottom(currentBallPosition.row),
      [ ACTION_BOTTOM, ACTION_LEFT ]
    );
    return await prepareReturn(fieldMaps, gameState, currentBallPosition, position);
  }

  else if (ballGoingToTop_ && hasObjectInTop()) {
    let position = new PositionModel(
      currentBallPosition.column,
      rowPositionToBottom(currentBallPosition.row),
      [ ACTION_BOTTOM ]
    );
    return await prepareReturn(fieldMaps, gameState, currentBallPosition, position);
  }

  else if (ballGoingToBottom_ && hasObjectInBottom()) {
    let position = new PositionModel(
      currentBallPosition.column,
      rowPositionToTop(currentBallPosition.row),
      [ ACTION_TOP ]
    );
    return await prepareReturn(fieldMaps, gameState, currentBallPosition, position);
  }

  else if (ballGoingToBottomRight_ && hasObjectInBottom()) {
    let position = new PositionModel(
      columnPositionToRight(currentBallPosition.column),
      rowPositionToTop(currentBallPosition.row),
      [ ACTION_TOP, ACTION_RIGHT ]
    );
    return await prepareReturn(fieldMaps, gameState, currentBallPosition, position);
  }

  else if (ballGoingToBottomLeft_ && hasObjectInBottom()) {
    let position = new PositionModel(
      columnPositionToLeft(currentBallPosition.column),
      rowPositionToTop(currentBallPosition.row),
      [ ACTION_TOP, ACTION_LEFT ]
    );
    return await prepareReturn(fieldMaps, gameState, currentBallPosition, position);
  }

  else if (ballGoingToTopLeft_ && hasObjectInLeft()) {
    let position = new PositionModel(
      columnPositionToRight(currentBallPosition.column),
      rowPositionToTop(currentBallPosition.row),
      [ ACTION_TOP, ACTION_RIGHT ]
    );
    return await prepareReturn(fieldMaps, gameState, currentBallPosition, position);
  }

  else if (ballGoingToBottomLeft_ && hasObjectInLeft()) {
    let position = new PositionModel(
      columnPositionToRight(currentBallPosition.column),
      rowPositionToBottom(currentBallPosition.row),
      [ ACTION_BOTTOM, ACTION_RIGHT ]
    );
    return await prepareReturn(fieldMaps, gameState, currentBallPosition, position);
  }

  else if (ballGoingToLeft_ && hasObjectInLeft()) {
    let position = new PositionModel(
      columnPositionToRight(currentBallPosition.column),
      currentBallPosition.row,
      [ ACTION_RIGHT ]
    );
    return await prepareReturn(fieldMaps, gameState, currentBallPosition, position);
  }

  else if (ballGoingToRight_ && hasObjectInRight()) {
    let position = new PositionModel(
      columnPositionToLeft(currentBallPosition.column),
      currentBallPosition.row,
      [ ACTION_LEFT ]
    );
    return await prepareReturn(fieldMaps, gameState, currentBallPosition, position);
  }

  else if (ballGoingToTopRight_ && hasObjectInRight()) {
    let position = new PositionModel(
      columnPositionToLeft(currentBallPosition.column),
      rowPositionToTop(currentBallPosition.row),
      [ ACTION_TOP, ACTION_LEFT ]
    );
    return await prepareReturn(fieldMaps, gameState, currentBallPosition, position);
  }

  else if (ballGoingToBottomRight_ && hasObjectInRight()) {
    let position = new PositionModel(
      columnPositionToLeft(currentBallPosition.column),
      rowPositionToBottom(currentBallPosition.row),
      [ ACTION_BOTTOM, ACTION_LEFT ]
    );
    return await prepareReturn(fieldMaps, gameState, currentBallPosition, position);
  }








  
  else if (ballGoingToBottomLeft_ && hasObjectInBottomLeft()) {
    let position = new PositionModel(
      columnPositionToRight(currentBallPosition.column),
      rowPositionToTop(currentBallPosition.row),
      [ ACTION_TOP, ACTION_RIGHT ]
    );
    return await prepareReturn(fieldMaps, gameState, currentBallPosition, position);
  }

  else if (ballGoingToBottomRight_ && hasObjectInBottomRight()) {
    let position = new PositionModel(
      columnPositionToLeft(currentBallPosition.column),
      rowPositionToTop(currentBallPosition.row),
      [ ACTION_TOP, ACTION_LEFT ]
    );
    return await prepareReturn(fieldMaps, gameState, currentBallPosition, position);
  }

  else if (ballGoingToTopLeft_ && hasObjectInTopLeft()) {
    let position = new PositionModel(
      columnPositionToRight(currentBallPosition.column),
      rowPositionToBottom(currentBallPosition.row),
      [ ACTION_BOTTOM, ACTION_RIGHT ]
    );
    return await prepareReturn(fieldMaps, gameState, currentBallPosition, position);
  }

  else if (ballGoingToTopRight_ && hasObjectInTopRight()) {
    let position = new PositionModel(
      columnPositionToLeft(currentBallPosition.column),
      rowPositionToBottom(currentBallPosition.row),
      [ ACTION_BOTTOM, ACTION_LEFT ]
    );
    return await prepareReturn(fieldMaps, gameState, currentBallPosition, position);
  }

  return newBallPosition;
}

export {
  predictNewBallPosition,
  treatNewBallPosition
}