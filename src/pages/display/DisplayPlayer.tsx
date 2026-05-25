import { useState, useEffect, useRef, useCallback, type FC } from 'react';
import { useParams } from 'react-router-dom';
import { Maximize, AlertCircle, Tv } from 'lucide-react';
import { displaysService } from '@/services/displays.service';
import { useDisplayLive } from '@/hooks/useDisplayLive';
import type { DisplayPublic } from '@/types/display.types';
import styles from './DisplayPlayer.module.css';

function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/);
  return m ? m[1] : null;
}

function buildEmbedUrl(url: string, autoplay: boolean, loop: boolean): string {
  const id = getYouTubeId(url);
  if (!id) return '';
  const params = new URLSearchParams({
    autoplay: autoplay ? '1' : '0',
    mute: '1',
    controls: '0',
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
    vq: 'hd1080',
    hd: '1',
  });
  if (loop) {
    params.set('loop', '1');
    params.set('playlist', id);
  }
  return `https://www.youtube.com/embed/${id}?${params.toString()}`;
}

const DisplayPlayer: FC = () => {
  const { screenCode } = useParams<{ screenCode: string }>();
  const [display, setDisplay] = useState<DisplayPublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(!navigator.onLine);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!screenCode) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on screenCode change
    setLoading(true);
    setError(null);
    displaysService.getByScreenCode(screenCode)
      .then(d => setDisplay(d))
      .catch(err => {
        setError(err?.response?.status === 404 ? 'Tela não encontrada' : 'Erro ao carregar tela');
      })
      .finally(() => setLoading(false));
  }, [screenCode]);

  useEffect(() => {
    const goOnline = () => setOffline(false);
    const goOffline = () => setOffline(true);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  const handleLiveUpdate = useCallback((next: Partial<DisplayPublic>) => {
    setDisplay(prev => prev ? { ...prev, ...next } : prev);
  }, []);

  const handleDeleted = useCallback(() => {
    setError('Esta tela foi removida pelo administrador');
    setDisplay(null);
  }, []);

  useDisplayLive(display?.screen_code, handleLiveUpdate, handleDeleted);

  const enterFullscreen = async () => {
    try {
      const el = containerRef.current;
      if (!el) return;
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await el.requestFullscreen();
      }
    } catch { /* ignored */ }
  };

  if (loading) {
    return (
      <div className={styles.stateScreen}>
        <Tv size={42} className={styles.spinIcon} />
        <p>Carregando tela...</p>
      </div>
    );
  }

  if (error || !display) {
    return (
      <div className={styles.stateScreen}>
        <AlertCircle size={42} className={styles.errIcon} />
        <p>{error || 'Indisponível'}</p>
        {screenCode && <code className={styles.codeChip}>{screenCode}</code>}
      </div>
    );
  }

  const embedUrl = buildEmbedUrl(display.youtube_url, display.autoplay, display.loop);

  return (
    <div ref={containerRef} className={styles.container}>
      {offline && (
        <div className={styles.offlineBanner}>Sem conexão — tentando reconectar...</div>
      )}

      {embedUrl ? (
        <iframe
          key={embedUrl}
          src={embedUrl}
          className={styles.iframe}
          allow="autoplay; encrypted-media; fullscreen"
          allowFullScreen
          title={display.name}
        />
      ) : (
        <div className={styles.stateScreen}>
          <AlertCircle size={42} className={styles.errIcon} />
          <p>URL de vídeo inválida</p>
        </div>
      )}

      {display.fullscreen && (
        <button
          className={styles.fullscreenBtn}
          onClick={enterFullscreen}
          title="Tela cheia"
          aria-label="Tela cheia"
        >
          <Maximize size={20} />
        </button>
      )}
    </div>
  );
};

export default DisplayPlayer;
