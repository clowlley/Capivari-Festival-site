import { useCallback, useEffect, useMemo, useRef, useState, type FC } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import PublicLayout from '@/components/layout/PublicLayout';
import { ArrowLeft, Heart, MessageSquare, ImagePlus, Send, Clock, Trash2, Pencil, X, Check, Calendar, MapPin, Music, ShoppingBag, Briefcase, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { communityService } from '@/services/community.service';
import { eventService } from '@/services/events.service';
import { artistsService } from '@/services/artists.service';
import { projectService } from '@/services/projects.service';
import { productService } from '@/services/products.service';
import type { TopicDetail, Reply } from '@/types/community.types';
import type { Event } from '@/types/event.types';
import type { Artist } from '@/types/artist.types';
import type { Project } from '@/types/project.types';
import type { Product } from '@/types/product.types';
import KebabMenu from './KebabMenu';
import ClampText from './ClampText';
import styles from './ComunidadePage.module.css';

const MAX_POST = 20000;
const MAX_COMMENT = 10000;

const isVideoUrl = (u: string) => /\/video\/upload\//.test(u) || /\.(mp4|webm|mov|ogg)(\?|$)/i.test(u);

const fmt = (d: string) =>
  new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

const Avatar: FC<{ name: string; src: string | null; to?: string }> = ({ name, src, to }) => {
  const inner = src ? <img src={src} alt="" /> : <span>{(name?.[0] ?? '?').toUpperCase()}</span>;
  return to
    ? <Link to={to} className={styles.avatar}>{inner}</Link>
    : <div className={styles.avatar}>{inner}</div>;
};

const Media: FC<{ url: string }> = ({ url }) =>
  isVideoUrl(url)
    ? <video src={url} className={styles.detailImg} controls />
    : <img src={url} alt="" className={styles.detailImg} />;

const TopicPage: FC = () => {
  const { topicId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const replyFile = useRef<HTMLInputElement>(null);

  const [topic, setTopic] = useState<TopicDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [replyText, setReplyText] = useState('');
  const [replyImg, setReplyImg] = useState<File | null>(null);
  const [replyPreview, setReplyPreview] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const [editingTopic, setEditingTopic] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editingReply, setEditingReply] = useState<number | null>(null);
  const [editReplyText, setEditReplyText] = useState('');

  const isOwner = (authorId: number) => user?.id === authorId || user?.role === 'admin';
  const requireLogin = () => { toast.info('Entre na sua conta para participar.'); navigate('/login'); };

  const load = useCallback(async () => {
    if (!topicId) return;
    setLoading(true);
    try {
      setTopic(await communityService.getTopic(topicId));
    } catch {
      toast.error('Tópico não encontrado.');
      navigate('/comunidade');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    eventService.getPublicEvents({ status: 'published', limit: 6 }).then((r) => setEvents(r.data || [])).catch(() => {});
    artistsService.getPublicArtists().then(setArtists).catch(() => {});
    projectService.getPublicProjects({ limit: 6 }).then((r) => setProjects(r.data || [])).catch(() => {});
    productService.getPublicProducts({ limit: 6 }).then((r) => setProducts(r.data || [])).catch(() => {});
  }, []);

  // Eventos rolando: próximos por data
  const liveEvents = useMemo(
    () => [...events].sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()).slice(0, 3),
    [events]
  );
  const topArtists = useMemo(() => artists.slice(0, 4), [artists]);
  const topProjects = useMemo(() => projects.slice(0, 3), [projects]);
  const topProducts = useMemo(() => products.slice(0, 3), [products]);

  const fmtEvent = (d: string) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  const fmtPrice = (v: number) => Number(v) > 0
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v))
    : 'Sob consulta';

  const likeTopic = async () => {
    if (!user) return requireLogin();
    if (!topic) return;
    try {
      const r = await communityService.likeTopic(topic.id);
      setTopic({ ...topic, liked: r.liked, like_count: r.like_count });
    } catch { toast.error('Erro ao curtir.'); }
  };

  const likeReply = async (rep: Reply) => {
    if (!user) return requireLogin();
    if (!topic) return;
    try {
      const r = await communityService.likeReply(rep.id);
      setTopic({ ...topic, replies: topic.replies.map((x) => (x.id === rep.id ? { ...x, liked: r.liked, like_count: r.like_count } : x)) });
    } catch { toast.error('Erro ao curtir.'); }
  };

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return requireLogin();
    if (!topic) return;
    setSending(true);
    try {
      const form = new FormData();
      form.append('content', replyText);
      if (replyImg) form.append('image', replyImg);
      await communityService.createReply(topic.id, form);
      setReplyText(''); setReplyImg(null); setReplyPreview(null);
      load();
    } catch (err) {
      const e2 = err as { response?: { data?: { error?: string } } };
      toast.error(e2.response?.data?.error || 'Erro ao responder.');
    } finally {
      setSending(false);
    }
  };

  const delTopic = async () => {
    if (!topic || !confirm('Excluir este tópico?')) return;
    try { await communityService.deleteTopic(topic.id); toast.success('Tópico excluído.'); navigate('/comunidade'); }
    catch { toast.error('Erro ao excluir.'); }
  };

  const saveTopic = async () => {
    if (!topic) return;
    try {
      const form = new FormData();
      form.append('title', editTitle);
      form.append('content', editContent);
      await communityService.updateTopic(topic.id, form);
      setEditingTopic(false);
      load();
    } catch { toast.error('Erro ao salvar.'); }
  };

  const delReply = async (id: number) => {
    if (!confirm('Excluir esta resposta?')) return;
    try { await communityService.deleteReply(id); load(); }
    catch { toast.error('Erro ao excluir.'); }
  };

  const saveReply = async (id: number) => {
    try {
      const form = new FormData();
      form.append('content', editReplyText);
      await communityService.updateReply(id, form);
      setEditingReply(null);
      load();
    } catch { toast.error('Erro ao salvar.'); }
  };

  return (
    <PublicLayout>
      <div className={styles.page}>
        <Link to="/comunidade" className={styles.backLink}>
          <ArrowLeft size={15} /> Voltar à comunidade
        </Link>

        <div className={styles.detailGrid}>
          <aside className={styles.detailSide}>
            {topArtists.length > 0 && (
              <div className={styles.sideCard}>
                <div className={styles.sideHead}>
                  <h3 className={styles.sideTitle}><Music size={13} /> Artistas</h3>
                  <Link to="/artistas" className={styles.sideMore}>ver todos <ChevronRight size={12} /></Link>
                </div>
                {topArtists.map((a) => (
                  <Link key={a.id} to={`/artistas/${a.id}`} className={styles.mediaItem}>
                    <div className={styles.mediaThumb}>
                      {a.profile_image || a.cover_image
                        ? <img src={a.profile_image || a.cover_image} alt="" />
                        : <Music size={16} />}
                    </div>
                    <div className={styles.mediaInfo}>
                      <span className={styles.mediaTitle}>{a.name}</span>
                      {(a.project_name || a.musical_styles) && (
                        <span className={styles.mediaSub}>{a.project_name || a.musical_styles}</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
            {topProjects.length > 0 && (
              <div className={styles.sideCard}>
                <div className={styles.sideHead}>
                  <h3 className={styles.sideTitle}><Briefcase size={13} /> Projetos</h3>
                  <Link to="/projetos" className={styles.sideMore}>ver todos <ChevronRight size={12} /></Link>
                </div>
                {topProjects.map((p) => (
                  <Link key={p.id} to={`/projetos/${p.id}`} className={styles.mediaItem}>
                    <div className={styles.mediaThumb}>
                      {p.cover_image ? <img src={p.cover_image} alt="" /> : <Briefcase size={16} />}
                    </div>
                    <div className={styles.mediaInfo}>
                      <span className={styles.mediaTitle}>{p.title}</span>
                      {p.category && <span className={styles.mediaSub}>{p.category}</span>}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </aside>

          <div className={styles.detailCenter}>
          {loading ? (
            <div className={styles.empty}>Carregando…</div>
          ) : !topic ? null : (
            <>
              <article className={styles.topicCard}>
                {isOwner(topic.author_id) && !editingTopic && (
                  <KebabMenu>
                    <button className={styles.kebabItem} onClick={() => { setEditingTopic(true); setEditTitle(topic.title); setEditContent(topic.content); }}>
                      <Pencil size={14} /> Editar
                    </button>
                    <button className={`${styles.kebabItem} ${styles.kebabDanger}`} onClick={delTopic}>
                      <Trash2 size={14} /> Excluir
                    </button>
                  </KebabMenu>
                )}
                <div className={styles.topicHead}>
                  <Avatar name={topic.author_name} src={topic.author_avatar} to={`/usuarios/${topic.author_id}`} />
                  <div className={styles.cardMeta}>
                    <Link to={`/usuarios/${topic.author_id}`} className={styles.metaTextLink}>{topic.author_name}</Link>
                    <span className={styles.metaSub}>
                      <span className={styles.catTag}>{topic.category_name}</span>
                      <Clock size={11} /> {fmt(topic.created_at)}
                    </span>
                  </div>
                </div>

                {editingTopic ? (
                  <div className={styles.composer}>
                    <input className={styles.input} value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                    <textarea className={styles.input} rows={4} value={editContent} maxLength={MAX_POST} onChange={(e) => setEditContent(e.target.value)} />
                    <div className={styles.composerActions}>
                      <button type="button" className={styles.imgBtn} onClick={() => setEditingTopic(false)}><X size={15} /> Cancelar</button>
                      <button type="button" className={styles.submit} onClick={saveTopic}><Check size={15} /> Salvar</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h1 className={styles.detailTitle}>{topic.title}</h1>
                    <p className={styles.detailContent}>{topic.content}</p>
                    {topic.image_url && <Media url={topic.image_url} />}
                  </>
                )}

                <div className={styles.cardStats}>
                  <button className={`${styles.stat} ${topic.liked ? styles.liked : ''}`} onClick={likeTopic}>
                    <Heart size={15} fill={topic.liked ? 'currentColor' : 'none'} /> {topic.like_count}
                  </button>
                  <span className={styles.stat}><MessageSquare size={15} /> {topic.replies.length}</span>
                </div>
              </article>

              <h2 className={styles.repliesTitle}>Respostas ({topic.replies.length})</h2>

              <div className={styles.replies}>
                {topic.replies.map((r) => (
                  <div key={r.id} className={styles.replyCard}>
                    {isOwner(r.author_id) && editingReply !== r.id && (
                      <KebabMenu>
                        <button className={styles.kebabItem} onClick={() => { setEditingReply(r.id); setEditReplyText(r.content); }}>
                          <Pencil size={14} /> Editar
                        </button>
                        <button className={`${styles.kebabItem} ${styles.kebabDanger}`} onClick={() => delReply(r.id)}>
                          <Trash2 size={14} /> Excluir
                        </button>
                      </KebabMenu>
                    )}
                    <div className={styles.topicHead}>
                      <Avatar name={r.author_name} src={r.author_avatar} to={`/usuarios/${r.author_id}`} />
                      <div className={styles.cardMeta}>
                        <Link to={`/usuarios/${r.author_id}`} className={styles.metaTextLink}>{r.author_name}</Link>
                        <span className={styles.metaSub}><Clock size={11} /> {fmt(r.created_at)}</span>
                      </div>
                    </div>
                    {editingReply === r.id ? (
                      <div className={styles.composer}>
                        <textarea className={styles.input} rows={3} value={editReplyText} maxLength={MAX_COMMENT} onChange={(e) => setEditReplyText(e.target.value)} />
                        <div className={styles.composerActions}>
                          <button type="button" className={styles.imgBtn} onClick={() => setEditingReply(null)}><X size={14} /> Cancelar</button>
                          <button type="button" className={styles.submit} onClick={() => saveReply(r.id)}><Check size={14} /> Salvar</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <ClampText text={r.content} className={styles.replyContent} />
                        {r.image_url && <Media url={r.image_url} />}
                        <button className={`${styles.stat} ${r.liked ? styles.liked : ''}`} onClick={() => likeReply(r)}>
                          <Heart size={14} fill={r.liked ? 'currentColor' : 'none'} /> {r.like_count}
                        </button>
                      </>
                    )}
                  </div>
                ))}
                {topic.replies.length === 0 && <div className={styles.empty}>Ninguém respondeu ainda.</div>}
              </div>

              {user ? (
                <form className={styles.composer} onSubmit={sendReply}>
                  <textarea
                    className={styles.input}
                    placeholder="Escreva uma resposta…"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    required
                    rows={3}
                    maxLength={MAX_COMMENT}
                  />
                  <span className={styles.counter}>{replyText.length}/{MAX_COMMENT}</span>
                  {replyPreview && (
                    <div className={styles.previewWrap}>
                      {replyImg?.type.startsWith('video')
                        ? <video src={replyPreview} className={styles.preview} controls />
                        : <img src={replyPreview} alt="prévia" className={styles.preview} />}
                      <button type="button" className={styles.removeImg} onClick={() => { setReplyImg(null); setReplyPreview(null); }}><X size={14} /></button>
                    </div>
                  )}
                  <div className={styles.composerActions}>
                    <button type="button" className={styles.imgBtn} onClick={() => replyFile.current?.click()}>
                      <ImagePlus size={16} /> Foto/Vídeo
                    </button>
                    <input ref={replyFile} type="file" accept="image/*,video/*" hidden onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      setReplyImg(f);
                      setReplyPreview(URL.createObjectURL(f));
                    }} />
                    <button type="submit" className={styles.submit} disabled={sending}>
                      {sending ? <span className={styles.spinner} /> : <><Send size={15} /> Responder</>}
                    </button>
                  </div>
                </form>
              ) : (
                <div className={styles.loginPrompt}>
                  <Link to="/login" className={styles.submit}>Entrar para responder</Link>
                </div>
              )}
            </>
          )}
          </div>

          <aside className={styles.detailSide}>
            {liveEvents.length > 0 && (
              <div className={styles.sideCard}>
                <div className={styles.sideHead}>
                  <h3 className={styles.sideTitle}><Calendar size={13} /> Eventos rolando</h3>
                  <Link to="/eventos" className={styles.sideMore}>ver todos <ChevronRight size={12} /></Link>
                </div>
                {liveEvents.map((ev) => (
                  <Link key={ev.id} to={`/eventos/${ev.id}`} className={styles.mediaItem}>
                    <div className={styles.mediaThumb}>
                      {ev.cover_image ? <img src={ev.cover_image} alt="" /> : <Calendar size={16} />}
                    </div>
                    <div className={styles.mediaInfo}>
                      <span className={styles.mediaTitle}>{ev.title}</span>
                      <span className={styles.mediaSub}>
                        <Calendar size={11} /> {fmtEvent(ev.starts_at)}
                        {ev.location_name ? <> · <MapPin size={11} /> {ev.location_name}</> : null}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            {topProducts.length > 0 && (
              <div className={styles.sideCard}>
                <div className={styles.sideHead}>
                  <h3 className={styles.sideTitle}><ShoppingBag size={13} /> Produtos</h3>
                  <Link to="/produtos" className={styles.sideMore}>ver todos <ChevronRight size={12} /></Link>
                </div>
                {topProducts.map((pr) => (
                  <Link key={pr.id} to="/produtos" className={styles.mediaItem}>
                    <div className={styles.mediaThumb}>
                      {pr.cover_image ? <img src={pr.cover_image} alt="" /> : <ShoppingBag size={16} />}
                    </div>
                    <div className={styles.mediaInfo}>
                      <span className={styles.mediaTitle}>{pr.title}</span>
                      <span className={styles.mediaPrice}>{fmtPrice(pr.price)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </aside>
        </div>
      </div>
    </PublicLayout>
  );
};

export default TopicPage;
