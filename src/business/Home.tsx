import { memo, useMemo } from 'react';
import { Component } from '../components/Component';
import { CustomComponentProps } from '../context/component';

export const Home = memo<CustomComponentProps>(({ node }) => {
  const data = useMemo(
    () => ({
      // 根据 node.attr 自定义 data
    }),
    []
  );

  // 修改 path 指定 wxml、wxss
  // 通过 data、slots、handleEvent 实现组件 js 逻辑
  return <Component path="components/home/index" node={node} data={data} />;
});
