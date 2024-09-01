import PlayerModel from './PlayerModel.js';
import PositionModel from './PositionModel.js';

export default class BallModel {
  /** 
   * @param {(PlayerModel|null)} whoKicked 
   * @param {PositionModel} position 
   */
  constructor(whoKicked, position) {
    if (
      (whoKicked && !(whoKicked instanceof PlayerModel)) ||
      !(position instanceof PositionModel)
    ) {
      throw Error(`Invalid params at ${BallModel.name}`);
    }

    this.whoKicked = whoKicked;
    this.position = position;
  }
}