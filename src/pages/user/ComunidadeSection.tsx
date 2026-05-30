import type { FC } from 'react';
import styles from './ProfileSection.module.css';

const ComunidadeSection: FC = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.heading}>
        <h1 className={styles.title}>Comunidade</h1>
        <p className={styles.subtitle}>Em breve você poderá interagir com a comunidade Capivari.</p>
      </div>
    </div>
  );
};

export default ComunidadeSection;
