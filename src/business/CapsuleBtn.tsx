import classnames from 'classnames';
import { memo } from 'react';

import styles from './CapsuleBtn.module.less';

export const CapsuleBtn = memo(() => (
  <div className={classnames(styles.capsule, styles.dark)}>
    <svg
      className={styles.menuIcon}
      viewBox="0 0 64 28"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="32" cy="14" r="9.5"></circle>
      <circle cx="54" cy="14" r="6"></circle>
      <circle cx="10" cy="14" r="6"></circle>
    </svg>
    <div className={styles.splitter}></div>
    <svg
      className={styles.exitIcon}
      viewBox="0 0 60 60"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="30" cy="30" r="9"></circle>
      <circle
        cx="30"
        cy="30"
        r="23"
        strokeWidth="6"
        fill="transparent"
      ></circle>
    </svg>
  </div>
));
