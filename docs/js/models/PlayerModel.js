import PositionModel from './PositionModel.js';
import { TEAMS } from './../configs.js';

export default class PlayerModel {
  /**
   * @param {string} name 
   * @param {PositionModel} position 
   * @param {("red"|"blue")} team 
   */
  constructor(name, position, team) {
    if (
      !name ||
      !(position instanceof PositionModel) ||
      !(team.includes(TEAMS.RED) || team.includes(TEAMS.BLUE))
    ) {
      throw Error(`Invalid params at ${PlayerModel.name}`);
    }

    this.name = name;
    this.position = position;
    this.team = team;
  }

}