import { useCallback, useEffect, useState, type FC } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import PublicLayout from '@/components/layout/PublicLayout';
import { ArrowLeft, Clock, Heart, MessageSquare, UserPlus, UserCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { usersService } from '@/services/users.service';
import { communityService } from '@/services/community.service';
import type { UserProfile } from '@/types/user.types';
import type { Topic } from '@/types/community.types';
import ClampText from './ClampText';
import styles from './ComunidadePage.module.css';

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

const fmtAgo = (d: string) => {
  const diff = (Date.now() - new Date(d).getTime()) / 1000;
  if (diff < 60) return 'agora';
  if (diff < 3600) return `há ${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `há ${Math.floor(diff / 3600)}h`;
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
};

const UserProfilePage: FC = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [p, t] = await Promise.all([
        usersService.getProfile(userId),
        usersService.getUserTopics(userId),
      ]);
      setProfile(p);
      setTopics(t);
    } catch {
      toast.error('Usuário não encontrado.');
      navigate('/comunidade');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const isSelf = user?.id === profile?.id;

  const toggleFollow = async () => {
    if (!user) { toast.info('Entre na sua conta para seguir.'); navigate('/login'); return; }
    if (!profile) return;
    setFollowing(true);
    try {
      const r = await usersService.toggleFollow(profile.id);
      setProfile({ ...profile, is_following: r.following, follower_count: r.follower_count });
    } catch {
      toast.error('Erro ao seguir usuário.');
    } finally {
      setFollowing(false);
    }
  };

  const toggleLike = async (t: Topic) => {
    if (!user) { toast.info('Entre na sua conta para curtir.'); navigate('/login'); return; }
    try {
      const r = await communityService.likeTopic(t.id);
      setTopics((prev) => prev.map((x) => (x.id === t.id ? { ...x, liked: r.liked, like_count: r.like_count } : x)));
    } catch { toast.error('Erro ao curtir.'); }
  };

  return (
    <PublicLayout>
      <div className={styles.page}>
        <Link to="/comunidade" className={styles.backLink}>
          <ArrowLeft size={15} /> Voltar à comunidade
        </Link>

        <div className={styles.profileWrap}>
          {loading ? (
            <div className={styles.empty}>Carregando…</div>
          ) : !profile ? null : (
            <>
              <section className={styles.profileCard}>
                <div className={styles.profileHead}>
                  <div className={styles.profileAvatar}>
                    {profile.avatar_url
                      ? <img src={profile.avatar_url} alt="" />
                      : <span>{(profile.name?.[0] ?? '?').toUpperCase()}</span>}
                  </div>
                  <div className={styles.profileIdentity}>
                    <h1 className={styles.profileName}>
                      {profile.name}
                      {profile.role === 'admin' && <span className={styles.roleBadge}>Admin</span>}
                    </h1>
                    <span className={styles.profileSince}>Membro desde {fmtDate(profile.created_at)}</span>
                  </div>
                </div>

                {profile.bio && <p className={styles.profileBio}>{profile.bio}</p>}

                <div className={styles.profileStats}>
                  <div className={styles.statBox}>
                    <span className={styles.statNum}>{profile.topic_count}</span>
                    <span className={styles.statLabel}>Tópicos</span>
                  </div>
                  <div className={styles.statBox}>
                    <span className={styles.statNum}>{profile.reply_count}</span>
                    <span className={styles.statLabel}>Respostas</span>
                  </div>
                  <div className={styles.statBox}>
                    <span className={styles.statNum}>{profile.follower_count}</span>
                    <span className={styles.statLabel}>Seguidores</span>
                  </div>
                  <div className={styles.statBox}>
                    <span className={styles.statNum}>{profile.following_count}</span>
                    <span className={styles.statLabel}>Seguindo</span>
                  </div>
                </div>

                {isSelf ? (
                  <div className={styles.profileActions}>
                    <Link to="/painel/perfil" className={`${styles.followBtn} ${styles.followingBtn}`}>
                      Editar perfil
                    </Link>
                  </div>
                ) : (
                  <div className={styles.profileActions}>
                    <button
                      className={`${styles.followBtn} ${profile.is_following ? styles.followingBtn : ''}`}
                      onClick={toggleFollow}
                      disabled={following}
                    >
                      {profile.is_following
                        ? <><UserCheck size={16} /> Seguindo</>
                        : <><UserPlus size={16} /> Seguir</>}
                    </button>
                  </div>
                )}
              </section>

              <h2 className={styles.profileSectionTitle}>Tópicos de {profile.name} ({profile.topic_count})</h2>

              {topics.length === 0 ? (
                <div className={styles.empty}>Nenhum tópico publicado ainda.</div>
              ) : (
                <div className={styles.list}>
                  {topics.map((t) => (
                    <article key={t.id} className={styles.card}>
                      <Link to={`/comunidade/${t.id}`} className={styles.cardLink}>
                        <div className={styles.cardTop}>
                          <div className={styles.avatar}>
                            {t.author_avatar ? <img src={t.author_avatar} alt="" /> : <span>{(t.author_name?.[0] ?? '?').toUpperCase()}</span>}
                          </div>
                          <div className={styles.cardWho}>
                            <span className={styles.author}>{t.author_name}</span>
                            <span className={styles.metaSub}>
                              <span className={styles.catTag}>{t.category_name}</span>
                              <Clock size={11} /> {fmtAgo(t.created_at)}
                            </span>
                          </div>
                        </div>
                        <h3 className={styles.cardTitle}>{t.title}</h3>
                      </Link>
                      <ClampText text={t.content} className={styles.cardExcerpt} />
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
            </>
          )}
        </div>
      </div>
    </PublicLayout>
  );
};

export default UserProfilePage;
