import { type FC, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, DollarSign, Star, ArrowLeft } from 'lucide-react';
import { eventService } from '@/services/events.service';
import type { Event } from '@/types/event.types';
import PublicLayout from '@/components/layout/PublicLayout';
import { safeUrl } from '@/utils/security';
import styles from './EventDetailPage.module.css';

const PLACEHOLDER = 'https://placehold.co/1400x700/08080f/b44fff?text=Evento';

const formatDateTime = (d?: string) => {
  if (!d) return '';
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return '';
  return dt.toLocaleString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const priceLabel = (price?: number) => {
  if (!price || price === 0) return 'Gratuito';
  return `R$ ${price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
};

const EventDetailPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on id change
    if (!id) { setNotFound(true); setLoading(false); return; }
    setLoading(true);
    eventService.getPublicEventById(id)
      .then(res => setEvent(res.data))
      .catch(err => {
        if (err?.response?.status === 404) setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <PublicLayout>
        <div className={styles.page}>
          <div className={styles.center}>Carregando...</div>
        </div>
      </PublicLayout>
    );
  }

  if (notFound || !event) {
    return (
      <PublicLayout>
        <div className={styles.page}>
          <div className={styles.center}>
            <h1 style={{ fontFamily: 'Inter, sans-serif', color: '#b44fff', margin: 0 }}>Evento não encontrado</h1>
            <p style={{ color: 'rgba(255,255,255,0.45)', margin: 0 }}>O evento pode ter sido removido ou o link está inválido.</p>
            <Link to="/eventos" className={styles.cta} style={{ marginTop: '16px' }}>Ver todos os eventos</Link>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className={styles.page}>

        {/* ── HERO ── */}
        <div className={styles.hero}>
          <div className={styles.heroBg}>
            <img
              src={event.cover_image || PLACEHOLDER}
              alt={event.title}
              className={styles.heroImg}
              loading="eager"
              decoding="async"
            />
            <div className={styles.heroOverlay} />
            <div className={styles.heroGlow} />
            <div className={styles.heroFadeBottom} />
          </div>

          <div className={styles.heroInner}>

            {/* TOP — navegação + badges */}
            <div className={styles.heroTop}>
              <div className={styles.topRow}>
                <Link to="/eventos" className={styles.back}>
                  <ArrowLeft size={14} /> Eventos
                </Link>
                <div className={styles.breadcrumbs}>
                  <Link to="/">Home</Link>
                  <span className={styles.sep}>/</span>
                  <Link to="/eventos">Eventos</Link>
                  <span className={styles.sep}>/</span>
                  <span className={styles.current}>{event.title}</span>
                </div>
              </div>
              <div className={styles.badges}>
                {event.category && (
                  <span className={styles.badge}>
                    <span className={styles.badgeText}>{event.category}</span>
                  </span>
                )}
                {event.event_type && (
                  <span className={styles.badge2}>
                    <span className={styles.badgeText}>{event.event_type}</span>
                  </span>
                )}
                {event.featured && (
                  <span className={styles.badgeFeat}>
                    <Star size={12} fill="#00ff88" color="#00ff88" />
                    <span className={styles.badgeText}>Destaque</span>
                  </span>
                )}
              </div>
            </div>

            {/* BOTTOM — título+chips esquerda  |  price card direita */}
            <div className={styles.heroBottom}>
              <div className={styles.heroBottomLeft}>
                <h1 className={styles.heroTitle}>{event.title}</h1>
                <div className={styles.meta}>
                  {event.starts_at && (
                    <span className={styles.metaItem}><Calendar size={15} /> {formatDateTime(event.starts_at)}</span>
                  )}
                  {event.ends_at && (
                    <span className={styles.metaItem}><Clock size={15} /> até {formatDateTime(event.ends_at)}</span>
                  )}
                  {event.location_name && (
                    <span className={styles.metaItem}><MapPin size={15} /> {event.location_name}</span>
                  )}
                </div>
              </div>

              <div className={styles.priceCard}>
                <DollarSign size={16} />
                <span className={styles.priceCardValue}>{priceLabel(event.price)}</span>
              </div>
            </div>

          </div>
        </div>

        {/* ── CONTENT ── */}
        <div className={styles.contentWrap}>
          <div className={styles.contentInner}>

            {event.description && (
              <p className={styles.desc}>{event.description}</p>
            )}

            {event.full_content?.trim() && (
              <div className={styles.fullContent}>
                <h2 className={styles.sectionTitle}>Detalhes</h2>
                <p className={styles.fullText}>{event.full_content}</p>
              </div>
            )}

            {event.registration_url && (
              <div className={styles.ctaRow}>
                <a
                  href={safeUrl(event.registration_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.cta}
                >
                  Inscrever / Acessar
                </a>
              </div>
            )}

          </div>
        </div>

      </div>
    </PublicLayout>
  );
};

export default EventDetailPage;
