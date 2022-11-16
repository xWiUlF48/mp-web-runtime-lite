import { FC } from 'react';
import { Image } from '../business/Image';
import { CustomComponentProps } from '../context/component';

/**
 * 小程序路径 => React 组件
 */
export const path2ComponentMap = new Map<string, FC<CustomComponentProps>>([
  //
]);

/**
 * Tag Name => React 组件
 */
export const builtinComponentMap: Record<string, FC<CustomComponentProps>> = {
  'wx-image': Image,
};
