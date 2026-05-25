import React, { useState, useEffect } from 'react';
import {
  Search, Plus, Trash2, Edit3, Tv, Copy, ExternalLink,
  Monitor, Link as LinkIcon, Hash
} from 'lucide-react';
import { displaysService } from '@/services/displays.service';
import type { Display, DisplayFormState } from '@/types/display.types';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Table, TableRow, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import styles from './DisplaysManager.module.css';

const YOUTUBE_RE = /^https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)[\w-]{6,}/i;
const SCREEN_CODE_RE = /^[a-z0-9][a-z0-9-]{1,58}[a-z0-9]$/i;

const EMPTY_FORM: DisplayFormState = {
  name: '',
  screen_code: '',
  youtube_url: '',
  loop: true,
  autoplay: true,
  fullscreen: true,
};

const DisplaysManager: React.FC = () => {
  const [displays, setDisplays] = useState<Display[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<DisplayFormState>(EMPTY_FORM);
  const toast = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await displaysService.getDisplays();
      setDisplays(data);
    } catch {
      toast.error('Erro ao carregar telões');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps -- bootstrap on mount
  useEffect(() => { loadData(); }, []);

  // polling para refletir status online sem precisar refresh manual
  useEffect(() => {
    const id = setInterval(() => {
      displaysService.getDisplays().then(setDisplays).catch(() => {});
    }, 10000);
    return () => clearInterval(id);
  }, []);

  const handleOpenNew = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const handleEdit = (d: Display) => {
    setEditingId(d.id);
    setForm({
      name: d.name,
      screen_code: d.screen_code,
      youtube_url: d.youtube_url,
      loop: d.loop,
      autoplay: d.autoplay,
      fullscreen: d.fullscreen,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) return toast.error('Nome obrigatório');
    if (!SCREEN_CODE_RE.test(form.screen_code.trim())) {
      return toast.error('Código inválido (3-60 letras/números/hífen, sem espaços)');
    }
    if (!YOUTUBE_RE.test(form.youtube_url.trim())) {
      return toast.error('URL do YouTube inválida');
    }

    const payload: DisplayFormState = {
      ...form,
      name: form.name.trim(),
      screen_code: form.screen_code.trim().toLowerCase(),
      youtube_url: form.youtube_url.trim(),
    };

    try {
      if (editingId) {
        await displaysService.updateDisplay(editingId, payload);
        toast.success('Telão atualizado');
      } else {
        await displaysService.createDisplay(payload);
        toast.success('Telão criado');
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      const err = error as { response?: { data?: { error?: string } } };
      toast.error(err.response?.data?.error || 'Erro ao salvar telão');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Remover este telão? A tela em uso será desconectada.')) return;
    try {
      await displaysService.deleteDisplay(id);
      toast.success('Removido');
      loadData();
    } catch {
      toast.error('Erro ao remover');
    }
  };

  const copyPlayerLink = (screenCode: string) => {
    const url = `${window.location.origin}/display/${screenCode}`;
    navigator.clipboard.writeText(url).then(
      () => toast.success('Link copiado'),
      () => toast.error('Não foi possível copiar')
    );
  };

  const openPlayer = (screenCode: string) => {
    window.open(`/display/${screenCode}`, '_blank', 'noopener,noreferrer');
  };

  const filtered = displays.filter(d => {
    const q = searchTerm.toLowerCase();
    return d.name.toLowerCase().includes(q) || d.screen_code.toLowerCase().includes(q);
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Telões</h1>
        <Button onClick={handleOpenNew}>
          <Plus size={18} /> Novo Telão
        </Button>
      </div>

      <div className={styles.actionBar}>
        <div className={styles.searchBox}>
          <Search size={18} />
          <input
            placeholder="Buscar por nome ou código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.loading}>Carregando telões...</div>
        ) : filtered.length === 0 ? (
          <div className={styles.empty}>
            <Tv size={28} />
            <p>Nenhum telão cadastrado ainda.</p>
          </div>
        ) : (
          <Table headers={['Nome', 'Código', 'Status', 'YouTube', 'Ações']}>
            {filtered.map(d => (
              <TableRow key={d.id}>
                <TableCell label="Nome">
                  <div className={styles.nameCell}>
                    <Monitor size={14} className={styles.tvIcon} />
                    <strong>{d.name}</strong>
                  </div>
                </TableCell>
                <TableCell label="Código">
                  <code className={styles.codeChip}>{d.screen_code}</code>
                </TableCell>
                <TableCell label="Status">
                  <Badge type={d.online ? 'success' : 'neutral'}>
                    <span className={`${styles.dot} ${d.online ? styles.dotOn : styles.dotOff}`} />
                    {d.online ? 'Online' : 'Offline'}
                  </Badge>
                </TableCell>
                <TableCell label="YouTube">
                  <a
                    href={d.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.urlLink}
                    title={d.youtube_url}
                  >
                    {d.youtube_url.length > 40 ? d.youtube_url.slice(0, 40) + '…' : d.youtube_url}
                  </a>
                </TableCell>
                <TableCell label="Ações">
                  <div className={styles.actions}>
                    <button onClick={() => openPlayer(d.screen_code)} title="Abrir player"><ExternalLink size={16} /></button>
                    <button onClick={() => copyPlayerLink(d.screen_code)} title="Copiar link"><Copy size={16} /></button>
                    <button onClick={() => handleEdit(d)} title="Editar"><Edit3 size={16} /></button>
                    <button onClick={() => handleDelete(d.id)} title="Excluir"><Trash2 size={16} /></button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Editar Telão' : 'Novo Telão'}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>Nome da tela</label>
            <div className={styles.inputWrap}>
              <Monitor size={14} />
              <input
                required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: Palco Principal"
                maxLength={120}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label>Código único (screen code)</label>
            <div className={styles.inputWrap}>
              <Hash size={14} />
              <input
                required
                value={form.screen_code}
                onChange={e => setForm({ ...form, screen_code: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                placeholder="ex: mainstage"
                maxLength={60}
              />
            </div>
            <small className={styles.hint}>URL: <code>/display/{form.screen_code || 'codigo'}</code></small>
          </div>

          <div className={styles.field}>
            <label>URL do YouTube</label>
            <div className={styles.inputWrap}>
              <LinkIcon size={14} />
              <input
                required
                value={form.youtube_url}
                onChange={e => setForm({ ...form, youtube_url: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=..."
                maxLength={500}
              />
            </div>
          </div>

          <div className={styles.toggles}>
            <label className={styles.toggle}>
              <input type="checkbox" checked={form.autoplay} onChange={e => setForm({ ...form, autoplay: e.target.checked })} />
              <span>Autoplay</span>
            </label>
            <label className={styles.toggle}>
              <input type="checkbox" checked={form.loop} onChange={e => setForm({ ...form, loop: e.target.checked })} />
              <span>Loop infinito</span>
            </label>
            <label className={styles.toggle}>
              <input type="checkbox" checked={form.fullscreen} onChange={e => setForm({ ...form, fullscreen: e.target.checked })} />
              <span>Botão fullscreen</span>
            </label>
          </div>

          <Button type="submit">{editingId ? 'Salvar alterações' : 'Criar telão'}</Button>
        </form>
      </Modal>
    </div>
  );
};

export default DisplaysManager;
