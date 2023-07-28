import { startGame, refreshGame } from './global.js';
import {
  FIELD_COLUMN_MAX_LIMIT,
  FIELD_ROW_MAX_LIMIT,
  LOG_LEVEL,
  ACTION_STOPPED,
  ACTION_TOP,
  ACTION_RIGHT,
  ACTION_LEFT,
  ACTION_BOTTOM,
  TEAMS,
} from './configs.js';
import PositionModel from './models/PositionModel.js';
import PlayerModel from './models/PlayerModel.js';
import GameStateModel from './models/GameStateModel.js';
import FieldMapsModel from './models/FieldMapsModel.js';
import BallModel from './models/BallModel.js';

document.addEventListener("DOMContentLoaded", async () => {

  window['log_level'] = LOG_LEVEL;

  let gameState = new GameStateModel([
    new PlayerModel('Thiago Silva', new PositionModel(3, 6, [ACTION_STOPPED]), TEAMS.RED),
    new PlayerModel('Sergio Ramos', new PositionModel(4, 3, [ACTION_STOPPED]), TEAMS.RED),
    new PlayerModel('Hulk', new PositionModel(10, 2, [ACTION_STOPPED]), TEAMS.RED),
    new PlayerModel('Adriano', new PositionModel(6, 9, [ACTION_STOPPED]), TEAMS.RED),
    new PlayerModel('Ibrahimović', new PositionModel(6, 6, [ACTION_STOPPED]), TEAMS.RED),
    new PlayerModel('Didier Drogba', new PositionModel(18, 9, [ACTION_STOPPED]), TEAMS.RED),
    new PlayerModel('Pelé', new PositionModel(8, 6, [ACTION_STOPPED]), TEAMS.BLUE),
    new PlayerModel('Cristiano Ronaldo', new PositionModel(8, 3, [ACTION_STOPPED]), TEAMS.BLUE),
    new PlayerModel('Messi', new PositionModel(9, 9, [ACTION_STOPPED]), TEAMS.BLUE),
    new PlayerModel('Neymar', new PositionModel(12, 3, [ACTION_STOPPED]), TEAMS.BLUE),
    new PlayerModel('Ronaldinho', new PositionModel(14, 7, [ACTION_STOPPED]), TEAMS.BLUE),
    new PlayerModel('Ronaldo', new PositionModel(17, 6, [ACTION_STOPPED]), TEAMS.BLUE),
  ]);

  let fieldMaps = new FieldMapsModel(
    FIELD_COLUMN_MAX_LIMIT,
    FIELD_ROW_MAX_LIMIT, [
      new PositionModel(1, 4, [ACTION_STOPPED]),
      new PositionModel(1, 5, [ACTION_STOPPED]),
      new PositionModel(1, 6, [ACTION_STOPPED]),
      new PositionModel(1, 7, [ACTION_STOPPED])
    ], [
      new PositionModel(20, 4, [ACTION_STOPPED]),
      new PositionModel(20, 5, [ACTION_STOPPED]),
      new PositionModel(20, 6, [ACTION_STOPPED]),
      new PositionModel(20, 7, [ACTION_STOPPED])
    ],
    new BallModel(
      null,
      new PositionModel(16, 6, [ACTION_STOPPED])
    )
  );

  startGame(fieldMaps, gameState);

  let TEMP_COUNTER = 10;
  while(TEMP_COUNTER) {

    // TODO movimentação da bola
    fieldMaps.ball.whoKicked = gameState.players[4];
    fieldMaps.ball.position.action = [ ACTION_TOP, ACTION_RIGHT ];

    const { newFieldMaps, newGameState } = await refreshGame(fieldMaps, gameState);
    gameState = newGameState;
    fieldMaps = newFieldMaps;

    TEMP_COUNTER--;
  }
});