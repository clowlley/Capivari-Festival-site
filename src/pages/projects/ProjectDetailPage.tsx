import { useState, useEffect, type FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, FolderOpen, Calendar, Star, Play, FileText, Image as ImageIcon, Video as VideoIcon, ListMusic } from 'lucide-react';
import { projectService } from '@/services/projects.service';
import type { Project } from '@/types/project.types';
import PublicLayout from '@/components/layout/PublicLayout';
import { safeUrl } from '@/utils/security';
import styles from './ProjectDetailPage.module.css';

/* ── Video embed helper ──────────────────────────────────── */
function getYouTubeId(url: string) {
  return url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\s?]+)/)?.[1] ?? null;
}
function getVimeoId(url: string) {
  return url.match(/vimeo\.com\/(\d+)/)?.[1] ?? null;
}

const VideoPlayer: FC<{ url: string }> = ({ url }) => {
  const ytId = getYouTubeId(url);
  if (ytId) return (
    <iframe
      className={styles.videoFrame}
      src={`https://www.youtube.com/embed/${ytId}`}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  );
  const vimeoId = getVimeoId(url);
  if (vimeoId) return (
    <iframe
      className={styles.videoFrame}
      src={`https://player.vimeo.com/video/${vimeoId}`}
      allow="autoplay; fullscreen; picture-in-picture"
      allowFullScreen
    />
  );
  return <video src={url} controls className={styles.videoFrame} />;
};

type Tab = 'about' | 'photos' | 'videos' | 'set';

const ProjectDetailPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [videoLightbox, setVideoLightbox] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('about');

  useEffect(() => {
    if (!id) return;
    projectService.getPublicProjects({ limit: 200 })
      .then(res => {
        const found = res.data.find(p => String(p.id) === id) || null;
        setProject(found);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <PublicLayout>
      <div className={styles.loadingWrap}><div className={styles.spinner} /></div>
    </PublicLayout>
  );

  if (!project) return (
    <PublicLayout>
      <div className={styles.notFound}>
        <p>Projeto não encontrado.</p>
        <button onClick={() => navigate('/projetos')}>← Voltar</button>
      </div>
    </PublicLayout>
  );

  const photos = project.photos || [];
  const videos = project.videos || [];
  const tracks = project.tracks || [];
  const hasAnyVideo = videos.length > 0 || !!project.video_url;

  const createdDate = project.created_at
    ? new Date(project.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    : null;

  return (
    <PublicLayout>
      <div className={styles.page}>

        {/* ── Hero ── */}
        <div className={styles.hero}>
          <div className={styles.heroBg}>
            <img
              src={project.cover_image || 'https://placehold.co/1400x600/131110/d4a853?text=Projeto'}
              alt=""
            />
            <div className={styles.heroBgOverlay} />
          </div>

          <div className={styles.heroInner}>
            <div className={styles.heroLeft}>
              <button className={styles.backBtn} onClick={() => navigate('/projetos')}>
                <ArrowLeft size={15} /> Projetos
              </button>

              <span className={styles.heroLabel}>
                <FolderOpen size={12} /> Projeto
              </span>

              <h1 className={styles.heroName}>{project.title}</h1>

              <div className={styles.tagRow}>
                {project.category && <span className={styles.tag}>{project.category}</span>}
                {project.featured && (
                  <span className={styles.tagFeatured}><Star size={11} fill="currentColor" /> Destaque</span>
                )}
              </div>

              {project.description && (
                <p className={styles.heroDesc}>{project.description}</p>
              )}

              {createdDate && (
                <div className={styles.statsRow}>
                  <span className={styles.stat}><Calendar size={13} /> {createdDate}</span>
                </div>
              )}

              {project.video_url && (
                <a
                  href={safeUrl(project.video_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.openVideoBtn}
                >
                  <ExternalLink size={14} /> Abrir vídeo
                </a>
              )}
            </div>

            {project.cover_image && (
              <div className={styles.heroRight}>
                <img src={project.cover_image} alt={project.title} className={styles.coverImg} />
              </div>
            )}
          </div>
        </div>

        {/* ── Corpo ── */}
        <div className={styles.body}>

          <div className={styles.mediaTabs}>
            <button
              className={`${styles.mediaTab} ${tab === 'about' ? styles.mediaTabActive : ''}`}
              onClick={() => setTab('about')}
              disabled={!project.description && !project.full_content}
            >
              <FileText size={14} /> Descrição
            </button>
            <button
              className={`${styles.mediaTab} ${tab === 'photos' ? styles.mediaTabActive : ''}`}
              onClick={() => setTab('photos')}
              disabled={photos.length === 0}
            >
              <ImageIcon size={14} /> Fotos
              {photos.length > 0 && <span className={styles.mediaTabCount}>{photos.length}</span>}
            </button>
            <button
              className={`${styles.mediaTab} ${tab === 'videos' ? styles.mediaTabActive : ''}`}
              onClick={() => setTab('videos')}
              disabled={!hasAnyVideo}
            >
              <VideoIcon size={14} /> Vídeos
              {videos.length > 0 && <span className={styles.mediaTabCount}>{videos.length}</span>}
            </button>
            <button
              className={`${styles.mediaTab} ${tab === 'set' ? styles.mediaTabActive : ''}`}
              onClick={() => setTab('set')}
              disabled={tracks.length === 0}
            >
              <ListMusic size={14} /> Set
              {tracks.length > 0 && <span className={styles.mediaTabCount}>{tracks.length}</span>}
            </button>
          </div>

          {tab === 'about' && (
            <section className={styles.section}>
              {project.description && <p className={styles.lead}>{project.description}</p>}
              {project.full_content && <p className={styles.fullContent}>{project.full_content}</p>}
            </section>
          )}

          {tab === 'photos' && photos.length > 0 && (
            <section className={styles.section}>
              <div className={styles.photosGrid}>
                {photos.map((p, i) => (
                  <div key={p.id ?? i} className={styles.photoThumb} onClick={() => setLightbox(p.image)}>
                    <img src={p.image} alt="" loading="lazy" />
                  </div>
                ))}
              </div>
            </section>
          )}

          {tab === 'videos' && hasAnyVideo && (
            <section className={styles.section}>
              {project.video_url && (
                <div className={styles.videoWrap}>
                  <VideoPlayer url={project.video_url} />
                </div>
              )}
              {videos.length > 0 && (
                <div className={styles.photosGrid}>
                  {videos.map((v, i) => (
                    <div key={v.id ?? i} className={styles.videoThumb} onClick={() => setVideoLightbox(v.video_url)}>
                      <video src={v.video_url} muted preload="metadata" />
                      <div className={styles.videoOverlay}>
                        <Play size={28} fill="#fff" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {tab === 'set' && tracks.length > 0 && (
            <section className={styles.section}>
              <div className={styles.playlist}>
                {tracks.map((t, i) => (
                  <div key={t.id ?? i} className={styles.playlistItem}>
                    <div className={styles.playlistIndex}>{String(i + 1).padStart(2, '0')}</div>
                    <div className={styles.playlistInfo}>
                      <div className={styles.playlistTitle}>{t.title || `Faixa ${i + 1}`}</div>
                    </div>
                    <audio src={t.audio_url} controls preload="metadata" className={styles.playlistAudio} />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ── Lightbox foto ── */}
        {lightbox && (
          <div className={styles.lbOverlay} onClick={() => setLightbox(null)}>
            <img src={lightbox} alt="" className={styles.lbImg} onClick={e => e.stopPropagation()} />
            <button className={styles.lbClose} onClick={() => setLightbox(null)}>
              <ArrowLeft size={15} /> Fechar
            </button>
          </div>
        )}

        {/* ── Lightbox vídeo ── */}
        {videoLightbox && (
          <div className={styles.lbOverlay} onClick={() => setVideoLightbox(null)}>
            <video src={videoLightbox} className={styles.lbImg} controls autoPlay onClick={e => e.stopPropagation()} />
            <button className={styles.lbClose} onClick={() => setVideoLightbox(null)}>
              <ArrowLeft size={15} /> Fechar
            </button>
          </div>
        )}
      </div>
    </PublicLayout>
  );
};

export default ProjectDetailPage;
