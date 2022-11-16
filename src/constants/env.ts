const style = getComputedStyle(document.documentElement);

export const CAPSULE_BTN_MARGIN = 6;

export const CAPSULE_BTN_HEIGHT = 32;

export const SAFE_AREA_INSET_TOP = parseInt(style.getPropertyValue('--sat'));

export const STATUS_BAR_HEIGHT = SAFE_AREA_INSET_TOP;

export const isIOS =
  [
    'iPad Simulator',
    'iPhone Simulator',
    'iPod Simulator',
    'iPad',
    'iPhone',
    'iPod',
  ].includes(navigator.platform) ||
  // iPad on iOS 13 detection
  (navigator.userAgent.includes('Mac') && 'ontouchend' in document);

export const isAndroid = !isIOS;
