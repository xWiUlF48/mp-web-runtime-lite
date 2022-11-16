export const EVENT_PREFIX = [
  'capture-bind:',
  'bind:',
  'bind',
  'capture-catch:',
  'catch:',
  'catch',
];

/**
 * 小程序事件名 => React prop 名
 */
export const EVENT_MAP = new Map<string, string>([
  ['tap', 'onClick'],
  ['touchmove', 'onTouchMove'],
]);
