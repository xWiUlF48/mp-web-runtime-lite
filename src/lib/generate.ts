export function generateWxml(node: any): string {
  if (node.branches) {
    return Object.values(node.branches)
      .map((branch: any, index) => {
        if (!index) {
          return `<block wx:if="${generateWxml(branch.test)}">${branch.children
            .map(generateWxml)
            .join('')}</block>`;
        }
        if (branch.test) {
          return `<block wx:elif="${generateWxml(
            branch.test
          )}">${branch.children.map(generateWxml).join('')}</block>`;
        }
        return `<block wx:else>${branch.children
          .map(generateWxml)
          .join('')}</block>`;
      })
      .join('');
  }
  if (node.type === 'element') {
    const attrs = Object.keys(node.attrs)
      .map((key) => {
        if (node.attrs[key] === true) {
          return key;
        }
        return `${key}="${node.attrs[key]}"`;
      })
      .join(' ');
    if (!node.children.length) {
      return `<${node.tag} ${attrs} />`;
    }
    return `<${node.tag} ${attrs}>${node.children
      .map(generateWxml)
      .join('')}</${node.tag}>`;
  }
  if (node.type === 'value') {
    return node.ops;
  }
  if (node.type === 'template') {
    return `<template is="${node.template.index}" name="${node.template.name.ops}" />`;
  }
  if (node.type === 'include') {
    return `<include src="${node.index}" />`;
  }
  throw new Error(`Unknown node type '${node.type}'`);
}
