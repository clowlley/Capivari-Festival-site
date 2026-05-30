import { useEffect, useMemo, useRef, useState, type FC } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PublicLayout from '@/components/layout/PublicLayout';
import { Search, Plus, X, Send, ImagePlus, Heart, MessageSquare, Clock, MessageCircle, Hash, Trophy } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { communityService } from '@/services/community.service';
import type { Category, Topic, ActiveMember } from '@/types/community.types';
import styles from './ComunidadePage.module.css';

const MAX_POST = 20000;

const fmt = (d: string) => {
  const diff = (Date.now() - new Date(d).getTime()) / 1000;
  if (diff < 60) return 'agora';
  if (diff < 3600) return `há ${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `há ${Math.floor(diff / 3600)}h`;
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
};

const ComunidadePage: FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const fileInput = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [members, setMembers] = useState<ActiveMember[]>([]);
  const [activeCat, setActiveCat] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // composer
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadTopics = (cat: string) => {
    setLoading(true);
    communityService.getTopics(cat || undefined)
      .then(setTopics)
      .catch(() => toast.error('Erro ao carregar tópicos.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    communityService.getCategories().then(setCategories).catch(() => {});
    communityService.getActiveMembers().then(setMembers).catch(() => {});
    loadTopics('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectCat = (slug: string) => {
    setActiveCat(slug);
    loadTopics(slug);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return topics;
    return topics.filter((t) => t.title.toLowerCase().includes(q) || t.content.toLowerCase().includes(q));
  }, [topics, search]);

  const requireLogin = () => {
    toast.info('Entre na sua conta para participar da comunidade.');
    navigate('/login');
  };

  const toggleComposer = () => {
    if (!user) return requireLogin();
    setOpen((o) => !o);
  };

  const pickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setImage(f);
    setPreview(URL.createObjectURL(f));
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
      setTitle(''); setContent(''); setCategoryId(''); setImage(null); setPreview(null); setOpen(false);
    } catch (err) {
      const e2 = err as { response?: { data?: { error?: string } } };
      toast.error(e2.response?.data?.error || 'Erro ao publicar.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleLike = async (t: Topic) => {
    if (!user) return requireLogin();
    try {
      const r = await communityService.likeTopic(t.id);
      setTopics((prev) => prev.map((x) => (x.id === t.id ? { ...x, liked: r.liked, like_count: r.like_count } : x)));
    } catch { toast.error('Erro ao curtir.'); }
  };

  const totalTopics = categories.reduce((s, c) => s + c.topic_count, 0);

  return (
    <PublicLayout>
      <div className={styles.page}>
        <div className={styles.pageHead}>
          <h1 className={styles.pageTitle}>Comunidade Capivari</h1>
          <p className={styles.pageSub}>Converse, troque ideias e conecte-se com a galera do festival</p>
        </div>

        <div className={styles.grid}>
          {/* ── Categorias ── */}
          <aside className={styles.colLeft}>
            <h2 className={styles.colTitle}>Categorias</h2>
            <button
              className={`${styles.catItem} ${activeCat === '' ? styles.catActive : ''}`}
              onClick={() => selectCat('')}
            >
              <MessageCircle size={16} /> <span>Todas as discussões</span>
              <span className={styles.catCount}>{totalTopics}</span>
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                className={`${styles.catItem} ${activeCat === c.slug ? styles.catActive : ''}`}
                onClick={() => selectCat(c.slug)}
              >
                <Hash size={16} /> <span>{c.name}</span>
                <span className={styles.catCount}>{c.topic_count}</span>
              </button>
            ))}
          </aside>

          {/* ── Discussões ── */}
          <section className={styles.colCenter}>
            <h2 className={styles.colTitle}>Discussões</h2>
            <form className={styles.searchRow} onSubmit={(e) => e.preventDefault()}>
              <div className={styles.searchWrap}>
                <Search size={16} />
                <input
                  placeholder="Buscar tópicos…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button type="button" className={styles.newBtn} onClick={toggleComposer}>
                {open ? <><X size={16} /> Fechar</> : <><Plus size={16} /> Novo tópico</>}
              </button>
            </form>

            {open && (
              <form className={styles.composer} onSubmit={submit}>
                <select
                  className={styles.input}
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : '')}
                  required
                >
                  <option value="">Categoria…</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <input
                  className={styles.input}
                  placeholder="Título do tópico"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  minLength={3}
                />
                <textarea
                  className={styles.input}
                  placeholder="O que você quer compartilhar?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  rows={4}
                  maxLength={MAX_POST}
                />
                <span className={styles.counter}>{content.length}/{MAX_POST}</span>
                {preview && (
                  <div className={styles.previewWrap}>
                    {image?.type.startsWith('video')
                      ? <video src={preview} className={styles.preview} controls />
                      : <img src={preview} alt="prévia" className={styles.preview} />}
                    <button type="button" className={styles.removeImg} onClick={() => { setImage(null); setPreview(null); }}>
                      <X size={14} />
                    </button>
                  </div>
                )}
                <div className={styles.composerActions}>
                  <button type="button" className={styles.imgBtn} onClick={() => fileInput.current?.click()}>
                    <ImagePlus size={16} /> Foto/Vídeo
                  </button>
                  <input ref={fileInput} type="file" accept="image/*,video/*" onChange={pickImage} hidden />
                  <button type="submit" className={styles.submit} disabled={submitting}>
                    {submitting ? <span className={styles.spinner} /> : <><Send size={15} /> Publicar</>}
                  </button>
                </div>
              </form>
            )}

            {loading ? (
              <div className={styles.empty}>Carregando…</div>
            ) : filtered.length === 0 ? (
              <div className={styles.empty}>Nenhum tópico encontrado.</div>
            ) : (
              <div className={styles.list}>
                {filtered.map((t) => (
                  <article key={t.id} className={styles.card}>
                    <Link to={`/comunidade/${t.id}`} className={styles.cardLink}>
                      <div className={styles.avatar}>
                        {t.author_avatar ? <img src={t.author_avatar} alt="" /> : <span>{(t.author_name?.[0] ?? '?').toUpperCase()}</span>}
                      </div>
                      <div className={styles.cardBody}>
                        <h3 className={styles.cardTitle}>{t.title}</h3>
                        <div className={styles.cardMeta}>
                          <span className={styles.catTag}>{t.category_name}</span>
                          <span className={styles.metaText}>{t.author_name} · <Clock size={11} /> {fmt(t.created_at)}</span>
                        </div>
                      </div>
                    </Link>
                    <div className={styles.cardStats}>
                      <button className={`${styles.stat} ${t.liked ? styles.liked : ''}`} onClick={() => toggleLike(t)}>
                        <Heart size={15} fill={t.liked ? 'currentColor' : 'none'} /> {t.like_count}
                      </button>
                      <Link to={`/comunidade/${t.id}`} className={styles.stat}>
                        <MessageSquare size={15} /> {t.reply_count ?? 0}
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* ── Membros mais ativos ── */}
          <aside className={styles.colRight}>
            <h2 className={styles.colTitle}>Membros mais ativos</h2>
            {members.length === 0 ? (
              <p className={styles.muted}>Ainda sem atividade.</p>
            ) : (
              <ul className={styles.memberList}>
                {members.map((m, i) => (
                  <li key={m.id} className={styles.member}>
                    <span className={styles.rank}>{i === 0 ? <Trophy size={14} /> : i + 1}</span>
                    <div className={styles.memberAvatar}>
                      {m.avatar_url ? <img src={m.avatar_url} alt="" /> : <span>{(m.name?.[0] ?? '?').toUpperCase()}</span>}
                    </div>
                    <span className={styles.memberName}>{m.name}</span>
                    <span className={styles.memberCount}>{m.contributions}</span>
                  </li>
                ))}
              </ul>
            )}
          </aside>
        </div>
      </div>
    </PublicLayout>
  );
};

export default ComunidadePage;
