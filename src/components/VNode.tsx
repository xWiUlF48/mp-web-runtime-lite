import { FC, memo, useCallback, useMemo } from 'react';
import { EVENT_PREFIX } from '../constants/event';
import {
  ComponentInfoProvider,
  CustomComponentTriggerEventFn,
  useComponentInfo,
  WxmlElementVNode,
  WxmlVNode,
} from '../context/component';
import { WxmlElement } from './Element';

export const VNode: FC<{ node: WxmlVNode }> = memo(({ node }) => {
  if (typeof node === 'string') {
    return <>{node}</>;
  }
  return <ElementVNode node={node} />;
});

export const VNodeList: FC<{ list: WxmlVNode[] }> = memo(({ list }) => (
  <>
    {list.map((child, index) => (
      <VNode key={index} node={child} />
    ))}
  </>
));

const ElementVNode: FC<{ node: WxmlElementVNode }> = memo(({ node }) => {
  const componentInfo = useComponentInfo()!;

  const CustomComponent = useMemo(
    () => componentInfo.usingComponents?.[node.tag],
    [componentInfo.usingComponents, node.tag]
  );

  const triggerEvent = useCallback<CustomComponentTriggerEventFn>(
    (name, detail) => {
      if (!node.attr) {
        return;
      }
      for (const prefix of EVENT_PREFIX) {
        const handlerName = node.attr[prefix + name];
        componentInfo.handleEvent(handlerName, node, detail);
      }
    },
    [componentInfo, node]
  );

  if (node.tag === 'wx-slot') {
    return <Slot node={node} />;
  }
  if (CustomComponent) {
    return <CustomComponent node={node} triggerEvent={triggerEvent} />;
  }
  return (
    <WxmlElement node={node}>
      <VNodeList list={node.children} />
    </WxmlElement>
  );
});

const Slot: FC<{ node: WxmlElementVNode }> = memo(({ node }) => {
  const componentInfo = useComponentInfo()!;
  const slotName = node.attr?.name || '';

  const content = useMemo(
    () => componentInfo.slots?.[slotName],
    [componentInfo.slots, slotName]
  );

  if (!content) {
    return null;
  }
  return (
    <ComponentInfoProvider value={componentInfo.parent}>
      {content}
    </ComponentInfoProvider>
  );
});
