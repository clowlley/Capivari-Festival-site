import { useEffect, useRef, useState, type FC, type ReactNode } from 'react';
import { MoreVertical } from 'lucide-react';
import styles from './ComunidadePage.module.css';

const KebabMenu: FC<{ children: ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className={styles.kebab} ref={ref}>
      <button
        type="button"
        className={styles.kebabBtn}
        aria-label="Opções"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen((o) => !o); }}
      >
        <MoreVertical size={18} />
      </button>
      {open && (
        <div className={styles.kebabMenu} onClick={() => setOpen(false)}>
          {children}
        </div>
      )}
    </div>
  );
};

export default KebabMenu;
