/* ha-blinds-frame-card.js – v15 smooth + auto-freeze PNG + mobile support */
class HaBlindsFrameCard extends HTMLElement {
  setConfig(cfg) {
    this._cfg = Object.assign({
      fps: 25,
      frames: 100,
      cooldownMs: 15000,  // Fixed 15 second cooldown
      easing: true,
      speed: 0.5  // 50% speed multiplier
    }, cfg);
  }

  /* ── HA pushes entity state ─────────────────────────── */
  set hass(hass) {
    if (!this._built) this._build();
    if (Date.now() < this._quietUntil || this._animating) return;
    
    const ent = hass.states[this._cfg.entity];
    if (!ent || ent.attributes.current_position === undefined) return;
    
    const pct = ent.attributes.current_position;
    const tgt = Math.round((100 - pct) * (this._cfg.frames - 1) / 100);
    
    if (tgt !== this._current) {
      this._startGlide(tgt);
    }
  }

  /* ── detect mobile browsers ─────────────────────────── */
  _isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (navigator.userAgent.includes('Chrome') && /Mobile/i.test(navigator.userAgent));
  }

  /* ── one-time DOM build ─────────────────────────────── */
  _build() {
    this._built = true;
    this._frames = this._cfg.frames;
    this._stepSec = 1 / this._cfg.fps;
    
    // Check if mobile - use PNG sprite sheet instead of WebM
    this._usePNG = this._isMobile();
    
    if (this._usePNG) {
      this._buildPNGVersion();
    } else {
      this._buildVideoVersion();
    }
    
    this._current = 0;
    this._quietUntil = 0;
    this._animating = false;
  }

  /* ── build PNG version for mobile ───────────── */
  _buildPNGVersion() {
    this._canvas = document.createElement('canvas');
    Object.assign(this._canvas.style, {
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      display: 'block'
    });
    
    // Preload all PNG frames
    this._pngFrames = [];
    this._loadedFrames = 0;
    this._pngPath = this._cfg.png_path || '/local/images/3d_floorplan/Isometric Bedroom/blinds_';
    
    // Load all frames
    for (let i = 0; i < this._frames; i++) {
      const img = new Image();
      const frameNum = String(i).padStart(3, '0'); // 000, 001, 002, etc.
      img.src = `${this._pngPath}${frameNum}.png`;
      img.onload = () => {
        this._loadedFrames++;
        if (this._loadedFrames === this._frames) {
          this._allPNGsLoaded = true;
          this._drawPNGFrame(0);
        }
      };
      img.onerror = () => {
        console.error(`Failed to load PNG frame: ${img.src}`);
      };
      this._pngFrames[i] = img;
    }
    
    const wrap = document.createElement('div');
    Object.assign(wrap.style, {
      position: 'relative',
      width: '100%',
      height: '100%',
      overflow: 'hidden'
    });
    
    // Apply user styles to wrapper
    if (this._cfg.style) {
      Object.assign(wrap.style, this._cfg.style);
    }
    
    wrap.appendChild(this._canvas);
    
    // Don't wrap in ha-card for picture-elements
    this.appendChild(wrap);
  }

  /* ── build video version for desktop ───────────────── */
  _buildVideoVersion() {
    this._v = Object.assign(document.createElement('video'), {
      src: this._cfg.src,
      muted: true,
      loop: false,
      playsInline: true,
      preload: 'auto'
    });
    
    // Style for picture-elements compatibility
    Object.assign(this._v.style, {
      width: '100%',
      height: '100%',
      objectFit: 'fill', // Fill the container completely
      pointerEvents: 'none',
      display: 'block'
    });
    
    // Wait for video to load
    this._v.addEventListener('loadeddata', () => {
      this._v.pause();
      this._v.currentTime = 0;
    });
    
    // Canvas overlay for freezing frames
    this._canvas = document.createElement('canvas');
    Object.assign(this._canvas.style, {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      opacity: '0'
    });
    
    const wrap = document.createElement('div');
    Object.assign(wrap.style, {
      position: 'relative',
      width: '100%',
      height: '100%',
      overflow: 'hidden'
    });
    
    // Apply user styles to wrapper
    if (this._cfg.style) {
      Object.assign(wrap.style, this._cfg.style);
    }
    
    wrap.append(this._v, this._canvas);
    
    // Don't wrap in ha-card for picture-elements
    this.appendChild(wrap);
  }

  /* ── draw PNG frame (for mobile) ───────────────────── */
  _drawPNGFrame(frameIndex) {
    if (!this._allPNGsLoaded || frameIndex < 0 || frameIndex >= this._frames) return;
    
    const canvas = this._canvas;
    const ctx = canvas.getContext('2d');
    const img = this._pngFrames[frameIndex];
    
    if (!img || !img.complete) return;
    
    // Set canvas size to match container
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    // Clear and draw the specific frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }

  /* ── main animation routine ─────────────────────────── */
  _startGlide(target) {
    const start = this._current;
    const distance = target - start;
    const dir = Math.sign(distance);
    if (!dir) return;

    // Fixed duration based on distance and speed
    const pct = Math.abs(distance) / (this._cfg.frames - 1) * 100;
    const baseDuration = pct * 50; // Base 50ms per percent
    const totalMs = baseDuration / this._cfg.speed; // Apply speed multiplier (0.5 = 50% speed = slower)

    this._animating = true;
    this._quietUntil = Date.now() + this._cfg.cooldownMs;

    // Hide overlay while moving (video only)
    if (!this._usePNG) {
      this._canvas.style.opacity = '0';
    }

    const ease = t => this._cfg.easing
      ? (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t) : t;

    const t0 = performance.now();
    const step = now => {
      const p = Math.min((now - t0) / totalMs, 1);
      const f = start + distance * ease(p);
      this._current = Math.round(f);

      if (this._usePNG) {
        // PNG version - draw frame directly
        this._drawPNGFrame(this._current);
      } else {
        // Video version - seek to frame
        this._v.currentTime = f * this._stepSec;
      }

      if (p < 1) {
        requestAnimationFrame(step);
      } else {
        this._animating = false;
        this._current = target;
        if (!this._usePNG) {
          this._freezeCurrentFrame();
        }
      }
    };

    if (!this._usePNG) {
      this._v.pause();
      this._v.currentTime = start * this._stepSec;
    }
    
    requestAnimationFrame(step);
  }

  /* ── draw exact stop-frame to PNG overlay (video only) ── */
  _freezeCurrentFrame() {
    if (this._usePNG) return;
    
    const video = this._v;
    const cvs = this._canvas;
    
    // Get the actual displayed size of the video
    const videoRect = video.getBoundingClientRect();
    
    // Set canvas resolution to match video
    cvs.width = video.videoWidth;
    cvs.height = video.videoHeight;
    
    const ctx = cvs.getContext('2d');
    ctx.drawImage(video, 0, 0, cvs.width, cvs.height);
    this._v.pause();
    this._canvas.style.opacity = '1';
  }

  getCardSize() { return 2; }
}

customElements.define('ha-blinds-frame-card', HaBlindsFrameCard);