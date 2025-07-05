# Animated Room Card – Complete Walk-Through  


This tutorial shows you how to turn a single photo of a real room into a fully animated “doll-house” card in Home Assistant, where

* a WebM sequence of blinds glides smoothly to whatever percentage the cover entity reports, and
* a WebM fan loop spins at a speed that matches the fan entity.

All the heavy lifting runs in the browser; the Home Assistant server just supplies entity states.



## 0. Prerequisites
| I Used | Why you need it |Typical alternatives|
|------|---------|---------------|
| ChatGPT | Produce the first photoreal isometric cut-away still of your room | Any image-generation model (ChatGPT, DALL·E, Midjourney…)
| [Kling.ai](https://klingai.com/h5-app/invitation?code=7BLZEBP5VTT5) (referral link) | Add motion: blinds closing, fan spinning, day-to-night, etc. | Runway, Pika, DIFY
| Adobe After Effects| Split the video into separate PNG frames, one folder per moving part | DaVinci Resolve, Blender’s VSE
| FFmpeg 6.x | Encode those PNGs as VP9-WebM, every frame an I-frame | Works on macOS, Linux, Windows
| Home-Assistant 2024.4+ | Where the custom cards live | Core, OS, Container—any flavour

---

## 1. Generate the isometric still

Upload an image of the room you wish to create to chatGPT along with this prompt.

**Prompt**

> Create a 1:1 isometric cut-away render with photorealistic materials and lighting—keeping the asymmetric “doll-house” perspective while matching the real furniture, colors, and floor pattern from your room

Tips:
* Make sure the room is lit and light bulbs and lamps are off
* Use wide lense


## 2. Add motion with an image-to-video model
 
Feed the still into [Kling.ai](https://klingai.com/h5-app/invitation?code=7BLZEBP5VTT5) (or another tool). You can create animation sequences of the covers, fans, day/night, etc'. In this example, I used [Kling.ai](https://klingai.com/h5-app/invitation?code=7BLZEBP5VTT5) (referral link) with the following prompt.

**Prompt:**
> The serene minimalist bedroom with a herringbone floor and soft green walls transitions as the dark electric window blinds slowly slide down, the ceiling fan begins rotating smoothly, captured in isometric perspective with a stationary camera



Tips:
* Make sure to use “**stationary camera**” in every prompt.  
* If an object needs transparency (fan blades) erase it in the still and let Kling render it separately.

Download the MP4 once you’re happy.

---

## 3. Split the MP4 into PNG sequences

Open After Effects (any editor that can export PNG with alpha works).

For each moving object:

* Import the MP4.
* Create a comp and trim it so the action starts and ends cleanly.
Blinds: first frame = 0 %, last frame = 100 %. Aim for exactly 100 frames at 25 fps.
Fan: two-second seamless loop at 60 fps (≈ 72 frames).
* Export Composition ▸ Add to Render Queue
	* Format = PNG sequence
	* Channels = RGB + Alpha
	* Color = Straight (un-matted)
	* Filenames example: blinds_000.png … blinds_099.png, fan_000.png ….

Result: two folders, each full of PNGs with transparent backgrounds.


---

## 4. Encode the sequences as seek-perfect WebM

Download & install FFmpeg (Windows / PowerShell)

```bash
winget install --id Gyan.FFmpeg --source winget
```

Run the commands

```bash
# blinds
ffmpeg -framerate 25 -i blinds_%03d.png \
       -c:v libvpx-vp9 -pix_fmt yuva420p \
       -g 1 -keyint_min 1 -b:v 0 -crf 28 \
       blinds_100f.webm

# fan loop
ffmpeg -framerate 60 -i fan_%03d.png \
       -c:v libvpx-vp9 -pix_fmt yuva420p \
       -b:v 0 -crf 30 \
       fan_loop.webm
```


* -g 1 -keyint_min 1 ⇒ GOP = 1 → instant seeking.
* yuva420p keeps transparency.
* Adjust -crf (lower = higher quality, larger file).


## 5. Copy assets into Home-Assistant

Example structure (choose any folder names):

```bash
/config/www/images/3d_floorplan/Isometric Bedroom/
  ├─ blinds_000.png … blinds_099.png
  ├─ fan_000.png … fan_071.png
  ├─ blinds_100f.webm
  └─ fan_loop.webm



## 6. Add the custom cards

* Copy ha-blinds-frame-card.js and ha-fan-loop-card.js from this repo’s www/
folder into /config/www/ on your HA instance.
* Settings → Dashboards → Resources

```bash
/local/ha-blinds-frame-card.js?v=15   (JavaScript Module)
/local/ha-fan-loop-card.js?v=2        (JavaScript Module)


(Files live in www/ inside this repo – copy them to /config/www.)

## 7. YAML for your picture-elements view

type: picture-elements
image: /local/images/<YOUR_FOLDER>/bg.jpg          # ⬅ background still

elements:
  # ── Blinds ─────────────────────────────────────
  - type: custom:ha-blinds-frame-card
    entity: cover.<YOUR_BLINDS_ENTITY>             # e.g. cover.bedroom_blinds
    src: /local/images/<YOUR_FOLDER>/blinds_100f.webm
    png_path: /local/images/<YOUR_FOLDER>/blinds_  # prefix for blinds_000.png …
    frames: 100
    fps: 25
    motorSpeedPercent: 10        # adjust to your motor
    motorSpeedSeconds: 5
    cooldownMs: 15000
    style:
      left: 82%
      top: 44%
      width: 32%

  # ── Fan ────────────────────────────────────────
  - type: custom:ha-fan-loop-card
    entity: fan.<YOUR_FAN_ENTITY>                  # e.g. fan.bedroom_ceiling
    src: /local/images/<YOUR_FOLDER>/fan_loop.webm
    png_path: /local/images/<YOUR_FOLDER>/fan_     # prefix for fan_000.png …
    frames: 72
    fps: 60
    style:
      left: 50%
      top: 18%
      width: 90px


png_path must be the prefix of your numbered PNGs (no index, no extension).

The cards automatically fall back to those PNGs on mobile where autoplay may be blocked.


## 8 · What happens behind the scenes
*Blinds card
	*Because every WebM frame is an I-frame, the browser can jump straight to frame N.
	*The card calculates duration from your motor spec (percent / speed) and eases the motion with JavaScript requestAnimationFrame.
	*When the glide stops, the current video frame is drawn onto a hidden canvas and shown as a PNG overlay—no “tap-to-play” icon.

*Fan card
	*WebM silently loops; when entity.state='off' the first frame is frozen.
	*Playback rate is mapped from percentage (0-100) or preset_mode (low/medium/high).



## 9 · Support
If this saved you a weekend of trial-and-error,
buy me a coffee and keep the ideas brewing ☕ – https://buymeacoffee.com/tikel

Happy automating!
