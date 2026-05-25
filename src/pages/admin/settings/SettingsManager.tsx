import React, { useState, useEffect } from 'react';
import { Upload, Link, AlertTriangle, CheckCircle } from 'lucide-react';
import { settingsService } from '@/services/settings.service';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/Button';
import styles from './SettingsManager.module.css';

const SettingsManager: React.FC = () => {
  const toast = useToast();
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [mode, setMode] = useState<'file' | 'url'>('file');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    settingsService.get('hero_video')
      .then(v => setCurrentUrl(v))
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    if (mode === 'file' && !videoFile) {
      toast.error('Selecione um arquivo de vídeo.');
      return;
    }
    if (mode === 'url' && !videoUrl.trim()) {
      toast.error('Informe uma URL de vídeo.');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      if (mode === 'file' && videoFile) {
        data.append('video_file', videoFile);
      } else {
        data.append('value', videoUrl.trim());
      }
      const saved = await settingsService.save('hero_video', data);
      setCurrentUrl(saved);
      setVideoFile(null);
      setVideoUrl('');
      toast.success('Vídeo da home atualizado!');
    } catch {
      toast.error('Erro ao salvar vídeo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Configurações</h1>
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Vídeo da Home</h2>
        <p className={styles.cardDesc}>
          Este vídeo aparece como seção de destaque na página inicial do site.
        </p>

        {/* Aviso importante */}
        <div className={styles.warning}>
          <AlertTriangle size={16} className={styles.warningIcon} />
          <div>
            <strong>Formato obrigatório: Paisagem HD (16:9)</strong>
            <p>
              Aceita link do YouTube ou arquivo MP4/WebM. Use somente vídeos horizontais
              (1280×720 ou superior). Vídeos verticais (story 9:16) vão aparecer cortados.
            </p>
          </div>
        </div>

        {/* Preview do vídeo atual */}
        {currentUrl && (
          <div className={styles.previewWrap}>
            <p className={styles.previewLabel}>Vídeo atual:</p>
            {currentUrl.includes('youtube.com') || currentUrl.includes('youtu.be') ? (
              <iframe
                src={`https://www.youtube.com/embed/${currentUrl.match(/(?:watch\?v=|embed\/|youtu\.be\/)([^&\s?]+)/)?.[1]}?autoplay=0&controls=1`}
                className={styles.preview}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media"
                allowFullScreen
                title="preview"
              />
            ) : (
              <video
                src={currentUrl}
                controls
                className={styles.preview}
              />
            )}
            <p className={styles.previewUrl}>{currentUrl}</p>
          </div>
        )}

        {!currentUrl && (
          <div className={styles.noVideo}>
            <p>Nenhum vídeo configurado. A seção de vídeo ficará oculta no site.</p>
          </div>
        )}

        {/* Modo de upload */}
        <div className={styles.modeTabs}>
          <button
            className={`${styles.modeTab} ${mode === 'file' ? styles.modeActive : ''}`}
            onClick={() => setMode('file')}
          >
            <Upload size={14} /> Upload de arquivo
          </button>
          <button
            className={`${styles.modeTab} ${mode === 'url' ? styles.modeActive : ''}`}
            onClick={() => setMode('url')}
          >
            <Link size={14} /> Usar URL externa
          </button>
        </div>

        {mode === 'file' ? (
          <div className={styles.uploadArea}>
            <input
              type="file"
              accept="video/mp4,video/webm"
              id="videoInput"
              className={styles.fileInput}
              onChange={e => setVideoFile(e.target.files?.[0] || null)}
            />
            <label htmlFor="videoInput" className={styles.uploadLabel}>
              {videoFile ? (
                <span className={styles.fileSelected}>
                  <CheckCircle size={16} className={styles.checkIcon} />
                  {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(1)} MB)
                </span>
              ) : (
                <>
                  <Upload size={24} className={styles.uploadIcon} />
                  <span>Clique para selecionar um vídeo MP4 ou WebM</span>
                  <span className={styles.uploadHint}>Máximo 200 MB · Somente paisagem HD</span>
                </>
              )}
            </label>
          </div>
        ) : (
          <div className={styles.field}>
            <label>URL do vídeo</label>
            <input
              type="url"
              value={videoUrl}
              onChange={e => setVideoUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=... ou https://exemplo.com/video.mp4"
              className={styles.urlInput}
            />
          </div>
        )}

        <div className={styles.actions}>
          <Button onClick={handleSave} isLoading={loading}>
            Salvar vídeo
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsManager;
