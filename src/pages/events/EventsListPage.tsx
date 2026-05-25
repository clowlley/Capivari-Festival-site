import { useState, useEffect, type FC } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Hash, Layers } from 'lucide-react';
import { eventService } from '@/services/events.service';
import type { Event } from '@/types/event.types';
import PublicLayout from '@/components/layout/PublicLayout';
import styles from './EventsListPage.module.css';

type Tab = 'upcoming' | 'all';

const priceLabel = (price?: number) => {
  if (!price || price === 0) return { label: 'Gratuito', free: true };
  return { label: `R$ ${price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, free: false };
};

const EventCard: FC<{ event: Event }> = ({ event }) => {
  const d = new Date(event.starts_at);
  const day = d.toLocaleDateString('pt-BR', { day: '2-digit' });
  const mon = d.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase().replace('.', '');
  const { label, free } = priceLabel(event.price);

  return (
    <Link to={`/eventos/${event.id}`} className={styles.card} style={{ textDecoration: 'none' }}>
      <div className={styles.imageWrap}>
        <img
          src={event.cover_image || 'https://placehold.co/600x400/111009/C9A84C?text=Evento'}
          alt={event.title}
          className={styles.image}
          loading="lazy"
        />
        <div className={styles.imageOverlay} />
        <div className={styles.datePill}>
          <span className={styles.dateDay}>{day}</span>
          <span className={styles.dateMon}>{mon}</span>
        </div>
        {event.status === 'completed' && (
          <span className={`${styles.ribbon} ${styles.ribbonCompleted}`}>Concluído</span>
        )}
        {event.status === 'cancelled' && (
          <span className={`${styles.ribbon} ${styles.ribbonCancelled}`}>Cancelado</span>
        )}
        {event.featured && event.status === 'published' && (
          <span className={styles.featPill}><Star size={11} fill="currentColor" /> Destaque</span>
        )}
      </div>

      <div className={styles.cardBody}>
        <div className={styles.tags}>
          {event.category && <span className={styles.tagCat}><Hash size={9} />{event.category}</span>}
          {event.event_type && <span className={styles.tagType}><Layers size={9} />{event.event_type}</span>}
        </div>

        <h3 className={styles.cardTitle}>{event.title}</h3>

        {event.description && (
          <p className={styles.cardDesc}>{event.description}</p>
        )}

        <div className={styles.sep} />

        <div className={styles.foot}>
          <span className={styles.loc}>
            <MapPin size={13} />
            {event.location_name || 'Local a confirmar'}
          </span>
          <span className={`${styles.price} ${free ? styles.free : ''}`}>{label}</span>
        </div>
      </div>
    </Link>
  );
};

const EventsListPage: FC = () => {
  const [tab, setTab] = useState<Tab>('upcoming');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 9;

  const fetchEvents = async (p: number) => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page: p, limit: LIMIT };
      if (tab === 'upcoming') params.upcoming = '1';
      const res = await eventService.getPublicEvents(params);
      setEvents(res.data);
      setTotal(res.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset + fetch on tab change
    setPage(1);
    fetchEvents(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on page change
    fetchEvents(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <PublicLayout>
    <div className={styles.page}>
      <section className={styles.header}>
        <div className={styles.eyebrow}>Agenda</div>
        <h1 className={styles.title}>Eventos</h1>
        <p className={styles.lead}>Encontros, apresentações e experiências para a comunidade.</p>
        <div className={styles.tabsWrap}>
          <div className={styles.tabs}>
            <button className={`${styles.tab} ${tab === 'upcoming' ? styles.tabActive : ''}`} onClick={() => setTab('upcoming')}>
              Próximos
            </button>
            <button className={`${styles.tab} ${tab === 'all' ? styles.tabActive : ''}`} onClick={() => setTab('all')}>
              Todos
            </button>
          </div>
        </div>
      </section>

      <div className={styles.body}>
        <div className={styles.divider}>
          <span className={styles.divLabel}>{tab === 'upcoming' ? 'Próximos eventos' : 'Todos os eventos'}</span>
          <div className={styles.divLine} />
          <span className={styles.divCount}>{total} evento{total !== 1 ? 's' : ''}</span>
        </div>

        <div className={styles.grid}>
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <div key={i} className={styles.skelCard} />)
          ) : events.length > 0 ? (
            events.map(e => <EventCard key={e.id} event={e} />)
          ) : (
            <p className={styles.empty}>Nenhum evento encontrado.</p>
          )}
        </div>

        {!loading && totalPages > 1 && (
          <div className={styles.pagination}>
            <button className={styles.pageBtn} disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              Anterior
            </button>
            <span className={styles.pageInfo}>{page} / {totalPages}</span>
            <button className={styles.pageBtn} disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
              Próxima
            </button>
          </div>
        )}
      </div>
    </div>
    </PublicLayout>
  );
};

export default EventsListPage;
