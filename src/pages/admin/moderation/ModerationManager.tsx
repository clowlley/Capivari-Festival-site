import { useEffect, useState, type FC } from 'react';
import { ShieldCheck, Check, X, Clock, Mail, Tag, Plus, Pencil, Trash2, Save, ListChecks } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { communityService } from '@/services/community.service';
import type { PendingTopic, Category } from '@/types/community.types';
import styles from './ModerationManager.module.css';

const fmt = (d: string) =>
  new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

const ModerationManager: FC = () => {
  const toast = useToast();
  const [items, setItems] = useState<PendingTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);

  // Seleção em massa
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);

  // Categorias
  const [categories, setCategories] = useState<Category[]>([]);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      setItems(await communityService.getPendingTopics());
    } catch {
      toast.error('Erro ao carregar pendências.');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      setCategories(await communityService.getCategories());
    } catch {
      toast.error('Erro ao carregar categorias.');
    }
  };

  useEffect(() => {
    load();
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const approve = async (id: number) => {
    setBusy(id);
    try {
      await communityService.approveTopic(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
      toast.success('Tópico aprovado e liberado na comunidade.');
    } catch { toast.error('Erro ao aprovar.'); }
    finally { setBusy(null); }
  };

  const reject = async (id: number) => {
    if (!confirm('Rejeitar e excluir este tópico?')) return;
    setBusy(id);
    try {
      await communityService.rejectTopic(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
      toast.success('Tópico rejeitado.');
    } catch { toast.error('Erro ao rejeitar.'); }
    finally { setBusy(null); }
  };

  // ── Seleção em massa ──
  const toggleSelect = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  const allSelected = items.length > 0 && selected.size === items.length;
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(items.map((i) => i.id)));
  const exitSelect = () => { setSelectMode(false); setSelected(new Set()); };

  const bulkApprove = async () => {
    if (selected.size === 0) return;
    setBulkBusy(true);
    try {
      const ids = [...selected];
      const r = await communityService.bulkApprove(ids);
      setItems((prev) => prev.filter((x) => !selected.has(x.id)));
      setSelected(new Set());
      toast.success(`${r.approved} tópico(s) aprovado(s).`);
    } catch { toast.error('Erro ao aprovar em massa.'); }
    finally { setBulkBusy(false); }
  };

  const bulkReject = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Rejeitar e excluir ${selected.size} tópico(s)?`)) return;
    setBulkBusy(true);
    try {
      const ids = [...selected];
      const r = await communityService.bulkReject(ids);
      setItems((prev) => prev.filter((x) => !selected.has(x.id)));
      setSelected(new Set());
      toast.success(`${r.rejected} tópico(s) rejeitado(s).`);
    } catch { toast.error('Erro ao rejeitar em massa.'); }
    finally { setBulkBusy(false); }
  };

  // ── Categorias ──
  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    try {
      const cat = await communityService.createCategory({ name: newName.trim(), description: newDesc.trim() || undefined });
      setCategories((prev) => [...prev, cat]);
      setNewName('');
      setNewDesc('');
      toast.success('Categoria criada.');
    } catch (err) {
      const e2 = err as { response?: { data?: { error?: string } } };
      toast.error(e2.response?.data?.error || 'Erro ao criar categoria.');
    } finally {
      setAdding(false);
    }
  };

  const startEdit = (c: Category) => {
    setEditingId(c.id);
    setEditName(c.name);
    setEditDesc(c.description ?? '');
  };

  const saveEdit = async (id: number) => {
    if (!editName.trim()) return;
    try {
      const updated = await communityService.updateCategory(id, { name: editName.trim(), description: editDesc.trim() });
      setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
      setEditingId(null);
      toast.success('Categoria atualizada.');
    } catch (err) {
      const e2 = err as { response?: { data?: { error?: string } } };
      toast.error(e2.response?.data?.error || 'Erro ao salvar.');
    }
  };

  const removeCategory = async (c: Category) => {
    const warn = c.topic_count > 0
      ? `A categoria "${c.name}" tem ${c.topic_count} tópico(s). Excluir vai APAGAR esses tópicos também. Continuar?`
      : `Excluir a categoria "${c.name}"?`;
    if (!confirm(warn)) return;
    try {
      await communityService.deleteCategory(c.id);
      setCategories((prev) => prev.filter((x) => x.id !== c.id));
      toast.success('Categoria excluída.');
    } catch { toast.error('Erro ao excluir categoria.'); }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.headIcon}><ShieldCheck size={22} /></div>
        <div>
          <h1 className={styles.title}>Moderação da Comunidade</h1>
          <p className={styles.subtitle}>
            {items.length > 0
              ? `${items.length} tópico(s) aguardando aprovação`
              : 'Nenhuma pendência no momento'}
          </p>
        </div>
      </div>

      {/* ── Gerenciar categorias ── */}
      <section className={styles.panel}>
        <h2 className={styles.panelTitle}><Tag size={16} /> Categorias da comunidade</h2>

        <form className={styles.catForm} onSubmit={addCategory}>
          <input
            className={styles.catInput}
            placeholder="Nome da categoria"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            maxLength={120}
          />
          <input
            className={styles.catInput}
            placeholder="Descrição (opcional)"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
          />
          <button type="submit" className={styles.catAdd} disabled={adding || !newName.trim()}>
            <Plus size={16} /> Adicionar
          </button>
        </form>

        {categories.length === 0 ? (
          <p className={styles.catEmpty}>Nenhuma categoria ainda.</p>
        ) : (
          <ul className={styles.catList}>
            {categories.map((c) => (
              <li key={c.id} className={styles.catRow}>
                {editingId === c.id ? (
                  <div className={styles.catEdit}>
                    <input className={styles.catInput} value={editName} onChange={(e) => setEditName(e.target.value)} maxLength={120} />
                    <input className={styles.catInput} value={editDesc} onChange={(e) => setEditDesc(e.target.value)} placeholder="Descrição (opcional)" />
                    <button className={styles.iconBtn} onClick={() => saveEdit(c.id)} aria-label="Salvar"><Save size={15} /></button>
                    <button className={styles.iconBtn} onClick={() => setEditingId(null)} aria-label="Cancelar"><X size={15} /></button>
                  </div>
                ) : (
                  <>
                    <div className={styles.catMain}>
                      <span className={styles.catName}>{c.name}</span>
                      <span className={styles.catMeta}>
                        <code className={styles.catSlug}>/{c.slug}</code>
                        <span className={styles.catCount}>{c.topic_count} tópico(s)</span>
                        {c.description && <span className={styles.catDesc}>· {c.description}</span>}
                      </span>
                    </div>
                    <div className={styles.catRowActions}>
                      <button className={styles.iconBtn} onClick={() => startEdit(c)} aria-label="Editar"><Pencil size={15} /></button>
                      <button className={`${styles.iconBtn} ${styles.iconDanger}`} onClick={() => removeCategory(c)} aria-label="Excluir"><Trash2 size={15} /></button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── Fila de moderação ── */}
      <h2 className={styles.panelTitle}><ShieldCheck size={16} /> Tópicos aguardando aprovação</h2>

      {items.length > 0 && (
        <div className={styles.modToolbar}>
          <button
            className={`${styles.toggleSel} ${selectMode ? styles.toggleSelOn : ''}`}
            onClick={() => (selectMode ? exitSelect() : setSelectMode(true))}
          >
            <ListChecks size={15} /> {selectMode ? 'Sair da seleção' : 'Seleção em massa'}
          </button>

          {selectMode && (
            <div className={styles.bulkBar}>
              <label className={styles.selAll}>
                <input type="checkbox" checked={allSelected} onChange={toggleAll} />
                Selecionar todos
              </label>
              <span className={styles.selCount}>{selected.size} selecionado(s)</span>
              <button className={styles.reject} disabled={bulkBusy || selected.size === 0} onClick={bulkReject}>
                <X size={15} /> Rejeitar
              </button>
              <button className={styles.approve} disabled={bulkBusy || selected.size === 0} onClick={bulkApprove}>
                <Check size={15} /> Aprovar
              </button>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className={styles.empty}>Carregando…</div>
      ) : items.length === 0 ? (
        <div className={styles.empty}>Tudo limpo! Nenhum tópico pendente. 🎉</div>
      ) : (
        <div className={styles.list}>
          {items.map((t) => (
            <article key={t.id} className={`${styles.card} ${selectMode && selected.has(t.id) ? styles.cardSelected : ''}`}>
              <div className={styles.cardHead}>
                {selectMode && (
                  <input
                    type="checkbox"
                    className={styles.cardCheck}
                    checked={selected.has(t.id)}
                    onChange={() => toggleSelect(t.id)}
                    aria-label="Selecionar tópico"
                  />
                )}
                <div className={styles.avatar}>
                  {t.author_avatar ? <img src={t.author_avatar} alt="" /> : <span>{(t.author_name?.[0] ?? '?').toUpperCase()}</span>}
                </div>
                <div className={styles.meta}>
                  <span className={styles.author}>{t.author_name}</span>
                  <span className={styles.sub}>
                    <Mail size={11} /> {t.author_email}
                    <span className={styles.dot}>·</span>
                    <Clock size={11} /> {fmt(t.created_at)}
                  </span>
                </div>
                <span className={styles.catTag}>{t.category_name}</span>
              </div>

              <h3 className={styles.topicTitle}>{t.title}</h3>
              <p className={styles.content}>{t.content}</p>
              {t.image_url && <img src={t.image_url} alt="" className={styles.image} />}

              <div className={styles.actions}>
                <button className={styles.reject} disabled={busy === t.id} onClick={() => reject(t.id)}>
                  <X size={16} /> Rejeitar
                </button>
                <button className={styles.approve} disabled={busy === t.id} onClick={() => approve(t.id)}>
                  <Check size={16} /> Aprovar
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModerationManager;
