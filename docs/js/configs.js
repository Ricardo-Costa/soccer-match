const RENDER_INTERVAL = 100; // ms

const LOG_LEVEL = 'none';// none|debug

const MAX_ACCEPTED_RECURSIVE_CALLS = 10;

const TEAMS = {
  RED: 'red',
  BLUE: 'blue'
}

const FIELD_COLUMN_MIN_LIMIT = 1;
const FIELD_COLUMN_MAX_LIMIT = 20;
const FIELD_ROW_MIN_LIMIT = 1;
const FIELD_ROW_MAX_LIMIT = 10;

const ACTION_STOPPED = 'stopped';
const ACTION_TOP = 'top';
const ACTION_RIGHT = 'right';
const ACTION_LEFT = 'left';
const ACTION_BOTTOM = 'bottom';

export {
  RENDER_INTERVAL,

  LOG_LEVEL,

  MAX_ACCEPTED_RECURSIVE_CALLS,

  TEAMS,

  FIELD_COLUMN_MIN_LIMIT,
  FIELD_COLUMN_MAX_LIMIT,
  FIELD_ROW_MIN_LIMIT,
  FIELD_ROW_MAX_LIMIT,

  ACTION_STOPPED,
  ACTION_TOP,
  ACTION_RIGHT,
  ACTION_LEFT,
  ACTION_BOTTOM,
};