import { createContext, FC, ReactNode, useContext } from 'react';

export type WxmlVNode = WxmlElementVNode | string;

export interface WxmlElementVNode {
  tag: string;
  attr?: Record<string, string>;
  children: WxmlVNode[];
}

export type CustomComponentTriggerEventFn = (
  name: string,
  detail: unknown
) => void;

export interface CustomComponentProps {
  node: WxmlElementVNode;
  triggerEvent?: CustomComponentTriggerEventFn;
}

export type ComponentEventHandler = (
  handlerName: string,
  node: WxmlElementVNode,
  detail: unknown
) => void;

export interface ComponentInfo {
  scopeId: string;
  node: WxmlElementVNode;
  parent?: ComponentInfo;
  slots?: Record<string, ReactNode>;
  usingComponents?: Record<string, FC<CustomComponentProps>>;
  handleEvent: ComponentEventHandler;
}

const ComponentInoContext = createContext<ComponentInfo | undefined>(undefined);

export const ComponentInfoProvider = ComponentInoContext.Provider;

export function useComponentInfo() {
  return useContext(ComponentInoContext);
}
