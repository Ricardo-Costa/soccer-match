import { startGame, refreshGame } from './global.js';
import {
  FIELD_COLUMN_MAX_LIMIT,
  FIELD_ROW_MAX_LIMIT,
  LOG_LEVEL
} from './configs.js';

document.addEventListener("DOMContentLoaded", async () => {

  window['log_level'] = LOG_LEVEL;

  let gameState = {
    players: [
      { position: { column: 3, row: 6 }, name: 'Thiago Silva', team: 'red' },
      { position: { column: 4, row: 3 }, name: 'Sergio Ramos', team: 'red' },
      { position: { column: 10, row: 2 }, name: 'Hulk', team: 'red' },
      { position: { column: 6, row: 9 }, name: 'Adriano', team: 'red' },
      { position: { column: 6, row: 6 }, name: 'Ibrahimović', team: 'red' },
      { position: { column: 18, row: 9 }, name: 'Didier Drogba', team: 'red' },
      { position: { column: 8, row: 6 }, name: 'Pelé', team: 'blue' },
      { position: { column: 8, row: 3 }, name: 'Cristiano Ronaldo', team: 'blue' },
      { position: { column: 9, row: 9 }, name: 'Messi', team: 'blue' },
      { position: { column: 12, row: 3 }, name: 'Neymar', team: 'blue' },
      { position: { column: 14, row: 7 }, name: 'Ronaldinho', team: 'blue' },
      { position: { column: 17, row: 6 }, name: 'Ronaldo', team: 'blue' }
    ]
  };

  let fieldMaps = {
    columns: FIELD_COLUMN_MAX_LIMIT,
    rows: FIELD_ROW_MAX_LIMIT,
    goalLeft: [
      { column: 1, row: 4 },
      { column: 1, row: 5 },
      { column: 1, row: 6 },
      { column: 1, row: 7 }
    ],
    goalRight: [
      { column: 20, row: 4 },
      { column: 20, row: 5 },
      { column: 20, row: 6 },
      { column: 20, row: 7 }
    ],
    ball: { column: 16, row: 6 }
  };

  startGame(fieldMaps, gameState);

  let newFieldMap = { ...fieldMaps, ball: { column: 17, row: 5 } }, newGameStatus = { ...gameState };

  while(true) {
    const result = await refreshGame(
      { ...fieldMaps },
      { ...newFieldMap },
      { ...gameState },
      { ...newGameStatus }
    );
    fieldMaps = { ...newFieldMap };
    gameState = { ...newGameStatus };
    newFieldMap = { ...result.newFieldMap };
    newGameStatus = { ...result.newGameStatus };
  }

  // setInterval(async () => {
  //   const result = await refreshGame(
  //     { ...fieldMaps },
  //     { ...newFieldMap },
  //     { ...gameState },
  //     { ...newGameStatus }
  //   );
  //   fieldMaps = { ...newFieldMap };
  //   gameState = { ...newGameStatus };
  //   newFieldMap = { ...result.newFieldMap };
  //   newGameStatus = { ...result.newGameStatus };
  // }, RENDER_INTERVAL);
});