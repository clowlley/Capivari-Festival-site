import { useEffect, useRef } from 'react';
import { displaysService } from '@/services/displays.service';
import type { DisplayPublic } from '@/types/display.types';

type Handler = (next: Partial<DisplayPublic>) => void;
type DeletedHandler = () => void;

export function useDisplayLive(
  screenCode: string | undefined,
  onUpdate: Handler,
  onDeleted?: DeletedHandler
) {
  const onUpdateRef = useRef(onUpdate);
  const onDeletedRef = useRef(onDeleted);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
    onDeletedRef.current = onDeleted;
  }, [onUpdate, onDeleted]);

  useEffect(() => {
    if (!screenCode) return;

    let es: EventSource | null = null;
    let retry: number | null = null;
    let closed = false;

    const connect = () => {
      if (closed) return;
      es = new EventSource(displaysService.streamUrl(screenCode));

      es.addEventListener('update', (e) => {
        try {
          const data = JSON.parse((e as MessageEvent).data);
          onUpdateRef.current(data);
        } catch { /* ignored */ }
      });

      es.addEventListener('deleted', () => {
        onDeletedRef.current?.();
      });

      es.onerror = () => {
        es?.close();
        if (closed) return;
        retry = window.setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      closed = true;
      if (retry) clearTimeout(retry);
      es?.close();
    };
  }, [screenCode]);
}
