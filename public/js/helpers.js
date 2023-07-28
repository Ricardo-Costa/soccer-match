import { LOG_LEVEL } from './configs.js';

const log = function () {
  if (window['log_level'] == 'debug') console.log(...arguments);
}

const addToField = (htmlContent) => {
  let currentContent = document.getElementById('field').innerHTML;
  document.getElementById('field').innerHTML = (currentContent + htmlContent);
}

const clearField = () => {
  log(clearField.name);

  document.getElementById('field').innerHTML = '';
}

const formatBlockID = (column, row) => (`c${column}-r${row}`);

const hasPlayer = (gameState, column, row) => {
  return gameState.players.map(player => formatBlockID(player.position.column, player.position.row))
    .includes(formatBlockID(column, row));
}

const isGoalBlock = (fieldMaps, column, row) => {
  return (fieldMaps.goalLeft.map(block => formatBlockID(block.column, block.row)).includes(formatBlockID(column, row)) ||
    fieldMaps.goalRight.map(block => formatBlockID(block.column, block.row)).includes(formatBlockID(column, row)));
}

const isBallBlock = (fieldMaps, column, row) => {
  return formatBlockID(fieldMaps.ball.column, fieldMaps.ball.row) == formatBlockID(column, row);
}

const removeFromHtmlClasses = (htmlClasses, targetClass, htmlEl) => {
  let classes = htmlClasses.split(" ");
  const index = classes.indexOf(targetClass);
  if (index >= 0) {
    classes.splice(index, 1);
    htmlEl.className = classes.join(" ");
  }
}

const addToHtmlClasses = (htmlClasses, targetClass, htmlEl) => {
  let classes = htmlClasses.split(" ");
  classes.push(targetClass);
  htmlEl.className = classes.join(" ");
}

const hasHtmlClasses = (htmlClasses, targetClass) => {
  let classes = htmlClasses.split(" ");
  return classes.includes(targetClass);
}

const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export {
  log,
  sleep,
  addToField,
  clearField,
  formatBlockID,
  hasPlayer,
  isGoalBlock,
  isBallBlock,
  removeFromHtmlClasses,
  addToHtmlClasses,
  hasHtmlClasses
};