import BallModel from './BallModel.js';
import PositionModel from './PositionModel.js';

export default class FieldMapsModel {
  /**
   * @param {number} columns 
   * @param {number} rows 
   * @param {PositionModel[]} goalLeft 
   * @param {PositionModel[]} goalRight 
   * @param {BallModel} ball 
   */
  constructor(columns, rows, goalLeft, goalRight, ball) {
    if (
      !columns || isNaN(columns) ||
      !rows || isNaN(columns) ||
      !(goalLeft instanceof Array) ||
      (goalLeft.length != 4) ||
      !(goalRight instanceof Array) ||
      (goalRight.length != 4) ||
      !(ball instanceof BallModel)
    ) {
      throw Error(`Invalid params at ${FieldMapsModel.name}`);
    }

    this.columns = columns;
    this.rows = rows;
    this.goalLeft = goalLeft;
    this.goalRight = goalRight;
    this.ball = ball;
  }
}