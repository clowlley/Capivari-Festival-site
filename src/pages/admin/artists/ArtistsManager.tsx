import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Music } from 'lucide-react';
import { artistsService } from '@/services/artists.service';
import type { Artist } from '@/types/artist.types';
import { useToast } from '@/hooks/useToast';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import ArtistForm from './ArtistForm';
import styles from './ArtistsManager.module.css';

const statusClass: Record<string, string> = {
  draft: styles.draft,
  published: styles.published,
};
const statusLabel: Record<string, string> = {
  draft: 'Rascunho',
  published: 'Publicado',
};

const ArtistsManager: React.FC = () => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Artist | null>(null);
  const toast = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await artistsService.getAdminArtists();
      setArtists(data);
    } catch {
      toast.error('Erro ao carregar artistas.');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps -- bootstrap on mount
  useEffect(() => { loadData(); }, []);

  const handleNew = () => { setEditing(null); setIsModalOpen(true); };
  const handleEdit = (a: Artist) => { setEditing(a); setIsModalOpen(true); };
  const handleClose = () => { setIsModalOpen(false); setEditing(null); };
  const handleSuccess = () => { handleClose(); loadData(); };

  const handleDelete = async (id: number) => {
    if (!confirm('Excluir este artista?')) return;
    try {
      await artistsService.deleteArtist(id);
      toast.success('Artista removido.');
      loadData();
    } catch {
      toast.error('Erro ao remover artista.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Artistas</h1>
        <Button onClick={handleNew}><Plus size={16} /> Novo Artista</Button>
      </div>

      <div className={styles.tableCard}>
        {loading ? (
          <p className={styles.loading}>Carregando...</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Artista</th>
                <th>Projeto / Banda</th>
                <th>Vertentes</th>
                <th>Carreira</th>
                <th>Fotos</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {artists.map(a => (
                <tr key={a.id}>
                  <td className={styles.tdArtist}>
                    {a.profile_image
                      ? <img src={a.profile_image} alt={a.name} className={styles.avatar} />
                      : <div className={styles.avatarPlaceholder}><Music size={14} /></div>
                    }
                    <span>{a.name}</span>
                  </td>
                  <td>{a.project_name || '-'}</td>
                  <td>
                    {a.musical_styles
                      ? <div className={styles.styleTags}>
                          {a.musical_styles.split(',').map(s => s.trim()).filter(Boolean).map((s, i) => (
                            <span key={i} className={styles.styleTag}>{s}</span>
                          ))}
                        </div>
                      : '-'
                    }
                  </td>
                  <td>{a.career_years != null ? `${a.career_years} ano${a.career_years !== 1 ? 's' : ''}` : '-'}</td>
                  <td>{a.photos?.length ?? 0}/{4}</td>
                  <td>
                    <span className={`${styles.statusTag} ${statusClass[a.status] ?? ''}`}>
                      {statusLabel[a.status] ?? a.status}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button onClick={() => handleEdit(a)} title="Editar"><Edit3 size={15} /></button>
                      <button className={styles.danger} onClick={() => handleDelete(a.id)} title="Excluir"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {artists.length === 0 && (
                <tr><td colSpan={7} className={styles.empty}>Nenhum artista cadastrado.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={handleClose} title={editing ? 'Editar Artista' : 'Novo Artista'}>
        <ArtistForm artist={editing} onSuccess={handleSuccess} onCancel={handleClose} />
      </Modal>
    </div>
  );
};

export default ArtistsManager;
