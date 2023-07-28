import {
  log,
  addToField,
  clearField,
  formatBlockID,
  isGoalBlock,
  isBallBlock,
  hasPlayer
} from './helpers.js';
import { ACTION_STOPPED } from './configs.js';
import FieldMapsModel from './models/FieldMapsModel.js';
import GameStateModel from './models/GameStateModel.js';
import { predictNewBallPosition, getNewBallPosition } from './actions.js';

/**
 * Start game.
 * 
 * @param {FieldMapsModel} fieldMaps 
 * @param {GameStateModel} gameState 
 */
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

/**
 * refresh game status and field.
 * 
 * @param {FieldMapsModel} fieldMaps 
 * @param {GameStateModel} gameState 
 * 
 * @returns {Promise<{ newFieldMaps: FieldMapsModel, newGameState: GameStateModel }>}
 */
const refreshGame = async (fieldMaps, gameState) => {
  log(refreshGame.name);

  let newFieldMaps = fieldMaps;
  let newGameState = gameState;

  // ball is in motion
  if (!fieldMaps.ball.position.action.includes(ACTION_STOPPED)) {
    log('update ball position...');

    const newBallPosition = predictNewBallPosition(fieldMaps.ball.position);

    newFieldMaps.ball.position = await getNewBallPosition(fieldMaps, gameState, newBallPosition); 
  }

  return {
    newFieldMaps,
    newGameState
  };
}

export { startGame, refreshGame };