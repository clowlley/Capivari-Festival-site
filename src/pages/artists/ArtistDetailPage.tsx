import { useState, useEffect, type FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Clock, User, Music2 } from 'lucide-react';
import { artistsService } from '@/services/artists.service';
import type { Artist } from '@/types/artist.types';
import PublicLayout from '@/components/layout/PublicLayout';
import { safeUrl } from '@/utils/security';
import styles from './ArtistDetailPage.module.css';

const ArtistDetailPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    artistsService.getPublicArtists()
      .then(list => setArtist(list.find(a => String(a.id) === id) || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <PublicLayout>
      <div className={styles.loadingWrap}><div className={styles.spinner} /></div>
    </PublicLayout>
  );

  if (!artist) return (
    <PublicLayout>
      <div className={styles.notFound}>
        <p>Artista não encontrado.</p>
        <button onClick={() => navigate('/artistas')}>← Voltar</button>
      </div>
    </PublicLayout>
  );

  const tags = artist.musical_styles
    ? artist.musical_styles.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  return (
    <PublicLayout>
      <div className={styles.page}>

        {/* ── Hero estilo Spotify ── */}
        <div className={styles.hero}>
          <div className={styles.heroBg}>
            <img
              src={artist.cover_image || 'https://placehold.co/1400x600/131110/d4a853?text=Artista'}
              alt=""
            />
            <div className={styles.heroBgOverlay} />
          </div>

          <div className={styles.heroInner}>
            {/* Esquerda — texto */}
            <div className={styles.heroLeft}>
              <button className={styles.backBtn} onClick={() => navigate('/artistas')}>
                <ArrowLeft size={15} /> Artistas
              </button>

              <span className={styles.heroLabel}>
                <Music2 size={12} /> Artista
              </span>

              <h1 className={styles.heroName}>{artist.name}</h1>

              {artist.project_name && (
                <p className={styles.heroProject}>{artist.project_name}</p>
              )}

              {tags.length > 0 && (
                <div className={styles.tagRow}>
                  {tags.map((t, i) => <span key={i} className={styles.tag}>{t}</span>)}
                </div>
              )}

              <div className={styles.statsRow}>
                {artist.age != null && (
                  <span className={styles.stat}><User size={13} /> {artist.age} anos</span>
                )}
                {artist.career_years != null && (
                  <span className={styles.stat}>
                    <Clock size={13} /> {artist.career_years} ano{artist.career_years !== 1 ? 's' : ''} de carreira
                  </span>
                )}
              </div>

              {artist.presskit_url && (
                <a
                  href={safeUrl(artist.presskit_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.presskitBtn}
                >
                  <ExternalLink size={14} /> Acessar Presskit
                </a>
              )}
            </div>

            {/* Direita — foto de perfil */}
            {artist.profile_image && (
              <div className={styles.heroRight}>
                <img src={artist.profile_image} alt={artist.name} className={styles.profileImg} />
              </div>
            )}
          </div>
        </div>

        {/* ── Corpo ── */}
        <div className={styles.body}>

          {artist.biography && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Biografia</h2>
              <p className={styles.biography}>{artist.biography}</p>
            </section>
          )}

          {artist.photos && artist.photos.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Fotos</h2>
              <div className={styles.photosGrid}>
                {artist.photos.map((p, i) => (
                  <div
                    key={p.id ?? i}
                    className={styles.photoThumb}
                    onClick={() => setLightbox(p.image)}
                  >
                    <img src={p.image} alt="" loading="lazy" />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ── Lightbox ── */}
        {lightbox && (
          <div className={styles.lbOverlay} onClick={() => setLightbox(null)}>
            <img
              src={lightbox}
              alt=""
              className={styles.lbImg}
              onClick={e => e.stopPropagation()}
            />
            <button className={styles.lbClose} onClick={() => setLightbox(null)}>
              <ArrowLeft size={15} /> Fechar
            </button>
          </div>
        )}
      </div>
    </PublicLayout>
  );
};

export default ArtistDetailPage;
