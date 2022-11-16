import { win } from './lib/window';
import { transformToWxml } from './lib/transform';

win.$gwx('', win.__WXML_GLOBAL__);
win.$gwx0('', win.__WXML_GLOBAL__);

win.getComponent = (path: string, sub?: string) => {
  if (sub) {
    return getWxml(path, sub);
  }
  const wxml = getWxml(path);
  const wxss = getWxss(path);
  const script = getScript(path);

  return `<template>\n${wxml}\n</template>\n\n<script>\n${script}\n</script>\n\n<style>\n${wxss}\n</style>`;
};

function getWxml(path: string, sub?: string) {
  win.__wxAppCode__[`${path}.wxml`]();
  const wxmlPath = `./${path}.wxml`;
  if (sub) {
    return transformToWxml(String(win.__WXML_GLOBAL__.defines[wxmlPath][sub]));
  }
  return transformToWxml(String(win.__WXML_GLOBAL__.entrys[wxmlPath].f));
}

function getWxss(path: string) {
  win.__wxAppCode__[`${path}.wxss`]('fake-wxss-prefix');
  const styleEl = [...document.getElementsByTagName(`style`)]
    .filter((el) => el.getAttribute('wxss:path') === `./${path}.wxss`)
    .pop();
  styleEl?.parentNode?.removeChild(styleEl);
  return [...(styleEl?.sheet?.cssRules || [])]
    .map((rule) => rule.cssText)
    .join('\n')
    .replaceAll('fake-wxss-prefix-', '');
}

function getScript(path: string) {
  const index = Number(
    win.__WXML_GLOBAL__.entrys[`./${path}.wxml`].f.name.slice(1)
  );
  return `/* ${index} - ${path} */\n(${win.factoryMap.get(`/${path}.js`)})()`;
}
