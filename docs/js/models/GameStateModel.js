import PlayerModel from './PlayerModel.js';

export default class GameStateModel {
  /**
   * @param {PlayerModel[]} players 
   */
  constructor(players = []) {
    if (
      !(players instanceof Array) ||
      !players.length
    ) {
      throw Error(`Invalid params at ${GameStateModel.name}`);
    }

    this.players = players;
  }
}