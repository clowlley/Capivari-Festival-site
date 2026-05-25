import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2 } from 'lucide-react';
import { productService } from '@/services/products.service';
import type { Product } from '@/types/product.types';
import { useToast } from '@/hooks/useToast';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import ProductForm from './ProductForm';
import styles from './ProductsManager.module.css';

const statusClass: Record<string, string> = {
  draft: styles.draft,
  published: styles.published,
};

const statusLabel: Record<string, string> = {
  draft: 'Rascunho',
  published: 'Publicado',
};

const ProductsManager: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const toast = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await productService.getAdminProducts();
      setProducts(data);
    } catch {
      toast.error('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps -- bootstrap on mount
  useEffect(() => { loadData(); }, []);

  const handleNew = () => { setEditing(null); setIsModalOpen(true); };
  const handleEdit = (p: Product) => { setEditing(p); setIsModalOpen(true); };
  const handleClose = () => { setIsModalOpen(false); setEditing(null); };
  const handleSuccess = () => { handleClose(); loadData(); };

  const handleDelete = async (id: number) => {
    if (!confirm('Excluir este produto?')) return;
    try {
      await productService.deleteProduct(id);
      toast.success('Produto removido');
      loadData();
    } catch {
      toast.error('Erro ao remover produto');
    }
  };

  const formatPrice = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Produtos</h1>
        <Button onClick={handleNew}><Plus size={16} /> Novo Produto</Button>
      </div>

      <div className={styles.tableCard}>
        {loading ? (
          <p className={styles.loading}>Carregando...</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Título</th>
                <th>Categoria</th>
                <th>Preço</th>
                <th>Estoque</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td className={styles.tdTitle}>{p.title}</td>
                  <td>{p.category || '-'}</td>
                  <td>{formatPrice(Number(p.price))}</td>
                  <td>
                    <span className={p.stock > 0 ? styles.inStock : styles.outOfStock}>
                      {p.stock > 0 ? `${p.stock} un.` : 'Sem estoque'}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.statusTag} ${statusClass[p.status] ?? ''}`}>
                      {statusLabel[p.status] ?? p.status}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button onClick={() => handleEdit(p)} title="Editar"><Edit3 size={15} /></button>
                      <button className={styles.danger} onClick={() => handleDelete(p.id)} title="Excluir"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan={6} className={styles.empty}>Nenhum produto cadastrado.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={handleClose} title={editing ? 'Editar Produto' : 'Novo Produto'}>
        <ProductForm product={editing} onSuccess={handleSuccess} onCancel={handleClose} />
      </Modal>
    </div>
  );
};

export default ProductsManager;
