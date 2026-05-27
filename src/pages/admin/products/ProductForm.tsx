import React, { useState, useEffect } from 'react';
import type { Product, ProductPhoto } from '@/types/product.types';
import { productService } from '@/services/products.service';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/Button';
import { onlyDigits, formatPhone } from '@/utils/formatters';
import { validatePhone } from '@/utils/validators';
import styles from './ProductForm.module.css';

const MAX_PHOTOS = 50;

interface ProductFormProps {
  product?: Product | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const LIMITS = {
  title: { min: 3, max: 150 },
  category: { max: 80 },
  description: { min: 10, max: 500 },
  full_content: { max: 5000 },
  price: { min: 0, max: 9_999_999.99 },
  stock: { min: 0, max: 999_999 },
} as const;

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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [existingPhotos, setExistingPhotos] = useState<ProductPhoto[]>([]);
  const [newPhotoFiles, setNewPhotoFiles] = useState<File[]>([]);

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
        whatsapp: product.whatsapp ? formatPhone(product.whatsapp) : '',
        status: product.status,
        featured: product.featured,
      });
      setExistingPhotos(product.photos || []);
      setNewPhotoFiles([]);
    }
  }, [product]);

  const totalPhotos = existingPhotos.length + newPhotoFiles.length;
  const canAddMorePhotos = totalPhotos < MAX_PHOTOS;

  const handleAddPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const remaining = MAX_PHOTOS - totalPhotos;
    setNewPhotoFiles(prev => [...prev, ...files.slice(0, remaining)]);
    e.target.value = '';
  };

  const removeNewPhoto = (idx: number) => {
    setNewPhotoFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const removeExistingPhoto = async (photoId: number) => {
    if (!confirm('Remover esta foto?')) return;
    try {
      await productService.deleteProductPhoto(photoId);
      setExistingPhotos(prev => prev.filter(p => p.id !== photoId));
      toast.success('Foto removida');
    } catch {
      toast.error('Erro ao remover foto');
    }
  };

  const setField = (name: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // Handlers específicos
  const handleText = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, maxLength } = e.target;
    const clipped = maxLength > 0 ? value.slice(0, maxLength) : value;
    setField(name, clipped);
  };

  const handlePrice = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/[^\d.,]/g, '').replace(',', '.');
    const firstDot = v.indexOf('.');
    if (firstDot !== -1) {
      v = v.slice(0, firstDot + 1) + v.slice(firstDot + 1).replace(/\./g, '');
    }
    if (firstDot !== -1 && v.length > firstDot + 3) v = v.slice(0, firstDot + 3);
    setField('price', v);
  };

  const handleStock = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = onlyDigits(e.target.value).slice(0, 6);
    setField('stock', digits);
  };

  const handleWhatsApp = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = onlyDigits(e.target.value).slice(0, 11);
    setField('whatsapp', formatPhone(digits));
  };

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    setField(e.target.name, e.target.checked);
  };

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setField(e.target.name, e.target.value);
  };

  // Validação
  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    const title = formData.title.trim();
    if (title.length < LIMITS.title.min) errs.title = `Mínimo ${LIMITS.title.min} caracteres`;
    else if (title.length > LIMITS.title.max) errs.title = `Máximo ${LIMITS.title.max} caracteres`;

    if (formData.category.length > LIMITS.category.max) errs.category = `Máximo ${LIMITS.category.max} caracteres`;

    const price = parseFloat(formData.price);
    if (isNaN(price) || price < LIMITS.price.min) errs.price = 'Preço inválido';
    else if (price > LIMITS.price.max) errs.price = 'Preço acima do permitido';

    const stock = parseInt(formData.stock || '0', 10);
    if (isNaN(stock) || stock < LIMITS.stock.min) errs.stock = 'Estoque inválido';
    else if (stock > LIMITS.stock.max) errs.stock = 'Estoque acima do permitido';

    if (formData.whatsapp) {
      if (!validatePhone(formData.whatsapp)) {
        errs.whatsapp = 'Telefone inválido — use DDD + número (10 ou 11 dígitos)';
      }
    }

    const desc = formData.description.trim();
    if (desc.length < LIMITS.description.min) errs.description = `Mínimo ${LIMITS.description.min} caracteres`;
    else if (desc.length > LIMITS.description.max) errs.description = `Máximo ${LIMITS.description.max} caracteres`;

    if (formData.full_content.length > LIMITS.full_content.max) {
      errs.full_content = `Máximo ${LIMITS.full_content.max} caracteres`;
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Corrija os campos destacados');
      return;
    }
    setLoading(true);
    try {
      const data = new FormData();
      data.append('title', formData.title.trim());
      data.append('description', formData.description.trim());
      data.append('full_content', formData.full_content.trim());
      data.append('category', formData.category.trim());
      data.append('price', String(parseFloat(formData.price) || 0));
      data.append('stock', String(parseInt(formData.stock || '0', 10)));
      data.append('whatsapp', onlyDigits(formData.whatsapp));
      data.append('status', formData.status);
      data.append('featured', String(formData.featured));
      if (selectedFile) data.append('cover_image_file', selectedFile);
      newPhotoFiles.forEach(f => data.append('photo_files', f));

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

  // Helpers de render
  const errClass = (field: string) => errors[field] ? styles.inputError : '';
  const counterFor = (field: keyof typeof formData, max: number) => (
    <span className={styles.counter}>
      {String(formData[field]).length}/{max}
    </span>
  );

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>
      <div className={styles.grid}>
        <div className={styles.field}>
          <label>
            Título <span className={styles.req}>*</span>
            {counterFor('title', LIMITS.title.max)}
          </label>
          <input
            name="title"
            value={formData.title}
            onChange={handleText}
            maxLength={LIMITS.title.max}
            placeholder="Nome do produto"
            className={errClass('title')}
          />
          {errors.title && <small className={styles.err}>{errors.title}</small>}
        </div>

        <div className={styles.field}>
          <label>
            Categoria
            {counterFor('category', LIMITS.category.max)}
          </label>
          <input
            name="category"
            value={formData.category}
            onChange={handleText}
            maxLength={LIMITS.category.max}
            placeholder="Ex: Artesanato, Alimentos"
            className={errClass('category')}
          />
          {errors.category && <small className={styles.err}>{errors.category}</small>}
        </div>

        <div className={styles.field}>
          <label>Preço (R$) <span className={styles.req}>*</span></label>
          <input
            name="price"
            inputMode="decimal"
            value={formData.price}
            onChange={handlePrice}
            placeholder="0.00"
            className={errClass('price')}
          />
          {errors.price && <small className={styles.err}>{errors.price}</small>}
        </div>

        <div className={styles.field}>
          <label>Estoque (unidades) <span className={styles.req}>*</span></label>
          <input
            name="stock"
            inputMode="numeric"
            value={formData.stock}
            onChange={handleStock}
            placeholder="0"
            className={errClass('stock')}
          />
          {errors.stock && <small className={styles.err}>{errors.stock}</small>}
        </div>

        <div className={styles.field}>
          <label>WhatsApp (DDD + número)</label>
          <input
            name="whatsapp"
            inputMode="tel"
            value={formData.whatsapp}
            onChange={handleWhatsApp}
            placeholder="(00) 00000-0000"
            maxLength={15}
            className={errClass('whatsapp')}
          />
          {errors.whatsapp && <small className={styles.err}>{errors.whatsapp}</small>}
        </div>

        <div className={styles.field}>
          <label>Status</label>
          <select name="status" value={formData.status} onChange={handleSelect}>
            <option value="draft">Rascunho</option>
            <option value="published">Publicado</option>
          </select>
        </div>

        <div className={styles.checkboxField}>
          <input type="checkbox" id="featured" name="featured" checked={formData.featured} onChange={handleCheckbox} />
          <label htmlFor="featured">Destaque na página inicial</label>
        </div>
      </div>

      <div className={styles.field}>
        <label>
          Descrição Breve <span className={styles.req}>*</span>
          {counterFor('description', LIMITS.description.max)}
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleText}
          maxLength={LIMITS.description.max}
          rows={3}
          placeholder={`Resumo curto do produto (${LIMITS.description.min}-${LIMITS.description.max} caracteres)`}
          className={errClass('description')}
        />
        {errors.description && <small className={styles.err}>{errors.description}</small>}
      </div>

      <div className={styles.field}>
        <label>
          Conteúdo Completo
          {counterFor('full_content', LIMITS.full_content.max)}
        </label>
        <textarea
          name="full_content"
          value={formData.full_content}
          onChange={handleText}
          maxLength={LIMITS.full_content.max}
          rows={5}
          placeholder="Detalhes, materiais, observações..."
          className={errClass('full_content')}
        />
        {errors.full_content && <small className={styles.err}>{errors.full_content}</small>}
      </div>

      <div className={styles.field}>
        <label>Foto principal (capa)</label>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={e => e.target.files?.[0] && setSelectedFile(e.target.files[0])}
        />
        {isEdit && !selectedFile && product?.cover_image && (
          <p className={styles.helpText}>Deixe vazio para manter a imagem atual.</p>
        )}
      </div>

      <div className={styles.field}>
        <label>
          Fotos extras de demonstração
          <span className={styles.counter}>{totalPhotos}/{MAX_PHOTOS}</span>
        </label>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          onChange={handleAddPhotos}
          disabled={!canAddMorePhotos}
        />
        <p className={styles.helpText}>
          Você pode adicionar várias imagens de uma vez. As 3 primeiras aparecem como prévia no site público.
        </p>
        {(existingPhotos.length > 0 || newPhotoFiles.length > 0) && (
          <div className={styles.photoGallery}>
            {existingPhotos.map(p => (
              <div key={`exist-${p.id}`} className={styles.photoThumb}>
                <img src={p.image} alt="" />
                <button
                  type="button"
                  className={styles.photoRemove}
                  onClick={() => removeExistingPhoto(p.id)}
                  title="Remover"
                >×</button>
              </div>
            ))}
            {newPhotoFiles.map((f, i) => (
              <div key={`new-${i}`} className={`${styles.photoThumb} ${styles.photoNew}`}>
                <img src={URL.createObjectURL(f)} alt="" />
                <button
                  type="button"
                  className={styles.photoRemove}
                  onClick={() => removeNewPhoto(i)}
                  title="Remover"
                >×</button>
              </div>
            ))}
          </div>
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
