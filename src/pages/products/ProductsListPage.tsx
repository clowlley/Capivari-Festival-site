import { useState, useEffect, useCallback, type FC } from 'react';
import { Search, ShoppingBag, X, Filter, Tag, Package, Layers, AlignLeft, Banknote } from 'lucide-react';
import { productService } from '@/services/products.service';
import type { Product } from '@/types/product.types';
import PublicLayout from '@/components/layout/PublicLayout';
import styles from './ProductsListPage.module.css';

/* ── helpers ─────────────────────────────────────────────── */
const fmt = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

/* ── Order Form ──────────────────────────────────────────── */
interface OrderModalProps { product: Product; onClose: () => void; }
const OrderModal: FC<OrderModalProps> = ({ product, onClose }) => {
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', cpf: '', cidade: '', observacao: '' });
  const ch = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const msg = encodeURIComponent(
      `*Pedido — ${product.title}*\nPreço: ${fmt(Number(product.price))}\n\n` +
      `Nome: ${form.nome}\nE-mail: ${form.email}\nTelefone: ${form.telefone}\n` +
      `CPF: ${form.cpf}\nCidade: ${form.cidade}` +
      (form.observacao ? `\n\nObservação: ${form.observacao}` : '')
    );
    window.open(`https://wa.me/${product.whatsapp || '55'}?text=${msg}`, '_blank');
    onClose();
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHead}>
          <div>
            <p className={styles.modalEye}>Pedido via WhatsApp</p>
            <h3 className={styles.modalHTitle}>{product.title}</h3>
          </div>
          <button className={styles.closeBtn} onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={submit} className={styles.orderForm}>
          <div className={styles.oGrid}>
            <div className={styles.oField}>
              <label>Nome completo</label>
              <input name="nome" value={form.nome} onChange={ch} required placeholder="Seu nome" />
            </div>
            <div className={styles.oField}>
              <label>E-mail</label>
              <input type="email" name="email" value={form.email} onChange={ch} required placeholder="seu@email.com" />
            </div>
            <div className={styles.oField}>
              <label>Telefone</label>
              <input name="telefone" value={form.telefone} onChange={ch} required placeholder="(19) 99999-9999" />
            </div>
            <div className={styles.oField}>
              <label>CPF</label>
              <input name="cpf" value={form.cpf} onChange={ch} required placeholder="000.000.000-00" />
            </div>
            <div className={`${styles.oField} ${styles.oFull}`}>
              <label>Cidade</label>
              <input name="cidade" value={form.cidade} onChange={ch} required placeholder="Capivari, SP" />
            </div>
            <div className={`${styles.oField} ${styles.oFull}`}>
              <label>Observação <span>(opcional)</span></label>
              <textarea name="observacao" value={form.observacao} onChange={ch} rows={3} placeholder="Alguma dúvida ou instrução especial..." />
            </div>
          </div>
          <div className={styles.oActions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancelar</button>
            <button type="submit" className={styles.submitBtn}>
              <ShoppingBag size={15} /> Enviar pedido
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ── Product Detail Modal ────────────────────────────────── */
interface DetailModalProps { product: Product; onClose: () => void; onOrder: (p: Product) => void; }
const DetailModal: FC<DetailModalProps> = ({ product, onClose, onOrder }) => (
  <div className={styles.backdrop} onClick={onClose}>
    <div className={`${styles.modal} ${styles.modalDetail}`} onClick={e => e.stopPropagation()}>
      <button className={styles.closeBtn} onClick={onClose}><X size={18} /></button>

      {product.cover_image && (
        <div className={styles.detailImg}>
          <img src={product.cover_image} alt={product.title} />
        </div>
      )}

      <div className={styles.detailBody} style={{ textAlign: 'left' }}>
        <div className={styles.detailMeta} style={{ justifyContent: 'flex-start' }}>
          {product.category && (
            <span className={styles.catPill}><Tag size={10} /> {product.category}</span>
          )}
          <span className={product.stock > 0 ? styles.inStock : styles.outStock}>
            <Package size={10} />
            {product.stock > 0 ? `${product.stock} em estoque` : 'Sem estoque'}
          </span>
        </div>

        <h2 className={styles.detailTitle} style={{ textAlign: 'left' }}>{product.title}</h2>
        <div className={styles.detailPrice} style={{ textAlign: 'left' }}>{fmt(Number(product.price))}</div>

        {product.description && (
          <p className={styles.detailDesc} style={{ textAlign: 'left' }}>{product.description}</p>
        )}

        {product.full_content && (
          <div className={styles.detailFull} style={{ textAlign: 'left' }}>
            <div className={styles.detailFullLabel}>Detalhes do produto</div>
            <p>{product.full_content}</p>
          </div>
        )}

        {product.stock > 0 ? (
          <button className={styles.submitBtn} onClick={() => onOrder(product)}>
            <ShoppingBag size={16} /> Fazer pedido via WhatsApp
          </button>
        ) : (
          <div className={styles.soldOut}>Produto fora de estoque</div>
        )}
      </div>
    </div>
  </div>
);

/* ── Product Card ────────────────────────────────────────── */
interface CardProps { product: Product; onOpen: (p: Product) => void; }
const ProductCard: FC<CardProps> = ({ product, onOpen }) => (
  <article className={styles.card} onClick={() => onOpen(product)}>
    <div className={styles.cardImg}>
      <img
        src={product.cover_image || 'https://placehold.co/600x400/131110/d4a853?text=Produto'}
        alt={product.title}
        loading="lazy"
      />
      <div className={styles.cardOverlay} />
      {product.featured && (
        <span className={styles.featBadge}>Destaque</span>
      )}
    </div>

    <div className={styles.cardBody}>
      <div className={styles.cardTags}>
        {product.category
          ? <span className={styles.catTag}><Tag size={10} />{product.category}</span>
          : <span />
        }
        <span className={product.stock > 0 ? styles.stockBadge : styles.stockBadgeOut}>
          <Package size={10} />{product.stock > 0 ? `${product.stock} un.` : 'Esgotado'}
        </span>
      </div>
      <h3 className={styles.cardTitle}><Layers size={13} /><span>{product.title}</span></h3>
      {product.description && (
        <p className={styles.cardDesc}><AlignLeft size={12} /><span>{product.description}</span></p>
      )}
    </div>

    <div className={styles.cardFoot}>
      <span className={styles.cardPrice}><Banknote size={16} />{fmt(Number(product.price))}</span>
      <span className={styles.cardCta}>
        {product.stock > 0 ? 'Ver detalhes →' : 'Indisponível'}
      </span>
    </div>
  </article>
);

/* ── Skeleton ────────────────────────────────────────────── */
const Skeleton: FC = () => <div className={styles.skelCard} />;

/* ── Page ────────────────────────────────────────────────── */
const LIMIT = 12;

const ProductsListPage: FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [stockFilter, setStockFilter] = useState<'all' | 'available'>('all');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<Product | null>(null);
  const [order, setOrder] = useState<Product | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await productService.getPublicProducts({ limit: 200 });
        setProducts(res.data);
        const cats = Array.from(new Set(res.data.map(p => p.category).filter(Boolean))) as string[];
        setCategories(cats);
      } catch { /* silent */ }
      finally { setLoading(false); }
    })();
  }, []);

  const applyFilters = useCallback(() => {
    let list = [...products];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
      );
    }
    if (activeCategory) list = list.filter(p => p.category === activeCategory);
    if (stockFilter === 'available') list = list.filter(p => p.stock > 0);
    setFiltered(list);
    setPage(1);
  }, [products, search, activeCategory, stockFilter]);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- derive filtered list from inputs
  useEffect(() => { applyFilters(); }, [applyFilters]);

  const paginated = filtered.slice((page - 1) * LIMIT, page * LIMIT);
  const totalPages = Math.ceil(filtered.length / LIMIT);

  const handleOrder = (p: Product) => { setDetail(null); setOrder(p); };

  return (
    <PublicLayout>
      <div className={styles.page}>

        {/* ── Hero Header ── */}
        <header className={styles.hero}>
          <div className={styles.heroGlow} />
          <p className={styles.heroEye}>Loja</p>
          <h1 className={styles.heroTitle}>Produtos</h1>
          <p className={styles.heroLead}>
            Artesanato, gastronomia e criações locais da região de Capivari.
          </p>

          {/* Search */}
          <div className={styles.searchWrap}>
            <Search size={16} className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              placeholder="Buscar produto..."
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

        {/* ── Filters bar ── */}
        <div className={styles.filtersBar}>
          <div className={styles.filtersInner}>
            <div className={styles.filterGroup}>
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

            <div className={styles.stockToggle}>
              <button
                className={`${styles.filterPill} ${stockFilter === 'all' ? styles.filterActive : ''}`}
                onClick={() => setStockFilter('all')}
              >
                Todos
              </button>
              <button
                className={`${styles.filterPill} ${stockFilter === 'available' ? styles.filterActive : ''}`}
                onClick={() => setStockFilter('available')}
              >
                Disponíveis
              </button>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className={styles.body}>
          <div className={styles.resultBar}>
            <span className={styles.resultLabel}>Produtos</span>
            <div className={styles.resultLine} />
            <span className={styles.resultCount}>
              {loading ? '...' : `${filtered.length} resultado${filtered.length !== 1 ? 's' : ''}`}
            </span>
          </div>

          <div className={styles.grid}>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)
              : paginated.length > 0
                ? paginated.map(p => <ProductCard key={p.id} product={p} onOpen={setDetail} />)
                : (
                  <div className={styles.empty}>
                    <Package size={40} className={styles.emptyIcon} />
                    <p>Nenhum produto encontrado.</p>
                    <button className={styles.clearFilters} onClick={() => { setSearch(''); setActiveCategory(null); setStockFilter('all'); }}>
                      Limpar filtros
                    </button>
                  </div>
                )
            }
          </div>

          {!loading && totalPages > 1 && (
            <div className={styles.pagination}>
              <button className={styles.pageBtn} disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                ← Anterior
              </button>
              <div className={styles.pageNumbers}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <button
                    key={n}
                    className={`${styles.pageNum} ${n === page ? styles.pageNumActive : ''}`}
                    onClick={() => setPage(n)}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <button className={styles.pageBtn} disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                Próxima →
              </button>
            </div>
          )}
        </div>
      </div>

      {detail && <DetailModal product={detail} onClose={() => setDetail(null)} onOrder={handleOrder} />}
      {order && <OrderModal product={order} onClose={() => setOrder(null)} />}
    </PublicLayout>
  );
};

export default ProductsListPage;
