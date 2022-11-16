import * as _ from 'lodash';
import {
  FC,
  forwardRef,
  memo,
  ReactNode,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import { win } from '../lib/window';
import { VNodeList } from './VNode';
import { builtinComponentMap, path2ComponentMap } from '../constants/component';
import {
  ComponentInfoProvider,
  ComponentInfo,
  CustomComponentProps,
  ComponentEventHandler,
  useComponentInfo,
  WxmlElementVNode,
} from '../context/component';
import { WxmlElement } from './Element';

export interface ComponentProps {
  path: string;
  node: WxmlElementVNode;
  data?: Record<string, unknown>;
  slots?: Record<string, ReactNode>;
  handleEvent?: ComponentEventHandler;
}

export const Component = memo(
  forwardRef<HTMLElement, ComponentProps>(
    ({ path, node, data, slots, handleEvent }, ref) => {
      const id = useId();
      const scopeId = useMemo(() => `v-${id.replace(/\W/g, '_')}`, [id]);

      const render = useCallback(() => {
        const renderFn = win.__wxAppCode__[`${path}.wxml`];
        return renderFn({ ...node.attr, ...data });
      }, [node.attr, path, data]);

      const [vnode, setVNode] = useState<WxmlElementVNode>(render);

      useEffect(() => {
        setVNode(render());
      }, [render]);

      useLayoutEffect(() => {
        win.__wxAppCode__[`${path}.wxss`](scopeId);
        const styleEl = [...document.getElementsByTagName(`style`)]
          .filter((el) => el.getAttribute('wxss:path') === `./${path}.wxss`)
          .pop();
        return () => {
          styleEl?.parentNode?.removeChild(styleEl);
        };
      }, [path, scopeId]);

      const usingComponents = useUsingComponentsMap(path);
      const parent = useComponentInfo();

      const nodeSlots = useMemo(
        () =>
          _.mapValues(
            _.groupBy(node.children, (node) =>
              typeof node === 'string' ? '' : node.attr?.slot || ''
            ),
            (list) => <VNodeList list={list} />
          ),
        [node.children]
      );

      const componentInfo = useMemo<ComponentInfo>(
        () => ({
          scopeId,
          node,
          parent,
          slots: {
            ...nodeSlots,
            ...slots,
          },
          usingComponents: {
            ...builtinComponentMap,
            ...usingComponents,
          },
          handleEvent: handleEvent || _.noop,
        }),
        [handleEvent, node, nodeSlots, parent, scopeId, slots, usingComponents]
      );

      return (
        <ComponentInfoProvider value={componentInfo}>
          <WxmlElement ref={ref} node={node}>
            <VNodeList list={vnode.children} />
          </WxmlElement>
        </ComponentInfoProvider>
      );
    }
  )
);

const componentCache = new Map<string, FC<CustomComponentProps>>();

function useUsingComponentsMap(path: string) {
  return useMemo(
    () =>
      _.fromPairs(
        _.map(
          win.__wxAppCode__[`${path}.json`].usingComponents,
          (value, key): [string, FC<CustomComponentProps>] => {
            const name = `wx-${key}`;
            const { pathname } = new URL(
              value,
              new URL(path, 'https://example.com')
            );
            const comPath = pathname.slice(1);
            if (path2ComponentMap.has(comPath)) {
              return [name, path2ComponentMap.get(comPath)!];
            }
            if (!componentCache.has(comPath)) {
              componentCache.set(comPath, ({ node }: CustomComponentProps) => (
                <Component path={comPath} node={node} />
              ));
            }
            return [name, componentCache.get(comPath)!];
          }
        )
      ),
    [path]
  );
}
