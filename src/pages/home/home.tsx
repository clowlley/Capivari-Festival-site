import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, X, ShoppingBag, DollarSign } from 'lucide-react';
import { eventService } from '@/services/events.service';
import { projectService } from '@/services/projects.service';
import { productService } from '@/services/products.service';
import type { Event } from '@/types/event.types';
import type { Project } from '@/types/project.types';
import type { Product } from '@/types/product.types';
import PublicNavbar from '@/components/layout/PublicNavbar';
import styles from './home.module.css';
import { settingsService } from '@/services/settings.service';

function getYouTubeId(url: string) {
  return url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\s?]+)/)?.[1] ?? null;
}
function getYouTubeEmbed(url: string) {
  const id = getYouTubeId(url);
  if (!id) return null;
  return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&rel=0&modestbranding=1&playsinline=1&vq=hd1080&hd=1`;
}

/* ── helpers ──────────────────────────────────────────────── */
const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

const Hero: React.FC = () => {
  const [videoSrc, setVideoSrc] = useState<string>('');

  useEffect(() => {
    settingsService.get('hero_video')
      .then(v => { if (v) setVideoSrc(v); })
      .catch(() => {});
  }, []);

  return (
  <header className={styles.hero}>
    {videoSrc && (
      getYouTubeEmbed(videoSrc) ? (
        <iframe
          key={videoSrc}
          src={getYouTubeEmbed(videoSrc)!}
          className={styles.heroIframeBg}
          allow="autoplay; encrypted-media"
          allowFullScreen={false}
          title="hero video"
        />
      ) : (
        <video
          key={videoSrc}
          src={videoSrc}
          autoPlay
          muted
          loop
          playsInline
          className={styles.heroVideoBg}
        />
      )
    )}
    <div className={styles.heroVideoBgOverlay} />
    <div className={styles.heroGlow} aria-hidden="true" />
    <div className={styles.heroInner}>
      {/* Texto */}
      <div className={styles.heroLeft}>
        <div className={styles.heroBadge}>
          <span className={styles.heroBadgeDot} />
          Temporada 2025
        </div>

        <h1 className={styles.heroTitle}>
          Capivari
          <span className={styles.heroTitleAccent}>Festival</span>
        </h1>

        <div className={styles.heroDivider} />

        <p className={styles.heroDesc}>
          O portal de eventos, projetos e cultura da região de Capivari.
          Fique por dentro da programação e participe da nossa comunidade.
        </p>

        <div className={styles.heroActions}>
          <a href="/eventos" className={styles.btnPrimary}>Ver eventos →</a>
          <a href="/projetos" className={styles.btnOutline}>Explorar projetos</a>
        </div>
      </div>

    </div>

    {/* Scroll hint */}
    <div className={styles.heroScroll}>
      <div className={styles.heroScrollLine} />
      Scroll
    </div>

    {/* fade para conectar com a section abaixo */}
    <div className={styles.heroFadeBottom} aria-hidden="true" />
  </header>
  );
};

interface EventCardProps { event: Event; index?: number; }
const EventCard: React.FC<EventCardProps> = ({ event }) => (
  <a href={`/eventos/${event.id}`} className={styles.evtCard} style={{ textDecoration: 'none' }}>
    <div className={styles.evtThumb}>
      <img
        src={event.cover_image || 'https://placehold.co/400x280/0d0d1a/b44fff?text=Evento'}
        alt={event.title}
        loading="lazy"
      />
      <div className={styles.evtThumbOverlay} />
      <span className={styles.evtBadgeStar}>★ {new Date(event.starts_at).getFullYear()}</span>
      {event.featured && event.status === 'published' && (
        <span className={styles.evtBadgeTag}>Destaque</span>
      )}
      {event.status === 'completed' && (
        <span className={`${styles.evtBadgeTag} ${styles.evtBadgeTagGreen}`}>Concluído</span>
      )}
      {event.status === 'cancelled' && (
        <span className={styles.evtBadgeTag} style={{ background: 'rgba(239,68,68,0.75)' }}>Cancelado</span>
      )}
    </div>
    <div className={styles.evtInfo}>
      <h3 className={styles.evtTitle}>{event.title}</h3>
      <div className={styles.evtTags}>
        <span className={styles.evtTag}>
          <Calendar size={10} /> {formatDate(event.starts_at)}
        </span>
        {event.location_name && (
          <span className={styles.evtTag}>
            <MapPin size={10} /> {event.location_name}
          </span>
        )}
        <span className={styles.evtTag}>
          <DollarSign size={10} /> {event.price && event.price > 0 ? `R$ ${event.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Gratuito'}
        </span>
      </div>
    </div>
  </a>
);

interface ProjectCardProps { project: Project; index?: number; }
const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => (
  <a href={`/projetos/${project.id}`} className={styles.evtCard} style={{ textDecoration: 'none' }}>
    <div className={styles.evtThumb}>
      <img
        src={project.cover_image || 'https://placehold.co/400x280/2d5e40/f5f0e8?text=Projeto'}
        alt={project.title}
        loading="lazy"
      />
      <div className={styles.evtThumbOverlay} />
      {project.category && <span className={styles.evtBadgeStar}>{project.category}</span>}
    </div>
    <div className={styles.evtInfo}>
      <h3 className={styles.evtTitle}>{project.title}</h3>
      <div className={styles.evtTags}>
        {project.description && (
          <span className={styles.evtTag} style={{ whiteSpace: 'normal', WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {project.description}
          </span>
        )}
      </div>
    </div>
  </a>
);

const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (email.trim()) {
      setSent(true);
    }
  };

  return (
    <div className={styles.newsletter}>
      <div className={styles.newsletterText}>
        <h3 className={styles.newsletterTitle}>
          Fique por dentro de tudo
        </h3>
        <p className={styles.newsletterDesc}>
          Receba na sua caixa de entrada os principais eventos e
          projetos da semana. Sem spam, prometemos.
        </p>
      </div>

      {sent ? (
        <div className={styles.newsletterSent}>
          <div className={styles.newsletterSentMark} />
          <div>
            <strong className={styles.newsletterSentTitle}>Inscrito com sucesso.</strong>
            <p className={styles.newsletterSentDesc}>Você receberá novidades em breve.</p>
          </div>
        </div>
      ) : (
        <form className={styles.newsletterForm} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={styles.newsletterInput}
              required
            />
            <button type="submit" className={styles.btnPrimary}>
              Inscrever
            </button>
          </div>
          <p className={styles.newsletterPrivacy}>
            Seus dados estão seguros. Cancelamento a qualquer momento.
          </p>
        </form>
      )}
    </div>
  );
};

const Footer: React.FC = () => (
  <footer className={styles.footer}>
    <div className={styles.footerTop}>
      <div className={styles.footerBrand}>
        <div className={styles.footerLogo}>
          <span className={styles.footerLogoMark}>
            <span className={styles.footerLogoTriangle} />
          </span>
          <span className={styles.footerLogoText}>Capivari Digital</span>
        </div>
        <p className={styles.footerTagline}>
          Portal oficial de eventos, projetos e gestão da região de
          Capivari. Conectando comunidade e desenvolvimento local.
        </p>
        <div className={styles.footerSocials}>
          <a href="#" className={styles.socialBtn} aria-label="Instagram">IG</a>
          <a href="#" className={styles.socialBtn} aria-label="Facebook">FB</a>
          <a href="#" className={styles.socialBtn} aria-label="YouTube">YT</a>
          <a href="#" className={styles.socialBtn} aria-label="WhatsApp">WA</a>
        </div>
      </div>

      <div className={styles.footerCol}>
        <h4 className={styles.footerColTitle}>Navegação</h4>
        <ul className={styles.footerLinks}>
          <li><a href="/eventos">Eventos</a></li>
          <li><a href="/projetos">Projetos</a></li>
          <li><a href="/galeria">Galeria</a></li>
        </ul>
      </div>

      {/* Serviços — desativado por enquanto
      <div className={styles.footerCol}>
        <h4 className={styles.footerColTitle}>Serviços</h4>
        <ul className={styles.footerLinks}>
          <li><a href="/cadastrar-evento">Divulgar evento</a></li>
          <li><a href="/cadastrar-projeto">Cadastrar projeto</a></li>
          <li><a href="/parceiros">Seja parceiro</a></li>
        </ul>
      </div>
      */}

      <div className={styles.footerCol}>
        <h4 className={styles.footerColTitle}>Sobre</h4>
        <ul className={styles.footerLinks}>
          <li><a href="/sobre">Sobre o portal</a></li>
          <li><a href="/contato">Contato</a></li>
          <li><a href="/privacidade">Privacidade</a></li>
          <li><a href="/termos">Termos de uso</a></li>
        </ul>
      </div>
    </div>

    <div className={styles.footerBottom}>
      <p className={styles.footerCopy}>
        © 2026 Todos os direitos reservados a Caique Villela e Capivari Festival.
      </p>
      <div className={styles.footerBottomLinks}>
        <a href="/privacidade">Privacidade</a>
        <a href="/termos">Termos</a>
        <a href="/acessibilidade">Acessibilidade</a>
      </div>
    </div>
  </footer>
);


/* ══════════════════════════════════════════════════════════
   PRODUCT COMPONENTS
══════════════════════════════════════════════════════════ */
interface ProductCardProps { product: Product; index?: number; onOpen: (p: Product) => void; }
const ProductCard: React.FC<ProductCardProps> = ({ product, onOpen }) => (
  <div className={styles.evtCard} onClick={() => onOpen(product)} style={{ cursor: 'pointer' }}>
    <div className={styles.evtThumb}>
      <img
        src={product.cover_image || 'https://placehold.co/400x280/1b1917/d4a853?text=Produto'}
        alt={product.title}
        loading="lazy"
      />
      <div className={styles.evtThumbOverlay} />
      {product.category && <span className={styles.evtBadgeStar}>{product.category}</span>}
    </div>
    <div className={styles.evtInfo}>
      <h3 className={styles.evtTitle}>{product.title}</h3>
      <div className={styles.evtTags}>
        <span className={styles.evtTag}>
          <DollarSign size={10} /> {Number(product.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </span>
        <span className={styles.evtTag}>
          <ShoppingBag size={10} /> {product.stock > 0 ? `${product.stock} disponíveis` : 'Sem estoque'}
        </span>
      </div>
    </div>
  </div>
);

interface ProductDetailModalProps { product: Product | null; onClose: () => void; onOrder: (p: Product) => void; }
const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose, onOrder }) => {
  if (!product) return null;
  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
        <button className={styles.modalClose} onClick={onClose}><X size={20} /></button>
        {product.cover_image && (
          <div className={styles.modalImgWrap}>
            <img src={product.cover_image} alt={product.title} />
          </div>
        )}
        <div className={styles.modalBody}>
          {product.category && <span className={styles.modalCategory}>{product.category}</span>}
          <h2 className={styles.modalTitle}>{product.title}</h2>
          <div className={styles.modalMeta}>
            <span className={styles.modalPrice}>
              {Number(product.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
            <span className={product.stock > 0 ? styles.prodInStock : styles.prodOutStock}>
              {product.stock > 0 ? `${product.stock} em estoque` : 'Sem estoque'}
            </span>
          </div>
          <p className={styles.modalDesc}>{product.description}</p>
          {product.full_content && <p className={styles.modalFull}>{product.full_content}</p>}
          {product.stock > 0 && (
            <button className={styles.btnPrimary} onClick={() => onOrder(product)}>
              <ShoppingBag size={16} /> Fazer pedido via WhatsApp
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

interface OrderModalProps { product: Product; onClose: () => void; }
const OrderModal: React.FC<OrderModalProps> = ({ product, onClose }) => {
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', cpf: '', cidade: '', observacao: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const price = Number(product.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const msg = encodeURIComponent(
      `*Pedido — ${product.title}*\n\nPreço: ${price}\n\n*Dados do cliente:*\n` +
      `Nome: ${form.nome}\nE-mail: ${form.email}\nTelefone: ${form.telefone}\n` +
      `CPF: ${form.cpf}\nCidade: ${form.cidade}` +
      (form.observacao ? `\n\nObservação: ${form.observacao}` : '')
    );
    window.open(`https://wa.me/${product.whatsapp || '55'}?text=${msg}`, '_blank');
    onClose();
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
        <button className={styles.modalClose} onClick={onClose}><X size={20} /></button>
        <div className={styles.modalBody}>
          <h2 className={styles.modalTitle}>Fazer Pedido</h2>
          <p className={styles.modalDesc}>Produto: <strong>{product.title}</strong></p>
          <form onSubmit={handleSubmit} className={styles.orderForm}>
            <div className={styles.orderGrid}>
              <div className={styles.orderField}>
                <label>Nome completo</label>
                <input name="nome" value={form.nome} onChange={handleChange} required />
              </div>
              <div className={styles.orderField}>
                <label>E-mail</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} required />
              </div>
              <div className={styles.orderField}>
                <label>Telefone</label>
                <input name="telefone" value={form.telefone} onChange={handleChange} required />
              </div>
              <div className={styles.orderField}>
                <label>CPF</label>
                <input name="cpf" value={form.cpf} onChange={handleChange} required />
              </div>
              <div className={`${styles.orderField} ${styles.orderFieldFull}`}>
                <label>Cidade</label>
                <input name="cidade" value={form.cidade} onChange={handleChange} required />
              </div>
              <div className={`${styles.orderField} ${styles.orderFieldFull}`}>
                <label>Observação</label>
                <textarea name="observacao" value={form.observacao} onChange={handleChange} rows={3} />
              </div>
            </div>
            <div className={styles.orderActions}>
              <button type="button" className={styles.btnOutline} onClick={onClose}>Cancelar</button>
              <button type="submit" className={styles.btnPrimary}>Enviar via WhatsApp →</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};


/* ══════════════════════════════════════════════════════════
   HOME PAGE PRINCIPAL
══════════════════════════════════════════════════════════ */
const Home: React.FC = () => {
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [orderProduct, setOrderProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, projectsRes, productsRes] = await Promise.all([
          eventService.getPublicEvents({ upcoming: '1', limit: 3 }),
          projectService.getPublicProjects({ limit: 3 }),
          productService.getPublicProducts({ limit: 6 }),
        ]);
        setFeaturedEvents(eventsRes.data);
        setFeaturedProjects(projectsRes.data.filter((p) => p.featured));
        setProducts(productsRes.data);
      } catch (error) {
        console.error('Erro ao carregar dados da home:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleOrder = (p: Product) => { setSelectedProduct(null); setOrderProduct(p); };

  return (
    <div className={styles.container}>
      <PublicNavbar />
      <Hero />

      <main className={styles.main}>

        {/* EVENTOS EM DESTAQUE */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionMeta}>
              <div className={styles.sectionEyebrow}>
                <span className={styles.sectionEyebrowLine} />
                Agenda
              </div>
              <h2 className={styles.sectionTitle}>Próximos Eventos</h2>
            </div>
            <a href="/eventos" className={styles.sectionLink}>Ver todos os eventos →</a>
          </div>
          {loading ? (
            <div className={styles.loading}><div className={styles.loadingSpinner} /> Carregando...</div>
          ) : (
            <div className={styles.evtRow}>
              {featuredEvents.length > 0
                ? featuredEvents.map((event, i) => <EventCard key={event.id} event={event} index={i} />)
                : <p className={styles.empty}>Não há eventos em destaque no momento.</p>}
            </div>
          )}
        </section>

        {/* PRODUTOS */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionMeta}>
              <div className={styles.sectionEyebrow}>
                <span className={styles.sectionEyebrowLine} />
                Loja
              </div>
              <h2 className={styles.sectionTitle}>Produtos</h2>
            </div>
          </div>
          {loading ? (
            <div className={styles.loading}><div className={styles.loadingSpinner} /> Carregando...</div>
          ) : (
            <div className={styles.evtRow}>
              {products.length > 0
                ? products.map((p, i) => <ProductCard key={p.id} product={p} index={i} onOpen={setSelectedProduct} />)
                : <p className={styles.empty}>Nenhum produto disponível no momento.</p>}
            </div>
          )}
        </section>

        {/* PROJETOS ATIVOS */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionMeta}>
              <div className={styles.sectionEyebrow}>
                <span className={styles.sectionEyebrowLine} />
                Iniciativas
              </div>
              <h2 className={styles.sectionTitle}>Projetos Ativos</h2>
            </div>
            <a href="/projetos" className={styles.sectionLink}>Ver todos os projetos →</a>
          </div>
          {loading ? (
            <div className={styles.loading}><div className={styles.loadingSpinner} /> Carregando...</div>
          ) : (
            <div className={styles.evtRow}>
              {featuredProjects.length > 0
                ? featuredProjects.map((project, i) => <ProjectCard key={project.id} project={project} index={i} />)
                : <p className={styles.empty}>Não há projetos em destaque no momento.</p>}
            </div>
          )}
        </section>

        <Newsletter />
      </main>

      <Footer />

      {selectedProduct && (
        <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onOrder={handleOrder} />
      )}
      {orderProduct && (
        <OrderModal product={orderProduct} onClose={() => setOrderProduct(null)} />
      )}
    </div>
  );
};

export default Home;