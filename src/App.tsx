import './helpers';

import { CapsuleBtn } from './business/CapsuleBtn';
import { WxmlElementVNode } from './context/component';
import { Home } from './business/Home';

const PAGE_WXML_NODE: WxmlElementVNode = {
  tag: 'wx-page',
  children: [],
};

function App() {
  return (
    <>
      <CapsuleBtn />
      <Home node={PAGE_WXML_NODE} />
    </>
  );
}

export default App;
