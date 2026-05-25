import React, { useState, useEffect } from 'react';
import { Trash2, Mail, MailOpen, Search, RefreshCw, Phone } from 'lucide-react';
import { contactService, type ContactMessage } from '@/services/contact.service';
import { useToast } from '@/hooks/useToast';
import styles from './ContactManager.module.css';

const ContactManager: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const toast = useToast();

  const load = async () => {
    setLoading(true);
    try {
      setMessages(await contactService.getMessages());
    } catch {
      toast.error('Erro ao carregar mensagens');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps -- bootstrap on mount
  useEffect(() => { load(); }, []);

  const open = async (msg: ContactMessage) => {
    setSelected(msg);
    if (!msg.lido) {
      await contactService.markRead(msg.id).catch(() => null);
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, lido: true } : m));
    }
  };

  const remove = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Deletar esta mensagem?')) return;
    try {
      await contactService.deleteMessage(id);
      setMessages(prev => prev.filter(m => m.id !== id));
      if (selected?.id === id) setSelected(null);
      toast.success('Mensagem deletada');
    } catch {
      toast.error('Erro ao deletar');
    }
  };

  const filtered = messages.filter(m =>
    m.nome.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase()) ||
    m.assunto.toLowerCase().includes(search.toLowerCase())
  );

  const unread = messages.filter(m => !m.lido).length;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>Mensagens de Contato</h1>
          {unread > 0 && <span className={styles.badge}>{unread} não lida{unread > 1 ? 's' : ''}</span>}
        </div>
        <button className={styles.refreshBtn} onClick={load} title="Atualizar">
          <RefreshCw size={16} />
        </button>
      </div>

      <div className={styles.layout}>
        <div className={styles.list}>
          <div className={styles.searchBox}>
            <Search size={15} />
            <input
              placeholder="Buscar nome, e-mail ou assunto..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div className={styles.empty}>Carregando...</div>
          ) : filtered.length === 0 ? (
            <div className={styles.empty}>Nenhuma mensagem</div>
          ) : (
            filtered.map(msg => (
              <div
                key={msg.id}
                className={`${styles.item} ${!msg.lido ? styles.unread : ''} ${selected?.id === msg.id ? styles.active : ''}`}
                onClick={() => open(msg)}
              >
                <div className={styles.itemTop}>
                  <span className={styles.itemIcon}>
                    {msg.lido ? <MailOpen size={14} /> : <Mail size={14} />}
                  </span>
                  <span className={styles.itemName}>{msg.nome}</span>
                  <span className={styles.itemDate}>
                    {new Date(msg.created_at).toLocaleDateString('pt-BR')}
                  </span>
                  <button className={styles.deleteBtn} onClick={e => remove(msg.id, e)} title="Deletar">
                    <Trash2 size={13} />
                  </button>
                </div>
                <div className={styles.itemSubject}>{msg.assunto}</div>
                <div className={styles.itemEmail}>{msg.email}</div>
              </div>
            ))
          )}
        </div>

        <div className={styles.detail}>
          {selected ? (
            <>
              <div className={styles.detailHeader}>
                <h2 className={styles.detailSubject}>{selected.assunto}</h2>
                <span className={styles.detailDate}>
                  {new Date(selected.created_at).toLocaleString('pt-BR')}
                </span>
              </div>
              <div className={styles.detailMeta}>
                <span><strong>De:</strong> {selected.nome}</span>
                <span><strong>E-mail:</strong> {selected.email}</span>
                {selected.telefone && <span><strong>Telefone:</strong> {selected.telefone}</span>}
              </div>
              <div className={styles.detailBody}>{selected.mensagem}</div>
              {selected.telefone && (
                <a
                  href={`https://wa.me/55${selected.telefone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.whatsappBtn}
                >
                  <Phone size={15} /> WhatsApp {selected.telefone}
                </a>
              )}
            </>
          ) : (
            <div className={styles.detailEmpty}>
              <Mail size={32} />
              <p>Selecione uma mensagem para visualizar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactManager;
