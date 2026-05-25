import { useState, useEffect, type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { galleryService } from '@/services/gallery.service';
import type { Album } from '@/types/gallery.types';
import PublicLayout from '@/components/layout/PublicLayout';
import styles from './GalleryPage.module.css';

const Skeleton: FC = () => <div className={styles.skelCard} />;

const GalleryPage: FC = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    galleryService.getAlbums()
      .then(setAlbums)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <PublicLayout>
      <div className={styles.page}>
        <header className={styles.hero}>
          <div className={styles.heroGlow} />
          <p className={styles.heroEye}>Galeria</p>
          <h1 className={styles.heroTitle}>Álbuns</h1>
          <p className={styles.heroLead}>
            Registros fotográficos dos eventos e momentos de Capivari.
          </p>
        </header>

        <div className={styles.body}>
          <div className={styles.grid}>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)
              : albums.length > 0
                ? albums.map(album => (
                    <article
                      key={album.id}
                      className={styles.card}
                      onClick={() => navigate(`/galeria/${album.id}`)}
                    >
                      <div className={styles.cardImg}>
                        <img
                          src={album.cover_image || 'https://placehold.co/600x400/0d0c0b/d4a853?text=Album'}
                          alt={album.title}
                          loading="lazy"
                        />
                        <div className={styles.cardOverlay}>
                          <span className={styles.viewLabel}>Ver galeria</span>
                        </div>
                      </div>
                      <div className={styles.cardBody}>
                        <h3 className={styles.cardTitle}>{album.title}</h3>
                        {album.event_title && (
                          <span className={styles.eventBadge}>{album.event_title}</span>
                        )}
                      </div>
                    </article>
                  ))
                : (
                  <div className={styles.empty}>
                    <p>Nenhum álbum disponível ainda.</p>
                  </div>
                )
            }
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default GalleryPage;
