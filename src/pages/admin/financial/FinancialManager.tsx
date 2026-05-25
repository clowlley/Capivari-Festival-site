import  React,  { useState, useEffect, type FC, useMemo }  from 'react';
import {
  Search, Plus, Edit3, Trash2, ArrowUpCircle, ArrowDownCircle,
  Wallet, AlertCircle, X, MessageSquare,
  User, DollarSign
} from 'lucide-react';
import { financialService } from '@/services/financial.service';
import type { FinancialEntry } from '@/types/financial.types';
import { useToast } from '@/hooks/useToast';
import { CustomSelect } from '@/components/ui/CustomSelect';
import styles from './FinancialManager.module.css';

const CATEGORIES = [
  'Artista', 'Estrutura', 'Som', 'Luz', 'Segurança', 
  'Marketing', 'Staff', 'Bebidas', 'Alimentação', 
  'Transporte', 'Hospedagem', 'Licenças', 'Outros'
];

const FinancialManager: FC = () => {
  const [entries, setEntries] = useState<FinancialEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [commentingEntry, setCommentingEntry] = useState<FinancialEntry | null>(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddType, setQuickAddType] = useState<'entrada' | 'saida'>('entrada');
  const [quickAmount, setQuickAmount] = useState('');

  const toast = useToast();

  const [form, setForm] = useState<Partial<FinancialEntry>>({
    name: '', 
    description: '', 
    category: 'Outros', 
    type: 'saida',
    amount: '', 
    payment_status: 'pendente', 
    date: new Date().toISOString().split('T')[0], 
    responsible: 'Administrador', 
    priority: 'media', 
    notes: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await financialService.getEntries();
      setEntries(data || []);
    } catch {
      toast.error("Erro ao carregar dados financeiros");
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps -- bootstrap on mount
  useEffect(() => { loadData(); }, []);

  const stats = useMemo(() => {
    return entries.reduce((acc, cur) => {
      const val = Number(cur.amount);
      if (cur.type === 'entrada') acc.entradas += val;
      else acc.saidas += val;
      if (cur.payment_status === 'pago') acc.pago += val;
      if (cur.payment_status === 'pendente') acc.pendente += val;
      acc.saldo = acc.entradas - acc.saidas;
      return acc;
    }, { entradas: 0, saidas: 0, saldo: 0, pago: 0, pendente: 0 });
  }, [entries]);

  const filteredEntries = entries.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = filterCategory === 'all' || e.category === filterCategory;
    return matchesSearch && matchesCat;
  });

  const handleOpenNew = (type: 'entrada' | 'saida' = 'saida') => {
    setEditingId(null);
    setForm({
      name: '', description: '', category: 'Outros', type, 
      amount: '', payment_status: 'pendente', date: new Date().toISOString().split('T')[0], 
      responsible: '', priority: 'media', notes: ''
    });
    setIsModalOpen(true);
  };

  const handleEdit = (entry: FinancialEntry) => {
    setEditingId(entry.id);
    setForm({ 
      ...entry, 
      amount: entry.amount.toString(), 
      date: entry.date.split('T')[0] 
    });
    setIsModalOpen(true);
  };

  const handleOpenComment = (entry: FinancialEntry) => {
    setCommentingEntry(entry);
    setNewCommentText('');
    setIsCommentModalOpen(true);
  };

  const handleSaveComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentingEntry || !newCommentText.trim()) return;

    const now = new Date();
    const timestamp = now.toLocaleString('pt-BR', { 
      day: '2-digit', month: '2-digit', year: '2-digit', 
      hour: '2-digit', minute: '2-digit' 
    });
    
    const formattedNewComment = `• ${timestamp}: ${newCommentText.trim()}`;
    
    const updatedNotes = commentingEntry.notes 
      ? `${commentingEntry.notes}\n${formattedNewComment}`
      : formattedNewComment;

    try {
      await financialService.updateEntry(commentingEntry.id, { 
        ...commentingEntry, 
        notes: updatedNotes 
      });
      toast.success("Comentário adicionado");
      setIsCommentModalOpen(false);
      setNewCommentText('');
      loadData();
    } catch {
      toast.error("Erro ao salvar comentário");
    }
  };

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(quickAmount);
    if (isNaN(val) || val <= 0) {
      toast.error("Insira um valor válido");
      return;
    }

    try {
      const payload: Partial<FinancialEntry> = {
        name: quickAddType === 'entrada' ? 'Aporte de Saldo' : 'Retirada de Saldo',
        category: 'Outros',
        type: quickAddType,
        amount: val,
        payment_status: 'pago',
        date: new Date().toISOString().split('T')[0],
        responsible: 'Administrador',
      };
      await financialService.createEntry(payload);
      toast.success(quickAddType === 'entrada' ? "Saldo somado!" : "Gasto registrado!");
      setIsQuickAddOpen(false);
      setQuickAmount('');
      loadData();
    } catch {
      toast.error("Erro ao processar operação");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        amount: parseFloat(form.amount as string)
      };

      if (editingId) {
        await financialService.updateEntry(editingId, payload);
        toast.success("Atualizado com sucesso");
      } else {
        await financialService.createEntry(payload);
        toast.success("Lançamento criado");
      }
      setIsModalOpen(false);
      setEditingId(null);
      loadData();
    } catch {
      toast.error("Erro ao salvar lançamento");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Excluir este lançamento?")) return;
    try {
      await financialService.deleteEntry(id);
      toast.success("Removido");
      loadData();
    } catch {
      toast.error("Erro ao remover");
    }
  };

  const formatCurrencyLocal = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className={styles.container}>
      <div className={styles.statsGrid}>
        <div 
          className={`${styles.statCard} ${styles.clickableCard}`}
          onClick={() => {
            setQuickAddType('entrada');
            setIsQuickAddOpen(true);
          }}
          title="Clique no valor para adicionar mais saldo"
        >
          <ArrowUpCircle className={styles.textGreen} size={32} />
          <div>
            <p className={styles.statLabel}>Entradas</p>
            <h3 className={styles.statValueClickable}>
              {formatCurrencyLocal(stats.entradas)}
            </h3>
          </div>
        </div>
        <div 
          className={`${styles.statCard} ${styles.clickableCard}`}
          onClick={() => {
            setQuickAddType('saida');
            setIsQuickAddOpen(true);
          }}
          title="Clique no valor para registrar uma saída rápida"
        >
          <ArrowDownCircle className={styles.textRed} size={32} />
          <div>
            <p className={styles.statLabel}>Saídas</p>
            <h3 className={styles.statValueClickable}>
              {formatCurrencyLocal(stats.saidas)}
            </h3>
          </div>
        </div>
        <div className={styles.statCard}>
          <Wallet className={styles.textGold} size={32} />
          <div>
            <p className={styles.statLabel}>Saldo</p>
            <h3 className={styles.statValue}>{formatCurrencyLocal(stats.saldo)}</h3>
          </div>
        </div>
        <div className={styles.statCard}>
          <AlertCircle className={styles.textOrange} size={32} />
          <div>
            <p className={styles.statLabel}>Pendente</p>
            <h3 className={styles.statValue}>{formatCurrencyLocal(stats.pendente)}</h3>
          </div>
        </div>
      </div>

      <div className={styles.actionBar}>
        <div className={styles.searchBox}>
          <Search size={18} />
          <input 
            placeholder="Buscar lançamentos..." 
            value={searchTerm} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>
        <div className={styles.actions}>
          <CustomSelect
            value={filterCategory}
            onChange={setFilterCategory}
            options={[{ value: 'all', label: 'Todas Categorias' }, ...CATEGORIES.map(c => ({ value: c, label: c }))]}
          />
          <button className={styles.btnAdd} onClick={() => handleOpenNew('saida')}>
            <Plus size={18} /> Novo Item
          </button>
        </div>
      </div>

      <div className={styles.tableCard}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#7a6a4a' }}>Carregando lançamentos...</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Data</th>
                <th>Descrição</th>
                <th>Categoria</th>
                <th>Valor</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map(entry => (
                <tr key={entry.id} className={entry.type === 'entrada' ? styles.rowIn : styles.rowOut}>
                  <td>{new Date(entry.date).toLocaleDateString('pt-BR')}</td>
                  <td><strong>{entry.name}</strong></td>
                  <td><span className={styles.tag}>{entry.category}</span></td>
                  <td 
                    className={styles.amountClickable} 
                    onClick={() => handleEdit(entry)}
                    title="Clique para editar valor"
                  >
                    {formatCurrencyLocal(Number(entry.amount))}
                  </td>
                  <td><span className={`${styles.status} ${styles[entry.payment_status]}`}>{entry.payment_status}</span></td>
                  <td className={styles.tdActions}>
                    <button 
                      onClick={() => handleOpenComment(entry)}
                      title="Adicionar/Ver Comentário"
                      className={entry.notes ? styles.btnHasComment : ''}
                    >
                      <MessageSquare size={16} />
                    </button>
                    <button onClick={() => handleEdit(entry)}><Edit3 size={16} /></button>
                    <button onClick={() => handleDelete(entry.id)}><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>{editingId ? 'Editar Lançamento' : 'Novo Lançamento'}</h2>
              <button onClick={() => setIsModalOpen(false)}><X /></button>
            </div>
            <form onSubmit={handleSubmit} className={styles.financeForm}>
              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label>Nome / Fornecedor</label>
                  <div className={styles.inputWrap}>
                    <User size={14} />
                    <input required placeholder="Ex: Banda, Fornecedor..." value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                  </div>
                </div>
                <div className={styles.field}>
                  <label>Valor (R$)</label>
                  <div className={styles.inputWrap}>
                    <DollarSign size={14} />
                    <input type="number" step="0.01" required placeholder="0,00" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
                  </div>
                </div>
                <div className={styles.field}>
                  <label>Categoria</label>
                  <CustomSelect
                    fullWidth
                    value={form.category ?? ''}
                    onChange={val => setForm({...form, category: val})}
                    options={CATEGORIES.map(c => ({ value: c, label: c }))}
                  />
                </div>
                <div className={styles.field}>
                  <label>Status</label>
                  <CustomSelect
                    fullWidth
                    value={form.payment_status ?? 'pendente'}
                    onChange={val => setForm({...form, payment_status: val as 'pago' | 'pendente' | 'atrasado'})}
                    options={[
                      { value: 'pendente', label: 'Pendente' },
                      { value: 'pago', label: 'Pago' },
                      { value: 'atrasado', label: 'Atrasado' },
                    ]}
                  />
                </div>
              </div>
              <button type="submit" className={styles.btnConfirm}>Salvar</button>
            </form>
          </div>
        </div>
      )}

      {isCommentModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalSmall}>
            <div className={styles.modalHeader}>
              <h2>Comentário do Item</h2>
              <button onClick={() => setIsCommentModalOpen(false)}><X /></button>
            </div>
            <p className={styles.modalHelp}>
              Notas internas sobre <strong>{commentingEntry?.name}</strong>
            </p>
            <div className={styles.commentWrap}>
              <div className={styles.commentHistory}>
                <label>Histórico</label>
                <div className={styles.notesArea}>
                  {commentingEntry?.notes || "Nenhum comentário registrado."}
                </div>
              </div>
              <form onSubmit={handleSaveComment} className={styles.financeForm}>
                <div className={styles.field}>
                  <label>Adicionar Novo Comentário</label>
                  <textarea 
                    rows={3} autoFocus required
                    value={newCommentText} onChange={e => setNewCommentText(e.target.value)} 
                    placeholder="Digite aqui sua nova observação..."
                  />
                </div>
                <button type="submit" className={styles.btnConfirm}>Salvar Nota</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {isQuickAddOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalSmall}>
            <div className={styles.modalHeader}>
              <h2>{quickAddType === 'entrada' ? 'Adicionar Saldo' : 'Registrar Gasto'}</h2>
              <button onClick={() => setIsQuickAddOpen(false)}><X /></button>
            </div>
            <p className={styles.modalHelp}>
              Este valor será <strong>somado</strong> ao total de {quickAddType === 'entrada' ? 'entradas' : 'saídas'} atual.
            </p>
            <form onSubmit={handleQuickAdd} className={styles.financeForm}>
              <div className={styles.field}>
                <label>Valor em R$</label>
                <input 
                  type="number" step="0.01" autoFocus required 
                  value={quickAmount} onChange={e => setQuickAmount(e.target.value)} 
                  placeholder="0,00"
                />
              </div>
              <button type="submit" className={styles.btnConfirm}>Confirmar e Somar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialManager;