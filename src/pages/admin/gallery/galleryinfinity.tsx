import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { ArrowLeft, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { galleryService } from '@/services/gallery.service';
import styles from './galleryinfinity.module.css';

const BAND_HEIGHT = 120;
const IMAGE_HEIGHT = 100;
const IMAGE_GAP = 20;
const CLONE_COUNT = 3;
const MAX_IMAGE_WIDTH = 300;
const MIN_PER_BAND = 6;

const BAND_CONFIGS = [
  { offsetY: -110, speed: 1.0, rotation: 7 * Math.PI / 180, rotationType: 'fromLeft',   curveAmount: 40.0, curveDirection: 1 },
  { offsetY: -330, speed: 1.3, rotation: 7 * Math.PI / 180, rotationType: 'fromCenter', curveAmount: 35.0, curveDirection: 1 },
  { offsetY: -440, speed: 1.6, rotation: 7 * Math.PI / 180, rotationType: 'fromLeft',   curveAmount: 40.0, curveDirection: 1 },
  { offsetY: -220, speed: 0.7, rotation: 7 * Math.PI / 180, rotationType: null,         curveAmount: 40.0, curveDirection: 1 },
  { offsetY: 0,    speed: 0.4, rotation: 7 * Math.PI / 180, rotationType: null,         curveAmount: 40.0, curveDirection: 1 },
  { offsetY: 110,  speed: 1.2, rotation: 7 * Math.PI / 180, rotationType: null,         curveAmount: 40.0, curveDirection: 1 },
  { offsetY: 220,  speed: 0.8, rotation: 7 * Math.PI / 180, rotationType: null,         curveAmount: 40.0, curveDirection: 1 },
  { offsetY: 330,  speed: 1.4, rotation: 7 * Math.PI / 180, rotationType: null,         curveAmount: 40.0, curveDirection: 1 },
];

const VERTEX_SHADER = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision highp float;
  uniform vec2 uResolution;
  uniform sampler2D uTexture;
  uniform float uTextureWidth;
  uniform float uSequenceWidth;
  uniform float uBandHeight;
  uniform float uScroll;
  uniform float uSpeed;
  uniform float uOffsetY;
  uniform float uRotation;
  uniform float uRotationType;
  uniform float uHasRotation;
  uniform float uBandIndex;
  uniform float uCurveAmount;
  uniform float uCurveDirection;
  uniform float uTime;
  varying vec2 vUv;

  mat2 rotate2d(float angle) {
    return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
  }

  void main() {
    vec2 pixelCoord = vUv * uResolution;
    vec2 originalPixelCoord = pixelCoord;
    float normalizedX = pixelCoord.x / uResolution.x;
    float curveFactor = 4.0 * (normalizedX - 0.5) * (normalizedX - 0.5);
    float curveOffset = (0.5 - curveFactor) * uCurveAmount * uCurveDirection;
    float bandTopBase = (uResolution.y - uBandHeight) * 0.5 + uOffsetY;
    float bandTop = bandTopBase + curveOffset;
    float bandBottom = bandTop + uBandHeight;
    float bandCenterY = bandTopBase + (uBandHeight * 0.5);

    if (uHasRotation > 0.5) {
      vec2 rotationCenter;
      if (uRotationType > 0.5) {
        rotationCenter = vec2(0.0, bandCenterY);
      } else {
        rotationCenter = vec2(uResolution.x * 0.5, bandCenterY);
      }
      pixelCoord -= rotationCenter;
      pixelCoord = rotate2d(uRotation) * pixelCoord;
      pixelCoord += rotationCenter;
      originalPixelCoord -= rotationCenter;
      originalPixelCoord = rotate2d(uRotation) * originalPixelCoord;
      originalPixelCoord += rotationCenter;
      vec2 rTop = vec2(0.0, bandTop) - rotationCenter;
      rTop = rotate2d(uRotation) * rTop + rotationCenter;
      vec2 rBot = vec2(0.0, bandBottom) - rotationCenter;
      rBot = rotate2d(uRotation) * rBot + rotationCenter;
      bandTop = min(rTop.y, rBot.y);
      bandBottom = max(rTop.y, rBot.y);
    }

    float margin = 3.0;
    if (pixelCoord.y < bandTop - margin || pixelCoord.y > bandBottom + margin) { discard; return; }

    float wrappedX = mod(originalPixelCoord.x + uScroll * uSpeed, uSequenceWidth);
    float textureX = (wrappedX + uSequenceWidth) / uTextureWidth;
    float texY = (pixelCoord.y - bandTop) / (bandBottom - bandTop);

    if (textureX < 0.0 || textureX > 1.0 || texY < 0.0 || texY > 1.0) { discard; return; }

    vec4 color = texture2D(uTexture, vec2(textureX, texY));
    if (color.a < 0.5) { discard; return; }

    float edge = min(pixelCoord.y - bandTop, bandBottom - pixelCoord.y);
    if (edge < margin) { color.a *= smoothstep(0.0, margin, edge); }
    if (color.a < 0.01) { discard; return; }

    float hueShift = uBandIndex * 0.1;
    color.r *= (1.0 + sin(hueShift) * 0.02);
    color.g *= (1.0 + sin(hueShift + 2.094) * 0.02);
    color.b *= (1.0 + sin(hueShift + 4.188) * 0.02);

    gl_FragColor = color;
  }
`;

interface BandClickData {
  urls: string[];
  cumWidths: number[];
  seqWidth: number;
  speed: number;
  offsetY: number;
}

const GalleryInfinity: React.FC = () => {
  const { albumId } = useParams<{ albumId: string }>();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const [loadedCount, setLoadedCount] = useState(0);
  const [totalCount, setTotalCount]   = useState(0);
  const [showLoading, setShowLoading] = useState(true);
  const [showHint, setShowHint]       = useState(true);

  const [albumUrls, setAlbumUrls]     = useState<string[]>([]);
  const [lbOpen, setLbOpen]           = useState(false);
  const [lbIndex, setLbIndex]         = useState(0);

  const albumUrlsRef   = useRef<string[]>([]);
  const lbOpenRef      = useRef(false);
  const lbIndexRef     = useRef(0);
  const bandClickRef   = useRef<(BandClickData | null)[]>([]);
  const scrollYRef     = useRef(0);
  const scrollVelRef   = useRef(0);

  const openLb = (idx: number) => {
    setLbIndex(idx); lbIndexRef.current = idx;
    setLbOpen(true); lbOpenRef.current = true;
  };
  const closeLb = () => { setLbOpen(false); lbOpenRef.current = false; };
  const prevPhoto = () => {
    const n = albumUrlsRef.current.length;
    const i = ((lbIndexRef.current - 1) + n) % n;
    setLbIndex(i); lbIndexRef.current = i;
  };
  const nextPhoto = () => {
    const n = albumUrlsRef.current.length;
    const i = (lbIndexRef.current + 1) % n;
    setLbIndex(i); lbIndexRef.current = i;
  };

  useEffect(() => {
    if (!containerRef.current || !albumId) return;
    const container = containerRef.current;

    let scrollY = 0;
    let targetScrollY = 0;
    let scrollVelocity = 0;
    const materials: THREE.ShaderMaterial[] = [];
    const meshes: THREE.Mesh[] = [];
    let isDragging = false;
    let lastDragY = 0;
    let lastTouchY = 0;
    let mouseDownX = 0;
    let mouseDownY = 0;
    let hasDragged = false;
    const DRAG_THRESHOLD = 5;
    let animId: number;
    let localLoaded = 0;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 1;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    const W = () => container.clientWidth;
    const H = () => container.clientHeight;
    renderer.setSize(W(), H());
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.domElement.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;';
    container.appendChild(renderer.domElement);

    function formatRatio(r: number): string {
      const known = [{ v: 1.5, t: '3:2', tol: 0.05 }, { v: 1.333, t: '4:3', tol: 0.02 }, { v: 1.777, t: '16:9', tol: 0.02 }, { v: 1.0, t: '1:1', tol: 0.01 }];
      for (const k of known) if (Math.abs(r - k.v) < k.tol) return k.t;
      return r.toFixed(2) + ':1';
    }

    function makeFallback(obj: Record<string, unknown>, idx: number, bi: number) {
      const ratio = [1.5, 1.333, 1.777, 1.0, 0.75][Math.floor(Math.random() * 5)];
      let w = Math.round(IMAGE_HEIGHT * ratio), h = IMAGE_HEIGHT;
      if (w > MAX_IMAGE_WIDTH) { w = MAX_IMAGE_WIDTH; h = Math.round(w / ratio); }
      const cvs = document.createElement('canvas');
      cvs.width = w; cvs.height = h;
      const ctx = cvs.getContext('2d')!;
      ctx.fillStyle = `hsl(${bi * 45},60%,30%)`;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = 'bold 11px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${idx + 1}`, w / 2, h / 2);
      obj.loaded = true; obj.img = cvs;
      obj.width = w; obj.height = h;
      obj.ratio = ratio; obj.displayRatio = formatRatio(ratio);
    }

    function buildTexture(images: Record<string, unknown>[]) {
      let seqW = images.reduce((s, im) => im.loaded ? s + (im.width as number) + IMAGE_GAP : s, 0) - IMAGE_GAP;
      if (seqW < 1) seqW = 1;
      const totalW = seqW * CLONE_COUNT;
      const cvs = document.createElement('canvas');
      cvs.width = totalW; cvs.height = BAND_HEIGHT;
      const ctx = cvs.getContext('2d')!;
      ctx.clearRect(0, 0, totalW, BAND_HEIGHT);
      let x = 0;
      for (let clone = 0; clone < CLONE_COUNT; clone++) {
        for (const im of images) {
          if (!im.loaded || !im.img) continue;
          const cy = (BAND_HEIGHT - (im.height as number)) / 2;
          ctx.save(); ctx.globalAlpha = 0.9;
          ctx.drawImage(im.img as CanvasImageSource, x, cy, im.width as number, im.height as number);
          ctx.restore();
          x += (im.width as number) + IMAGE_GAP;
        }
      }
      return { canvas: cvs, totalWidth: totalW, sequenceWidth: seqW };
    }

    function computeCumWidths(images: Record<string, unknown>[]): number[] {
      const cum = [0];
      for (const im of images) {
        if (im.loaded) cum.push(cum[cum.length - 1] + (im.width as number) + IMAGE_GAP);
      }
      return cum;
    }

    function loadBand(bi: number, urls: string[], cb: (imgs: Record<string, unknown>[]) => void) {
      if (!urls.length) { cb([]); return; }
      const imgs: Record<string, unknown>[] = [];
      let done = 0;
      urls.forEach((url, i) => {
        const img = new Image();
        const obj: Record<string, unknown> = { loaded: false, img: null, width: 0, height: 0, ratio: 0, bandIndex: bi, imageIndex: i };
        imgs.push(obj);
        img.onload = () => {
          const r = img.naturalWidth / img.naturalHeight;
          let tw = Math.round(IMAGE_HEIGHT * r), th = IMAGE_HEIGHT;
          if (tw > MAX_IMAGE_WIDTH) { tw = MAX_IMAGE_WIDTH; th = Math.round(tw / r); }
          obj.loaded = true; obj.img = img; obj.width = tw; obj.height = th;
          obj.ratio = r; obj.displayRatio = formatRatio(r);
          localLoaded++; setLoadedCount(localLoaded);
          if (++done === urls.length) cb(imgs);
        };
        img.onerror = () => {
          makeFallback(obj, i, bi);
          localLoaded++; setLoadedCount(localLoaded);
          if (++done === urls.length) cb(imgs);
        };
        img.src = url;
      });
    }

    function addBand(bi: number, cfg: typeof BAND_CONFIGS[0], td: ReturnType<typeof buildTexture>) {
      const tex = new THREE.Texture(td.canvas);
      tex.minFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;
      tex.needsUpdate = true;
      const mat = new THREE.ShaderMaterial({
        uniforms: {
          uResolution:    { value: new THREE.Vector2(W(), H()) },
          uTexture:       { value: tex },
          uTextureWidth:  { value: td.totalWidth },
          uSequenceWidth: { value: td.sequenceWidth },
          uBandHeight:    { value: BAND_HEIGHT },
          uScroll:        { value: 0 },
          uSpeed:         { value: cfg.speed },
          uOffsetY:       { value: cfg.offsetY },
          uRotation:      { value: cfg.rotation },
          uRotationType:  { value: cfg.rotationType === 'fromLeft' ? 1.0 : 0.0 },
          uHasRotation:   { value: cfg.rotation !== 0 ? 1.0 : 0.0 },
          uBandIndex:     { value: bi },
          uCurveAmount:   { value: cfg.curveAmount },
          uCurveDirection:{ value: cfg.curveDirection },
          uTime:          { value: 0 },
        },
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        transparent: true, depthTest: false, depthWrite: false, alphaTest: 0.5,
      });
      materials.push(mat);
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
      mesh.position.z = bi * -0.1;
      scene.add(mesh); meshes.push(mesh);
    }

    function animate() {
      animId = requestAnimationFrame(animate);
      if (!isDragging) {
        targetScrollY += scrollVelocity;
        scrollVelocity *= 0.92;
        if (Math.abs(scrollVelocity) < 0.5) scrollVelocity = 0;
      }
      scrollY += (targetScrollY - scrollY) * (isDragging ? 0.3 : 0.1);
      scrollYRef.current = scrollY;
      scrollVelRef.current = scrollVelocity;
      materials.forEach(m => {
        m.uniforms.uScroll.value = scrollY;
        m.uniforms.uTime.value += 0.016;
        m.uniforms.uResolution.value.set(W(), H());
      });
      renderer.render(scene, camera);
    }

    // ── Click detection (separado de drag) ───────────────────
    function handleClickAt(x: number, y: number) {
      if (lbOpenRef.current) return;
      const h = H();
      const w = W();

      for (let bi = 0; bi < BAND_CONFIGS.length; bi++) {
        const cfg = BAND_CONFIGS[bi];
        const angle = cfg.rotation;
        const bandTopBase = (h - BAND_HEIGHT) / 2 + cfg.offsetY;
        const bandCenterY = bandTopBase + BAND_HEIGHT / 2;
        const rotCenterX = cfg.rotationType === 'fromLeft' ? 0 : w / 2;

        // Aplica a mesma rotação do shader (GLSL rotate2d) ao ponto clicado
        const cosA = Math.cos(angle), sinA = Math.sin(angle);
        const dx = x - rotCenterX, dy = y - bandCenterY;
        const rotX = cosA * dx + sinA * dy + rotCenterX;
        const rotY = -sinA * dx + cosA * dy + bandCenterY;

        // Margem extra cobre o curveOffset (máx ±20px) + borda
        const margin = 30;
        if (rotY < bandTopBase - margin || rotY > bandTopBase + BAND_HEIGHT + margin) continue;

        const data = bandClickRef.current[bi];
        if (!data || !data.urls.length) continue;

        // rotX corresponde ao originalPixelCoord.x do shader
        const sp = scrollYRef.current * data.speed;
        const wrappedX = ((rotX + sp) % data.seqWidth + data.seqWidth) % data.seqWidth;

        let imgSlotIdx = 0;
        for (let i = 0; i < data.cumWidths.length - 1; i++) {
          if (wrappedX >= data.cumWidths[i] && wrappedX < data.cumWidths[i + 1]) {
            imgSlotIdx = i; break;
          }
        }
        const clickedUrl = data.urls[imgSlotIdx % data.urls.length];
        const albumIdx = albumUrlsRef.current.indexOf(clickedUrl);
        openLb(albumIdx >= 0 ? albumIdx : 0);
        break;
      }
    }

    // ── Event handlers ────────────────────────────────────────
    const onWheel = (e: WheelEvent) => { e.preventDefault(); if (lbOpenRef.current) return; targetScrollY += e.deltaY; scrollVelocity = e.deltaY * 0.15; };
    const onKeydown = (e: KeyboardEvent) => {
      if (lbOpenRef.current) {
        if (e.key === 'Escape') closeLb();
        else if (e.key === 'ArrowRight') { const n = albumUrlsRef.current.length; const i = (lbIndexRef.current + 1) % n; setLbIndex(i); lbIndexRef.current = i; }
        else if (e.key === 'ArrowLeft')  { const n = albumUrlsRef.current.length; const i = ((lbIndexRef.current - 1) + n) % n; setLbIndex(i); lbIndexRef.current = i; }
        return;
      }
      if (e.key === 'ArrowRight') { e.preventDefault(); targetScrollY -= 50; scrollVelocity = -8; }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); targetScrollY += 50; scrollVelocity = 8; }
      else if (e.key === ' ') { e.preventDefault(); scrollVelocity = -scrollVelocity * 1.5; }
    };
    const onMousedown = (e: MouseEvent) => {
      isDragging = true; lastDragY = e.clientY; scrollVelocity = 0;
      mouseDownX = e.clientX; mouseDownY = e.clientY; hasDragged = false;
    };
    const onMousemove = (e: MouseEvent) => {
      if (!isDragging) return;
      if (Math.abs(e.clientX - mouseDownX) > DRAG_THRESHOLD || Math.abs(e.clientY - mouseDownY) > DRAG_THRESHOLD)
        hasDragged = true;
      const dy = e.clientY - lastDragY;
      targetScrollY += dy * 2.0; lastDragY = e.clientY; scrollVelocity = dy * 0.25;
    };
    const onMouseup = (e: MouseEvent) => {
      if (!hasDragged) handleClickAt(e.clientX, e.clientY);
      isDragging = false;
    };
    const onDblclick = () => { if (!lbOpenRef.current) { targetScrollY = 0; scrollVelocity = 0; } };
    const onTouchstart = (e: TouchEvent) => { e.preventDefault(); lastTouchY = e.touches[0].clientY; };
    const onTouchmove = (e: TouchEvent) => {
      e.preventDefault();
      const dy = e.touches[0].clientY - lastTouchY;
      targetScrollY += dy * 2.5; lastTouchY = e.touches[0].clientY; scrollVelocity = dy * 0.3;
    };
    const onResize = () => {
      renderer.setSize(W(), H());
      materials.forEach(m => m.uniforms.uResolution.value.set(W(), H()));
    };

    container.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKeydown);
    container.addEventListener('mousedown', onMousedown);
    window.addEventListener('mousemove', onMousemove);
    window.addEventListener('mouseup', onMouseup);
    container.addEventListener('dblclick', onDblclick);
    container.addEventListener('touchstart', onTouchstart, { passive: false });
    container.addEventListener('touchmove', onTouchmove, { passive: false });
    window.addEventListener('resize', onResize);

    // ── Fetch & init ──────────────────────────────────────────
    galleryService.getImagesByAlbum(Number(albumId)).then(galleryImages => {
      const urls = galleryImages.map(gi => gi.image);
      albumUrlsRef.current = urls;
      setAlbumUrls(urls);

      if (!urls.length) { setShowLoading(false); animate(); return; }

      // Infinite: each band gets ALL photos (offset per band for variety)
      const perBand = Math.max(MIN_PER_BAND, urls.length);
      setTotalCount(BAND_CONFIGS.length * perBand);
      bandClickRef.current = new Array(BAND_CONFIGS.length).fill(null);

      const getBandUrls = (bi: number) => {
        const offset = Math.floor(bi * urls.length / BAND_CONFIGS.length);
        return Array.from({ length: perBand }, (_, i) => urls[(i + offset) % urls.length]);
      };

      const promises = BAND_CONFIGS.map((cfg, bi) =>
        new Promise<void>(res => {
          const bandUrls = getBandUrls(bi);
          loadBand(bi, bandUrls, imgs => {
            if (imgs.length > 0) {
              const td = buildTexture(imgs);
              bandClickRef.current[bi] = {
                urls: bandUrls,
                cumWidths: computeCumWidths(imgs),
                seqWidth: td.sequenceWidth,
                speed: cfg.speed,
                offsetY: cfg.offsetY,
              };
              addBand(bi, cfg, td);
            }
            res();
          });
        })
      );

      Promise.all(promises).then(() => { setShowLoading(false); animate(); });
    }).catch(() => { setShowLoading(false); animate(); });

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKeydown);
      container.removeEventListener('mousedown', onMousedown);
      window.removeEventListener('mousemove', onMousemove);
      window.removeEventListener('mouseup', onMouseup);
      container.removeEventListener('dblclick', onDblclick);
      container.removeEventListener('touchstart', onTouchstart);
      container.removeEventListener('touchmove', onTouchmove);
      window.removeEventListener('resize', onResize);
      meshes.forEach(m => {
        scene.remove(m);
        m.geometry.dispose();
        (m.material as THREE.ShaderMaterial).uniforms.uTexture?.value?.dispose();
        (m.material as THREE.ShaderMaterial).dispose();
      });
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, [albumId]);

  return (
    <div className={styles.wrapper} ref={containerRef}>
      <button className={styles.backBtn} onClick={() => navigate(-1)}>
        <ArrowLeft size={18} /> Voltar
      </button>

      {showLoading && (
        <div className={styles.loading}>
          <div className={styles.loadingText}>Carregando... {loadedCount}/{totalCount || '...'}</div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: totalCount ? `${(loadedCount / totalCount) * 100}%` : '0%' }} />
          </div>
        </div>
      )}

      {showHint && (
        <div className={styles.hint} onClick={() => setShowHint(false)}>
          scroll | arrastar | setas ← → | clique numa foto para abrir
        </div>
      )}

      {/* ── Lightbox ── */}
      {lbOpen && albumUrls.length > 0 && (
        <div className={styles.lbOverlay} onClick={closeLb}>
          <button className={styles.lbClose} onClick={closeLb}><X size={22} /></button>

          <button className={styles.lbPrev} onClick={e => { e.stopPropagation(); prevPhoto(); }}>
            <ChevronLeft size={32} />
          </button>

          <div className={styles.lbImgWrap} onClick={e => e.stopPropagation()}>
            <img src={albumUrls[lbIndex]} alt={`Foto ${lbIndex + 1}`} className={styles.lbImg} />
          </div>

          <button className={styles.lbNext} onClick={e => { e.stopPropagation(); nextPhoto(); }}>
            <ChevronRight size={32} />
          </button>

          <div className={styles.lbCounter}>{lbIndex + 1} / {albumUrls.length}</div>
        </div>
      )}
    </div>
  );
};

export default GalleryInfinity;
