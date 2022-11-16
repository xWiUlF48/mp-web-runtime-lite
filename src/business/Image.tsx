import { FC } from 'react';
import { IMAGE_MAP } from '../constants/image';
import { CustomComponentProps } from '../context/component';
import { WxmlElement } from '../components/Element';
import styles from './Image.module.less';

const OBJECT_FIT_STYLE: Record<string, string> = {
  aspectFit: 'contain',
  aspectFill: 'cover',
  center: 'scale-down',
};

export const Image: FC<CustomComponentProps> = ({ node }) => {
  if (!node.attr?.src) {
    return null;
  }
  const src = String(IMAGE_MAP.get(node.attr.src) || node.attr.src || '');
  if (!src) {
    return null;
  }
  return (
    <WxmlElement node={node}>
      <img
        className={styles.image}
        src={src}
        style={{
          objectFit: OBJECT_FIT_STYLE[node.attr.mode as string] as any,
        }}
        alt=""
      />
    </WxmlElement>
  );
};
