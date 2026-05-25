import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2 } from 'lucide-react';
import { projectService } from '@/services/projects.service';
import type { Project } from '@/types/project.types';
import { useToast } from '@/hooks/useToast';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import ProjectForm from './ProjectForm';
import styles from './ProjectsManager.module.css';

const statusClass: Record<string, string> = {
  draft: styles.draft,
  published: styles.published,
};

const statusLabel: Record<string, string> = {
  draft: 'Rascunho',
  published: 'Publicado',
};

const ProjectsManager: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const toast = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await projectService.getAdminProjects();
      setProjects(data);
    } catch {
      toast.error('Erro ao carregar projetos');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps -- bootstrap on mount
  useEffect(() => { loadData(); }, []);

  const handleNew = () => { setEditing(null); setIsModalOpen(true); };
  const handleEdit = (p: Project) => { setEditing(p); setIsModalOpen(true); };
  const handleClose = () => { setIsModalOpen(false); setEditing(null); };
  const handleSuccess = () => { handleClose(); loadData(); };

  const handleDelete = async (id: number) => {
    if (!confirm('Excluir este projeto?')) return;
    try {
      await projectService.deleteProject(id);
      toast.success('Projeto removido');
      loadData();
    } catch {
      toast.error('Erro ao remover projeto');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Projetos</h1>
        <Button onClick={handleNew}><Plus size={16} /> Novo Projeto</Button>
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
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(p => (
                <tr key={p.id}>
                  <td className={styles.tdTitle}>{p.title}</td>
                  <td>{p.category || '-'}</td>
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
              {projects.length === 0 && (
                <tr><td colSpan={4} className={styles.empty}>Nenhum projeto cadastrado.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={handleClose} title={editing ? 'Editar Projeto' : 'Novo Projeto'}>
        <ProjectForm project={editing} onSuccess={handleSuccess} onCancel={handleClose} />
      </Modal>
    </div>
  );
};

export default ProjectsManager;
