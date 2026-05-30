import { useEffect, useRef, useState, type FC } from 'react';
import styles from './ComunidadePage.module.css';

/** Mostra no máximo 3 linhas; exibe "Ver mais" (canto inferior direito) só quando o texto excede. */
const ClampText: FC<{ text: string; className?: string }> = ({ text, className = '' }) => {
  const ref = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (el && !expanded) setOverflowing(el.scrollHeight > el.clientHeight + 1);
  }, [text, expanded]);

  return (
    <>
      <p ref={ref} className={`${className} ${expanded ? '' : styles.clamp}`}>{text}</p>
      {overflowing && (
        <div className={styles.verMaisRow}>
          <button
            type="button"
            className={styles.verMais}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setExpanded((v) => !v); }}
          >
            {expanded ? 'Ver menos' : 'Ver mais'}
          </button>
        </div>
      )}
    </>
  );
};

export default ClampText;
