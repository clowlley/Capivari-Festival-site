import type { FC } from 'react';
import styles from './UploadOverlay.module.css';

interface UploadOverlayProps {
  visible: boolean;
  pct: number;
  /** true quando o upload pro servidor terminou e o servidor está processando (Cloudinary) */
  processing: boolean;
}

const UploadOverlay: FC<UploadOverlayProps> = ({ visible, pct, processing }) => {
  if (!visible) return null;
  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.spinner} />
        <p className={styles.title}>
          {processing ? 'Processando arquivos...' : 'Enviando arquivos...'}
        </p>
        <div className={styles.barTrack}>
          <div
            className={`${styles.barFill} ${processing ? styles.barIndeterminate : ''}`}
            style={processing ? undefined : { width: `${pct}%` }}
          />
        </div>
        <p className={styles.hint}>
          {processing
            ? 'Subindo as mídias para a nuvem, isso pode levar alguns segundos. Não feche esta janela.'
            : `${pct}% enviado`}
        </p>
      </div>
    </div>
  );
};

export default UploadOverlay;
