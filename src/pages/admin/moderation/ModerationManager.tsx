import { useEffect, useState, type FC } from 'react';
import { ShieldCheck, Check, X, Clock, Mail } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { communityService } from '@/services/community.service';
import type { PendingTopic } from '@/types/community.types';
import styles from './ModerationManager.module.css';

const fmt = (d: string) =>
  new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

const ModerationManager: FC = () => {
  const toast = useToast();
  const [items, setItems] = useState<PendingTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      setItems(await communityService.getPendingTopics());
    } catch {
      toast.error('Erro ao carregar pendências.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const approve = async (id: number) => {
    setBusy(id);
    try {
      await communityService.approveTopic(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
      toast.success('Tópico aprovado e liberado na comunidade.');
    } catch { toast.error('Erro ao aprovar.'); }
    finally { setBusy(null); }
  };

  const reject = async (id: number) => {
    if (!confirm('Rejeitar e excluir este tópico?')) return;
    setBusy(id);
    try {
      await communityService.rejectTopic(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
      toast.success('Tópico rejeitado.');
    } catch { toast.error('Erro ao rejeitar.'); }
    finally { setBusy(null); }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.headIcon}><ShieldCheck size={22} /></div>
        <div>
          <h1 className={styles.title}>Moderação da Comunidade</h1>
          <p className={styles.subtitle}>
            {items.length > 0
              ? `${items.length} tópico(s) aguardando aprovação`
              : 'Nenhuma pendência no momento'}
          </p>
        </div>
      </div>

      {loading ? (
        <div className={styles.empty}>Carregando…</div>
      ) : items.length === 0 ? (
        <div className={styles.empty}>Tudo limpo! Nenhum tópico pendente. 🎉</div>
      ) : (
        <div className={styles.list}>
          {items.map((t) => (
            <article key={t.id} className={styles.card}>
              <div className={styles.cardHead}>
                <div className={styles.avatar}>
                  {t.author_avatar ? <img src={t.author_avatar} alt="" /> : <span>{(t.author_name?.[0] ?? '?').toUpperCase()}</span>}
                </div>
                <div className={styles.meta}>
                  <span className={styles.author}>{t.author_name}</span>
                  <span className={styles.sub}>
                    <Mail size={11} /> {t.author_email}
                    <span className={styles.dot}>·</span>
                    <Clock size={11} /> {fmt(t.created_at)}
                  </span>
                </div>
                <span className={styles.catTag}>{t.category_name}</span>
              </div>

              <h3 className={styles.topicTitle}>{t.title}</h3>
              <p className={styles.content}>{t.content}</p>
              {t.image_url && <img src={t.image_url} alt="" className={styles.image} />}

              <div className={styles.actions}>
                <button className={styles.reject} disabled={busy === t.id} onClick={() => reject(t.id)}>
                  <X size={16} /> Rejeitar
                </button>
                <button className={styles.approve} disabled={busy === t.id} onClick={() => approve(t.id)}>
                  <Check size={16} /> Aprovar
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModerationManager;
