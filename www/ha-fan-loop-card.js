/* ha-fan-loop-card.js – v2 with mobile PNG support */
class HaFanLoopCard extends HTMLElement {
  setConfig(cfg) {
    /* cfg.playMap lets you map speed → playbackRate
       by default: 0.5×, 1×, 1.5×, 2× for 25 %, 50 %, 75 %, 100 % */
    this._cfg = Object.assign({
      fps: 60,
      frames: 72, // Number of PNG frames for mobile
      playMap: [ [0,0], [20,0.5], [40,1], [60,1.5], [80,2], [100,2.5] ],
    }, cfg);
  }

  set hass(hass) {
    if (!this._built) this._build();
    const ent = hass.states[this._cfg.entity];
    if (!ent) return;
    const on = ent.state === 'on';
    
    /* --- decide playback rate --- */
    let rate = 0;
    if (on) {
      if (ent.attributes.percentage !== undefined) {
        const pct = ent.attributes.percentage;
        rate = this._lookupRate(pct);
      } else if (ent.attributes.preset_mode) {
        const preset = ent.attributes.preset_mode;
        rate = {low:0.5, medium:1, high:2}[preset] ?? 1;
      } else {
        rate = 1;              // default
      }
    }
    
    /* --- apply --- */
    if (rate === 0) {                               // off → freeze
      if (this._usePNG) {
        this._stopPNGAnimation();
      } else {
        this._v.pause();
        this._v.currentTime = 0;                    // frame 0 still
      }
    } else {
      if (this._usePNG) {
        this._startPNGAnimation(rate);
      } else {
        this._v.playbackRate = rate;
        if (this._v.paused) this._v.play();
      }
    }
  }

  /* ── detect mobile browsers ─────────────────────────── */
  _isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (navigator.userAgent.includes('Chrome') && /Mobile/i.test(navigator.userAgent));
  }

  /* ------------ helpers ------------ */
  _lookupRate(pct) {
    const table = this._cfg.playMap;
    for (let i = table.length - 1; i >= 0; i--) {
      if (pct >= table[i][0]) return table[i][1];
    }
    return 0.5;
  }

  _build() {
    this._built = true;
    this._frames = this._cfg.frames;
    
    // Check if mobile - use PNG sequence instead of WebM
    this._usePNG = this._isMobile();
    
    if (this._usePNG) {
      this._buildPNGVersion();
    } else {
      this._buildVideoVersion();
    }
    
    this._currentFrame = 0;
    this._animationId = null;
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
    this._pngPath = this._cfg.png_path || '/local/images/3d_floorplan/Isometric Bedroom/fan_';
    
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
    
    // Don't wrap in ha-card for picture-elements compatibility
    this.appendChild(wrap);
  }

  /* ── build video version for desktop ───────────────── */
  _buildVideoVersion() {
    this._v = Object.assign(document.createElement('video'), {
      src: this._cfg.src,
      loop: true,
      muted: true,
      playsInline: true,
    });
    
    // Style for picture-elements compatibility
    Object.assign(this._v.style, {
      width: '100%',
      height: '100%',
      objectFit: 'fill',
      pointerEvents: 'none',
      display: 'block'
    });
    
    // Apply user styles
    if (this._cfg.style) {
      Object.assign(this._v.style, this._cfg.style);
    }
    
    this._v.addEventListener('loadeddata', () => this._v.pause()); // start frozen
    
    const wrap = document.createElement('div');
    Object.assign(wrap.style, {
      position: 'relative',
      width: '100%',
      height: '100%',
      overflow: 'hidden'
    });
    
    wrap.appendChild(this._v);
    
    // Don't wrap in ha-card for picture-elements compatibility
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

  /* ── PNG animation control ───────────────────── */
  _startPNGAnimation(rate) {
    if (!this._allPNGsLoaded) return;
    
    this._stopPNGAnimation(); // Stop any existing animation
    
    const frameDelay = 1000 / (this._cfg.fps * rate); // Adjust FPS by playback rate
    let lastFrameTime = 0;
    
    const animate = (currentTime) => {
      if (currentTime - lastFrameTime >= frameDelay) {
        this._currentFrame = (this._currentFrame + 1) % this._frames;
        this._drawPNGFrame(this._currentFrame);
        lastFrameTime = currentTime;
      }
      this._animationId = requestAnimationFrame(animate);
    };
    
    this._animationId = requestAnimationFrame(animate);
  }

  _stopPNGAnimation() {
    if (this._animationId) {
      cancelAnimationFrame(this._animationId);
      this._animationId = null;
    }
    this._currentFrame = 0;
    if (this._allPNGsLoaded) {
      this._drawPNGFrame(0); // Show first frame (stopped position)
    }
  }

  getCardSize() { return 1; }
}

customElements.define('ha-fan-loop-card', HaFanLoopCard);