import * as _ from 'lodash';
import { forwardRef, memo, ReactNode, useCallback, useMemo } from 'react';
import { EVENT_MAP, EVENT_PREFIX } from '../constants/event';
import { useComponentInfo, WxmlElementVNode } from '../context/component';

/**
 * 负责渲染单个 wxml 实体节点
 */
export const WxmlElement = memo(
  forwardRef<
    Element,
    {
      node: WxmlElementVNode;
      children: ReactNode;
    }
  >(({ node, children }, ref) => {
    const componentInfo = useComponentInfo();
    const Tag = node.tag as any;

    const className = useMemo(() => {
      const className = node.attr?.class;
      if (!className) {
        return;
      }
      if (!componentInfo?.scopeId) {
        return className;
      }
      return `${className} ${className
        .split(/\s+/g)
        .map((className) => componentInfo.scopeId + className)
        .join(' ')}`;
    }, [componentInfo?.scopeId, node.attr?.class]);

    const style = useMemo(() => {
      if (!node.attr?.style) {
        return;
      }
      const result: Record<string, string> = {};
      for (const item of node.attr.style.split(';')) {
        const [name, value] = item.split(':');
        result[name.trim().replace(/-\w/g, (match) => match[1].toUpperCase())] =
          value;
      }
      return result;
    }, [node.attr?.style]);

    const createEventHandler = useCallback(
      (prefix: string, handlerName: string) => (event: Event) => {
        if (prefix.includes('catch')) {
          event.stopPropagation();
        }
        if (typeof handlerName === 'string') {
          componentInfo?.handleEvent(handlerName, node, event);
        }
      },
      [componentInfo, node]
    );

    const eventHandlers = useMemo(() => {
      if (!node.attr) {
        return;
      }
      return _.fromPairs(
        Object.keys(node.attr).flatMap((key) => {
          const prefix = EVENT_PREFIX.find((prefix) => key.startsWith(prefix));
          if (!prefix) {
            return [];
          }
          const eventName = key.slice(prefix.length);
          if (!EVENT_MAP.has(eventName)) {
            return [];
          }
          const postfix = prefix.startsWith('capture-') ? 'Capture' : '';
          return [
            [
              EVENT_MAP.get(eventName)! + postfix,
              createEventHandler(prefix, node.attr![key]),
            ],
          ];
        })
      );
    }, [createEventHandler, node.attr]);

    return (
      <Tag
        ref={ref}
        {...node.attr}
        class={className}
        style={style}
        {...eventHandlers}
      >
        {children}
      </Tag>
    );
  })
);
