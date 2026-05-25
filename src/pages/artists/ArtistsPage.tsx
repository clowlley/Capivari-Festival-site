import { useState, useEffect, type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { artistsService } from '@/services/artists.service';
import type { Artist } from '@/types/artist.types';
import PublicLayout from '@/components/layout/PublicLayout';
import styles from './ArtistsPage.module.css';

const Skeleton: FC = () => <div className={styles.skelCard} />;

const ArtistCard: FC<{ artist: Artist }> = ({ artist }) => {
  const navigate = useNavigate();
  const styles2 = styles;
  const tags = artist.musical_styles
    ? artist.musical_styles.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  return (
    <article className={styles2.card} onClick={() => navigate(`/artistas/${artist.id}`)}>
      {/* cover como fundo absoluto do card inteiro */}
      <div className={styles2.cardCoverBg}>
        <img
          src={artist.cover_image || 'https://placehold.co/600x800/0a0a12/b44fff?text='}
          alt=""
        />
        <div className={styles2.coverDim} />
      </div>

      {/* badge acima de tudo */}
      {artist.featured && <span className={styles2.featBadge}>★ Destaque</span>}

      {/* foto de perfil: inset nas bordas, fade embaixo revelando a capa */}
      {artist.profile_image ? (
        <div className={styles2.profileSection}>
          <img src={artist.profile_image} alt={artist.name} loading="lazy" />
        </div>
      ) : (
        <div className={styles2.profileSpacer} />
      )}

      {/* texto abaixo da foto de perfil, left-aligned */}
      <div className={styles2.cardInfo}>
        <h3 className={styles2.cardName}>{artist.name}</h3>
        {artist.project_name && (
          <p className={styles2.cardProject}>{artist.project_name}</p>
        )}
        {tags.length > 0 && (
          <div className={styles2.cardTags}>
            {tags.slice(0, 3).map((t, i) => <span key={i} className={styles2.tag}>{t}</span>)}
          </div>
        )}
      </div>
    </article>
  );
};

const ArtistsPage: FC = () => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [filtered, setFiltered] = useState<Artist[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    artistsService.getPublicArtists()
      .then(data => { setArtists(data); setFiltered(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- derive filtered list from search/artists
    if (!search.trim()) { setFiltered(artists); return; }
    const q = search.toLowerCase();
    setFiltered(artists.filter(a =>
      a.name.toLowerCase().includes(q) ||
      a.project_name?.toLowerCase().includes(q) ||
      a.musical_styles?.toLowerCase().includes(q)
    ));
  }, [search, artists]);

  return (
    <PublicLayout>
      <div className={styles.page}>
        <header className={styles.hero}>
          <div className={styles.heroGlow} />
          <p className={styles.heroEye}>Cultura</p>
          <h1 className={styles.heroTitle}>Artistas</h1>
          <p className={styles.heroLead}>Conheça os artistas que fazem parte do festival.</p>
          <div className={styles.searchWrap}>
            <Search size={16} className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              placeholder="Buscar artista, estilo..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className={styles.searchClear} onClick={() => setSearch('')}>
                <X size={14} />
              </button>
            )}
          </div>
        </header>

        <div className={styles.body}>
          <div className={styles.resultBar}>
            <span className={styles.resultLabel}>Artistas</span>
            <div className={styles.resultLine} />
            <span className={styles.resultCount}>
              {loading ? '...' : `${filtered.length} artista${filtered.length !== 1 ? 's' : ''}`}
            </span>
          </div>

          <div className={styles.grid}>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)
              : filtered.length > 0
                ? filtered.map(a => <ArtistCard key={a.id} artist={a} />)
                : (
                  <div className={styles.empty}>
                    <p>Nenhum artista encontrado.</p>
                    {search && (
                      <button className={styles.clearBtn} onClick={() => setSearch('')}>Limpar busca</button>
                    )}
                  </div>
                )
            }
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default ArtistsPage;
