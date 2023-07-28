export default class PositionModel {
  /**
   * @param {number} column 
   * @param {number} row 
   * @param {string[]} action = ONE => "stopped" OR TWO => ( "top" | "left" | "bottom" | "right" )
   */
  constructor(column, row, action = []) {
    if (
      isNaN(column) ||
      isNaN(row) ||
      !(action instanceof Array) ||
      !action.length
    ) {
      throw Error(`Invalid params at ${PositionModel.name}`);
    }

    this.column = column;
    this.row = row;
    this.action = action;
  }
}