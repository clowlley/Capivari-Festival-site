import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, X, Plus, FolderPlus, ArrowLeft, FolderOpen, Layers, ChevronDown, UploadCloud } from 'lucide-react';
import { galleryService } from '@/services/gallery.service';
import { eventService } from '@/services/events.service';
import type { Album, GalleryImage } from '@/types/gallery.types';
import type { Event } from '@/types/event.types';
import { useToast } from '@/hooks/useToast';
import styles from './GalleryManager.module.css';

const GalleryManager: React.FC = () => {
  const [photos, setPhotos] = useState<GalleryImage[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [currentAlbum, setCurrentAlbum] = useState<Album | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAlbumModalOpen, setIsAlbumModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const [bulkFiles, setBulkFiles] = useState<File[]>([]);
  const [bulkUploading, setBulkUploading] = useState(false);

  // Form estados
  const [title, setTitle] = useState('');
  const [selectedAlbum, setSelectedAlbum] = useState('');
  const [file, setFile] = useState<File | null>(null);
  
  const [albumTitle, setAlbumTitle] = useState('');
  const [albumCoverFile, setAlbumCoverFile] = useState<File | null>(null);
  const [linkEventId, setLinkEventId] = useState('');

  const navigate = useNavigate();
  const toast = useToast();

  const loadPhotos = async () => {
    try {
      const data = await galleryService.getImages();
      setPhotos(data);
    } catch {
      toast.error("Erro ao carregar galeria");
    }
  };

  const loadData = async () => {
    try {
      const [albumsData, eventsData] = await Promise.all([
        galleryService.getAlbums(),
        eventService.getAdminEvents()
      ]);
      setAlbums(albumsData);
      setEvents(eventsData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- bootstrap on mount
    loadPhotos();
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!albumCoverFile) return toast.error("Selecione uma imagem de capa para o álbum");
    
    const formData = new FormData();
    formData.append('title', albumTitle);
    formData.append('event_id', linkEventId || '');
    formData.append('cover_image_file', albumCoverFile);

    try {
      await galleryService.createAlbum(formData);
      toast.success("Álbum criado!");
      setIsAlbumModalOpen(false);
      setAlbumTitle('');
      setAlbumCoverFile(null);
      setLinkEventId('');
      loadData();
    } catch {
      toast.error("Erro ao criar álbum");
    }
  };

  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkFiles.length) return toast.error('Selecione pelo menos uma imagem');
    const albumId = currentAlbum ? String(currentAlbum.id) : selectedAlbum;
    if (!albumId) return toast.error('Selecione um álbum');
    setBulkUploading(true);
    const formData = new FormData();
    bulkFiles.forEach(f => formData.append('image_files', f));
    formData.append('album_id', albumId);
    try {
      await galleryService.bulkUploadImages(formData);
      toast.success(`${bulkFiles.length} foto${bulkFiles.length > 1 ? 's' : ''} adicionada${bulkFiles.length > 1 ? 's' : ''}!`);
      setIsBulkModalOpen(false);
      setBulkFiles([]);
      loadPhotos();
    } catch {
      toast.error('Erro no upload em massa');
    } finally {
      setBulkUploading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return toast.error("Selecione uma imagem");

    const formData = new FormData();
    formData.append('title', title);
    formData.append('image_file', file);
    formData.append('album_id', selectedAlbum || (currentAlbum ? String(currentAlbum.id) : ''));
    
    try {
      await galleryService.uploadImage(formData);
      toast.success("Foto adicionada!");
      setIsModalOpen(false);
      setTitle('');
      setSelectedAlbum('');
      setFile(null);
      loadPhotos();
    } catch {
      toast.error("Erro no upload. Verifique se você ainda está logado.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Remover esta foto?")) return;

    try {
      await galleryService.deleteImage(id);
      toast.success("Removida");
      loadPhotos();
    } catch {
      toast.error("Erro ao remover");
    }
  };

  const handleDeleteAlbum = async (id: number) => {
    if (!confirm("Remover álbum e TODAS as fotos contidas nele?")) return;
    try {
      await galleryService.deleteAlbum(id);
      toast.success("Álbum removido");
      if (currentAlbum?.id === id) setCurrentAlbum(null);
      loadData();
      loadPhotos();
    } catch {
      toast.error("Erro ao remover álbum");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        {currentAlbum ? (
          <div className={styles.navHeader}>
            <button className={styles.btnBack} onClick={() => setCurrentAlbum(null)}>
              <ArrowLeft size={20} /> Voltar
            </button>
            <h1 className={styles.title}>{currentAlbum.title}</h1>
          </div>
        ) : (
          <h1 className={styles.title}>Gerenciar Galeria</h1>
        )}
        
        {!currentAlbum ? (
          <div className={styles.headerActions}>
            <button className={styles.btnSecondary} onClick={() => setIsAlbumModalOpen(true)}>
              <FolderPlus size={18} /> Novo Álbum
            </button>
          </div>
        ) : (
          <div className={styles.headerActions}>
            <div className={styles.uploadGroup}>
              <button className={styles.btnAdd} onClick={() => { setIsModalOpen(true); setShowUploadMenu(false); }}>
                <Plus size={18} /> Nova Foto
              </button>
              <button className={styles.btnDropdownToggle} onClick={() => setShowUploadMenu(v => !v)}>
                <ChevronDown size={14} />
              </button>
              {showUploadMenu && (
                <div className={styles.uploadMenu}>
                  <button onClick={() => { setIsModalOpen(true); setShowUploadMenu(false); }}>
                    <Plus size={14} /> Upload normal
                  </button>
                  <button onClick={() => { setIsBulkModalOpen(true); setShowUploadMenu(false); }}>
                    <UploadCloud size={14} /> Upload em massa <span className={styles.uploadMenuBadge}>máx. 100</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {!currentAlbum ? (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Álbuns de Eventos</h2>
          <div className={styles.albumGrid}>
            {albums.map(album => (
              <div key={album.id} className={styles.albumCard} onClick={() => setCurrentAlbum(album)}>
                <div className={styles.albumCover}>
                  <img src={album.cover_image || 'https://placehold.co/400x300?text=Sem+Capa'} alt="" />
                  <div className={styles.albumOverlay}>
                    <FolderOpen size={30} />
                    <span>Abrir Álbum</span>
                  </div>
                </div>
                <div className={styles.albumInfo}>
                  <h3>{album.title}</h3>
                  {album.event_title && <span className={styles.eventBadge}>{album.event_title}</span>}
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); navigate(`/galeria/${album.id}`); }}
                  className={styles.btnDeleteAlbum}
                  title="Ver galeria infinita"
                >
                  <Layers size={16} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteAlbum(album.id); }}
                  className={styles.btnDeleteAlbum}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <div className={styles.grid}>
          {photos.filter(p => p.album_id === currentAlbum.id).length === 0 ? (
            <p className={styles.empty}>Este álbum está vazio. Adicione fotos acima!</p>
          ) : (
            photos.filter(p => p.album_id === currentAlbum.id).map(p => (
              <div key={p.id} className={styles.card}>
                <img src={p.image} alt="" />
                <button className={styles.btnDelete} onClick={() => handleDelete(p.id)}>
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal Álbum */}
      {isAlbumModalOpen && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Criar Álbum</h2>
              <button onClick={() => setIsAlbumModalOpen(false)}><X /></button>
            </div>
            <form onSubmit={handleCreateAlbum} className={styles.form}>
              <div className={styles.field}>
                <label>Nome do Álbum</label>
                <input value={albumTitle} onChange={e => setAlbumTitle(e.target.value)} placeholder="Ex: Bastidores 2024" required />
              </div>
              <div className={styles.field}>
                <label>Foto de Capa</label>
                <input type="file" accept="image/*" onChange={e => setAlbumCoverFile(e.target.files?.[0] || null)} required />
              </div>
              <div className={styles.field}>
                <label>Vincular a um Evento (Opcional)</label>
                <select value={linkEventId} onChange={e => setLinkEventId(e.target.value)}>
                  <option value="">Nenhum evento específico</option>
                  {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
                </select>
              </div>
              <button type="submit" className={styles.btnSubmit}>Criar Álbum</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Foto */}
      {isModalOpen && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Adicionar Nova Foto</h2>
              <button onClick={() => setIsModalOpen(false)}><X /></button>
            </div>
            <form onSubmit={handleUpload} className={styles.form}>
              <div className={styles.field}>
                <label>Título da Imagem (Opcional)</label>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Vista do Palco" />
              </div>
              <div className={styles.field}>
                <label>Álbum de Destino</label>
                <select value={selectedAlbum} onChange={e => setSelectedAlbum(e.target.value)} required={!currentAlbum}>
                  <option value="">Selecione um álbum...</option>
                  {albums.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
                </select>
              </div>
              <div className={styles.field}>
                <label>Arquivo</label>
                <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} required />
              </div>
              <button type="submit" className={styles.btnSubmit}>Subir Foto</button>
            </form>
          </div>
        </div>
      )}
      {/* Modal Bulk Upload */}
      {isBulkModalOpen && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Upload em Massa</h2>
              <button onClick={() => { setIsBulkModalOpen(false); setBulkFiles([]); }}><X /></button>
            </div>
            <form onSubmit={handleBulkUpload} className={styles.form}>
              {!currentAlbum && (
                <div className={styles.field}>
                  <label>Álbum de Destino</label>
                  <select value={selectedAlbum} onChange={e => setSelectedAlbum(e.target.value)} required>
                    <option value="">Selecione um álbum...</option>
                    {albums.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
                  </select>
                </div>
              )}
              <div className={styles.field}>
                <label>Imagens <span style={{ color: '#6b7280', fontWeight: 400 }}>(máx. 100 por envio)</span></label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={e => {
                    const files = Array.from(e.target.files || []).slice(0, 100);
                    setBulkFiles(files);
                  }}
                  required
                />
                {bulkFiles.length > 0 && (
                  <p className={styles.bulkCount}>
                    {bulkFiles.length} imagem{bulkFiles.length > 1 ? 's' : ''} selecionada{bulkFiles.length > 1 ? 's' : ''}
                  </p>
                )}
              </div>
              <button type="submit" className={styles.btnSubmit} disabled={bulkUploading}>
                {bulkUploading ? 'Enviando...' : `Enviar ${bulkFiles.length || ''} foto${bulkFiles.length !== 1 ? 's' : ''}`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryManager;