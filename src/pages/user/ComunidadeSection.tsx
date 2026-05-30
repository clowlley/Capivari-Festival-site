import { useEffect, useRef, useState, type FC } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Heart, ImagePlus, Plus, X, Send, Clock } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { communityService } from '@/services/community.service';
import type { Category, Topic } from '@/types/community.types';
import styles from './Comunidade.module.css';

const fmt = (d: string) =>
  new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

const ComunidadeSection: FC = () => {
  const toast = useToast();
  const fileInput = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [activeCat, setActiveCat] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // composer
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadTopics = async (cat: string) => {
    setLoading(true);
    try {
      setTopics(await communityService.getTopics(cat || undefined));
    } catch {
      toast.error('Erro ao carregar tópicos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    communityService.getCategories().then(setCategories).catch(() => {});
    loadTopics('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectCat = (slug: string) => {
    setActiveCat(slug);
    loadTopics(slug);
  };

  const pickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setImage(f);
    setPreview(URL.createObjectURL(f));
  };

  const resetComposer = () => {
    setTitle(''); setContent(''); setCategoryId(''); setImage(null); setPreview(null); setOpen(false);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) { toast.error('Escolha uma categoria.'); return; }
    setSubmitting(true);
    try {
      const form = new FormData();
      form.append('category_id', String(categoryId));
      form.append('title', title);
      form.append('content', content);
      if (image) form.append('image', image);
      const { status } = await communityService.createTopic(form);
      if (status === 'approved') {
        toast.success('Tópico publicado!');
        loadTopics(activeCat);
      } else {
        toast.success('Tópico enviado! Aguardando aprovação de um moderador.');
      }
      resetComposer();
    } catch (err) {
      const e2 = err as { response?: { data?: { error?: string } } };
      toast.error(e2.response?.data?.error || 'Erro ao publicar.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleLike = async (t: Topic) => {
    try {
      const r = await communityService.likeTopic(t.id);
      setTopics((prev) => prev.map((x) => (x.id === t.id ? { ...x, liked: r.liked, like_count: r.like_count } : x)));
    } catch {
      toast.error('Erro ao curtir.');
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.heading}>
        <div>
          <h1 className={styles.title}>Comunidade</h1>
          <p className={styles.subtitle}>Compartilhe, pergunte e conecte-se com a galera do Capivari</p>
        </div>
        <button className={styles.newBtn} onClick={() => setOpen((o) => !o)}>
          {open ? <><X size={16} /> Fechar</> : <><Plus size={16} /> Novo tópico</>}
        </button>
      </div>

      {open && (
        <form className={styles.composer} onSubmit={submit}>
          <select
            className={styles.select}
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : '')}
            required
          >
            <option value="">Categoria…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <input
            className={styles.titleInput}
            placeholder="Título do tópico"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            minLength={3}
          />
          <textarea
            className={styles.textarea}
            placeholder="O que você quer compartilhar?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={4}
          />
          {preview && (
            <div className={styles.previewWrap}>
              <img src={preview} alt="prévia" className={styles.preview} />
              <button type="button" className={styles.removeImg} onClick={() => { setImage(null); setPreview(null); }}>
                <X size={14} />
              </button>
            </div>
          )}
          <div className={styles.composerActions}>
            <button type="button" className={styles.imgBtn} onClick={() => fileInput.current?.click()}>
              <ImagePlus size={16} /> Foto
            </button>
            <input ref={fileInput} type="file" accept="image/*" onChange={pickImage} hidden />
            <button type="submit" className={styles.submit} disabled={submitting}>
              {submitting ? <span className={styles.spinner} /> : <><Send size={15} /> Publicar</>}
            </button>
          </div>
        </form>
      )}

      <div className={styles.chips}>
        <button className={`${styles.chip} ${activeCat === '' ? styles.chipActive : ''}`} onClick={() => selectCat('')}>
          Todos
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            className={`${styles.chip} ${activeCat === c.slug ? styles.chipActive : ''}`}
            onClick={() => selectCat(c.slug)}
          >
            {c.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.empty}>Carregando…</div>
      ) : topics.length === 0 ? (
        <div className={styles.empty}>Nenhum tópico ainda. Seja o primeiro a publicar!</div>
      ) : (
        <div className={styles.list}>
          {topics.map((t) => (
            <article key={t.id} className={styles.card}>
              <Link to={`/painel/comunidade/${t.id}`} className={styles.cardLink}>
                <div className={styles.cardHead}>
                  <div className={styles.avatar}>
                    {t.author_avatar
                      ? <img src={t.author_avatar} alt="" />
                      : <span>{(t.author_name?.[0] ?? '?').toUpperCase()}</span>}
                  </div>
                  <div className={styles.cardMeta}>
                    <span className={styles.author}>{t.author_name}</span>
                    <span className={styles.metaSub}>
                      <span className={styles.catTag}>{t.category_name}</span>
                      <Clock size={11} /> {fmt(t.created_at)}
                    </span>
                  </div>
                </div>
                <h3 className={styles.cardTitle}>{t.title}</h3>
                <p className={styles.cardExcerpt}>{t.content}</p>
                {t.image_url && <img src={t.image_url} alt="" className={styles.cardImg} />}
              </Link>
              <div className={styles.cardFooter}>
                <button
                  className={`${styles.action} ${t.liked ? styles.liked : ''}`}
                  onClick={() => toggleLike(t)}
                >
                  <Heart size={15} fill={t.liked ? 'currentColor' : 'none'} /> {t.like_count}
                </button>
                <Link to={`/painel/comunidade/${t.id}`} className={styles.action}>
                  <MessageSquare size={15} /> {t.reply_count ?? 0}
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default ComunidadeSection;
