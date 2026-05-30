import { useState, useEffect, useCallback, type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Filter, Star, ArrowRight, Play, FolderOpen, AlignLeft } from 'lucide-react';
import { projectService } from '@/services/projects.service';
import type { Project } from '@/types/project.types';
import PublicLayout from '@/components/layout/PublicLayout';
import styles from './ProjectsPage.module.css';

/* ── Card ────────────────────────────────────────────────── */
const ProjectCard: FC<{ project: Project; onOpen: (p: Project) => void }> = ({ project, onOpen }) => (
  <article className={`${styles.card} ${project.featured ? styles.cardFeatured : ''}`} onClick={() => onOpen(project)}>
    <div className={styles.cardImg}>
      <img
        src={project.cover_image || 'https://placehold.co/600x400/131110/d4a853?text=Projeto'}
        alt={project.title}
        loading="lazy"
      />
      <div className={styles.cardOverlay} />
      {project.featured && <span className={styles.featBadge}><Star size={11} fill="currentColor" /> Destaque</span>}
      {project.video_url && <span className={styles.videoBadge}><Play size={11} fill="currentColor" /> Vídeo</span>}
    </div>
    <div className={styles.cardBody}>
      {project.category && <span className={styles.catTag}>{project.category}</span>}
      <h3 className={styles.cardTitle}>
        <FolderOpen size={15} className={styles.cardTitleIcon} />
        {project.title}
      </h3>
      <p className={styles.cardDesc}>
        <AlignLeft size={13} className={styles.cardDescIcon} />
        <span className={styles.cardDescText}>{project.description}</span>
      </p>
    </div>
    <div className={styles.cardFoot}>
      <span className={styles.cardCta}>Ver projeto <ArrowRight size={14} className={styles.cardCtaArrow} /></span>
    </div>
  </article>
);

const Skeleton: FC = () => <div className={styles.skelCard} />;

/* ── Page ────────────────────────────────────────────────── */
const LIMIT = 12;

const ProjectsPage: FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects]         = useState<Project[]>([]);
  const [filtered, setFiltered]         = useState<Project[]>([]);
  const [categories, setCategories]     = useState<string[]>([]);
  const [search, setSearch]             = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading]           = useState(true);
  const [page, setPage]                 = useState(1);

  useEffect(() => {
    projectService.getPublicProjects({ limit: 200 })
      .then(res => {
        setProjects(res.data);
        const cats = Array.from(new Set(res.data.map(p => p.category).filter(Boolean))) as string[];
        setCategories(cats);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const applyFilters = useCallback(() => {
    let list = [...projects];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
      );
    }
    if (activeCategory) list = list.filter(p => p.category === activeCategory);
    setFiltered(list);
    setPage(1);
  }, [projects, search, activeCategory]);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- derive filtered list from inputs
  useEffect(() => { applyFilters(); }, [applyFilters]);

  const paginated  = filtered.slice((page - 1) * LIMIT, page * LIMIT);
  const totalPages = Math.ceil(filtered.length / LIMIT);

  return (
    <PublicLayout>
      <div className={styles.page}>

        <header className={styles.hero}>
          <div className={styles.heroGlow} />
          <p className={styles.heroEye}>Iniciativas</p>
          <h1 className={styles.heroTitle}>Projetos</h1>
          <p className={styles.heroLead}>
            Conheça as iniciativas e projetos que movem Capivari.
          </p>
          <div className={styles.searchWrap}>
            <Search size={16} className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              placeholder="Buscar projeto..."
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

        {categories.length > 0 && (
          <div className={styles.filtersBar}>
            <div className={styles.filtersInner}>
              <Filter size={13} className={styles.filterIcon} />
              <button
                className={`${styles.filterPill} ${!activeCategory ? styles.filterActive : ''}`}
                onClick={() => setActiveCategory(null)}
              >
                Todos
              </button>
              {categories.map(c => (
                <button
                  key={c}
                  className={`${styles.filterPill} ${activeCategory === c ? styles.filterActive : ''}`}
                  onClick={() => setActiveCategory(activeCategory === c ? null : c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className={styles.body}>
          <div className={styles.resultBar}>
            <span className={styles.resultLabel}>Projetos</span>
            <div className={styles.resultLine} />
            <span className={styles.resultCount}>
              {loading ? '...' : `${filtered.length} resultado${filtered.length !== 1 ? 's' : ''}`}
            </span>
          </div>

          <div className={styles.grid}>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)
              : paginated.length > 0
                ? paginated.map(p => <ProjectCard key={p.id} project={p} onOpen={() => navigate(`/projetos/${p.id}`)} />)
                : (
                  <div className={styles.empty}>
                    <p>Nenhum projeto encontrado.</p>
                    <button className={styles.clearFilters} onClick={() => { setSearch(''); setActiveCategory(null); }}>
                      Limpar filtros
                    </button>
                  </div>
                )
            }
          </div>

          {!loading && totalPages > 1 && (
            <div className={styles.pagination}>
              <button className={styles.pageBtn} disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Anterior</button>
              <div className={styles.pageNumbers}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <button key={n} className={`${styles.pageNum} ${n === page ? styles.pageNumActive : ''}`} onClick={() => setPage(n)}>
                    {n}
                  </button>
                ))}
              </div>
              <button className={styles.pageBtn} disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Próxima →</button>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
};

export default ProjectsPage;
