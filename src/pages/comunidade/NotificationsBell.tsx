import { useEffect, useRef, useState, type FC } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Heart, MessageSquare, UserPlus } from 'lucide-react';
import { notificationsService } from '@/services/notifications.service';
import type { AppNotification } from '@/types/user.types';
import styles from './ComunidadePage.module.css';

const ago = (d: string) => {
  const diff = (Date.now() - new Date(d).getTime()) / 1000;
  if (diff < 60) return 'agora';
  if (diff < 3600) return `há ${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `há ${Math.floor(diff / 3600)}h`;
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
};

const describe = (n: AppNotification): { text: string; to: string; icon: JSX.Element } => {
  const who = n.actor_name || 'Alguém';
  switch (n.type) {
    case 'topic_like':
      return { text: `${who} curtiu seu tópico`, to: `/comunidade/${n.topic_id}`, icon: <Heart size={14} /> };
    case 'reply_like':
      return { text: `${who} curtiu sua resposta`, to: `/comunidade/${n.topic_id}`, icon: <Heart size={14} /> };
    case 'topic_reply':
      return { text: `${who} comentou no seu tópico`, to: `/comunidade/${n.topic_id}`, icon: <MessageSquare size={14} /> };
    case 'follow':
      return { text: `${who} começou a seguir você`, to: `/usuarios/${n.actor_id}`, icon: <UserPlus size={14} /> };
    default:
      return { text: 'Nova notificação', to: '/comunidade', icon: <Bell size={14} /> };
  }
};

const NotificationsBell: FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    notificationsService.unreadCount().then(setUnread).catch(() => {});
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next) {
      setLoading(true);
      try {
        setItems(await notificationsService.list());
        if (unread > 0) {
          await notificationsService.markAllRead();
          setUnread(0);
        }
      } catch { /* silencioso */ } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className={styles.bellWrap} ref={ref}>
      <button className={styles.bellBtn} onClick={toggle} aria-label="Notificações">
        <Bell size={18} />
        {unread > 0 && <span className={styles.bellBadge}>{unread > 9 ? '9+' : unread}</span>}
      </button>

      {open && (
        <div className={styles.notifPanel}>
          <div className={styles.notifHead}>Notificações</div>
          {loading ? (
            <div className={styles.notifEmpty}>Carregando…</div>
          ) : items.length === 0 ? (
            <div className={styles.notifEmpty}>Nenhuma notificação ainda.</div>
          ) : (
            <ul className={styles.notifList}>
              {items.map((n) => {
                const { text, to, icon } = describe(n);
                return (
                  <li key={n.id}>
                    <Link to={to} className={`${styles.notifItem} ${n.read ? '' : styles.notifUnread}`} onClick={() => setOpen(false)}>
                      <span className={styles.notifIcon}>{icon}</span>
                      <span className={styles.notifBody}>
                        <span className={styles.notifText}>{text}</span>
                        {n.topic_title && (n.type === 'topic_like' || n.type === 'topic_reply' || n.type === 'reply_like') && (
                          <span className={styles.notifSub}>“{n.topic_title}”</span>
                        )}
                        <span className={styles.notifTime}>{ago(n.created_at)}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsBell;
