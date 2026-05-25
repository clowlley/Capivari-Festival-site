import React, { useState, useEffect } from 'react';
import type { Product } from '@/types/product.types';
import { productService } from '@/services/products.service';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/Button';
import styles from './ProductForm.module.css';

interface ProductFormProps {
  product?: Product | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSuccess, onCancel }) => {
  const isEdit = !!product;
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    full_content: '',
    category: '',
    price: '0',
    stock: '0',
    whatsapp: '',
    status: 'draft' as 'draft' | 'published',
    featured: false,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (product) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sync prop -> form state
      setFormData({
        title: product.title,
        description: product.description,
        full_content: product.full_content || '',
        category: product.category || '',
        price: String(product.price),
        stock: String(product.stock),
        whatsapp: product.whatsapp || '',
        status: product.status,
        featured: product.featured,
      });
    }
  }, [product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([k, v]) => {
        if (v !== undefined && v !== null) data.append(k, String(v));
      });
      if (selectedFile) data.append('cover_image_file', selectedFile);

      if (isEdit && product?.id) {
        await productService.updateProduct(product.id, data);
        toast.success('Produto atualizado!');
      } else {
        await productService.createProduct(data);
        toast.success('Produto criado!');
      }
      onSuccess();
    } catch (error) {
      const err = error as { response?: { data?: { error?: string } } };
      toast.error(err.response?.data?.error || 'Erro ao salvar produto.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.grid}>
        <div className={styles.field}>
          <label>Título</label>
          <input name="title" value={formData.title} onChange={handleChange} required />
        </div>
        <div className={styles.field}>
          <label>Categoria</label>
          <input name="category" value={formData.category} onChange={handleChange} placeholder="Ex: Artesanato, Alimentos" />
        </div>
        <div className={styles.field}>
          <label>Preço (R$)</label>
          <input name="price" type="number" min="0" step="0.01" value={formData.price} onChange={handleChange} />
        </div>
        <div className={styles.field}>
          <label>Estoque (unidades)</label>
          <input name="stock" type="number" min="0" step="1" value={formData.stock} onChange={handleChange} />
        </div>
        <div className={styles.field}>
          <label>WhatsApp (DDD + número)</label>
          <input name="whatsapp" value={formData.whatsapp} onChange={handleChange} placeholder="5519999999999" />
        </div>
        <div className={styles.field}>
          <label>Status</label>
          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="draft">Rascunho</option>
            <option value="published">Publicado</option>
          </select>
        </div>
        <div className={styles.checkboxField}>
          <input type="checkbox" id="featured" name="featured" checked={formData.featured} onChange={handleChange} />
          <label htmlFor="featured">Destaque na página inicial</label>
        </div>
      </div>

      <div className={styles.field}>
        <label>Descrição Breve</label>
        <textarea name="description" value={formData.description} onChange={handleChange} rows={3} required />
      </div>
      <div className={styles.field}>
        <label>Conteúdo Completo</label>
        <textarea name="full_content" value={formData.full_content} onChange={handleChange} rows={5} />
      </div>
      <div className={styles.field}>
        <label>Imagem</label>
        <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && setSelectedFile(e.target.files[0])} />
        {isEdit && !selectedFile && product?.cover_image && (
          <p className={styles.helpText}>Deixe vazio para manter a imagem atual.</p>
        )}
      </div>

      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" isLoading={loading}>{isEdit ? 'Atualizar' : 'Criar'}</Button>
      </div>
    </form>
  );
};

export default ProductForm;
