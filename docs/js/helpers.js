import { LOG_LEVEL } from './configs.js';
import FieldMapsModel from './models/FieldMapsModel.js';
import GameStateModel from './models/GameStateModel.js';

const log = function () {
  if (window['log_level'] == 'debug') console.log(...arguments);
}

/**
 * @param {string} htmlContent 
 */
const addToField = (htmlContent) => {
  let currentContent = document.getElementById('field').innerHTML;
  document.getElementById('field').innerHTML = (currentContent + htmlContent);
}

const clearField = () => {
  log(clearField.name);

  document.getElementById('field').innerHTML = '';
}

/**
 * Format column and row in main pattern.
 * 
 * @param {number} column 
 * @param {number} row 
 * 
 * @returns {string}
 */
const formatBlockID = (column, row) => (`c${column}-r${row}`);

/**
 * Check if exists player in that position.
 * 
 * @param {GameStateModel} gameState 
 * @param {number} column 
 * @param {number} row 
 * 
 * @returns {boolean}
 */
const hasPlayer = (gameState, column, row) => {
  return gameState.players.map(player => formatBlockID(player.position.column, player.position.row))
    .includes(formatBlockID(column, row));
}

/**
 * Check if it's a block of type goal.
 * 
 * @param {FieldMapsModel} fieldMaps 
 * @param {number} column 
 * @param {number} row 
 * 
 * @returns {boolean}
 */
const isGoalBlock = (fieldMaps, column, row) => {
  return (fieldMaps.goalLeft.map(block => formatBlockID(block.column, block.row)).includes(formatBlockID(column, row)) ||
    fieldMaps.goalRight.map(block => formatBlockID(block.column, block.row)).includes(formatBlockID(column, row)));
}

/**
 * Check if it's a block of type ball.
 * 
 * @param {FieldMapsModel} fieldMaps 
 * @param {number} column 
 * @param {number} row 
 * 
 * @returns {boolean}
 */
const isBallBlock = (fieldMaps, column, row) => {
  return formatBlockID(fieldMaps.ball.position.column, fieldMaps.ball.position.row) == formatBlockID(column, row);
}

/**
 * Remove html class from html tag element.
 * 
 * @param {string} htmlClasses 
 * @param {string} targetClass 
 * @param {HTMLElement} htmlEl 
 */
const removeFromHtmlClasses = (htmlClasses, targetClass, htmlEl) => {
  let classes = htmlClasses.split(" ");
  htmlEl.className = classes.filter(className => className != targetClass).join(" ");
}

/**
 * Add html class to html tag element.
 * 
 * @param {string} htmlClasses 
 * @param {string} targetClass 
 * @param {HTMLElement} htmlEl 
 */
const addToHtmlClasses = (htmlClasses, targetClass, htmlEl) => {
  let classes = htmlClasses.split(" ");
  classes.push(targetClass);
  htmlEl.className = classes.join(" ");
}

/**
 * Check if specific class exists in string of html classes.
 * 
 * @param {string} htmlClasses 
 * @param {string} targetClass 
 * 
 * @returns {boolean}
 */
const hasHtmlClasses = (htmlClasses, targetClass) => {
  let classes = htmlClasses.split(" ");
  return classes.includes(targetClass);
}

/**
 * sleep process for a while.
 * 
 * @param {number} ms 
 * @returns {Promise<{Function}>}
 */
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