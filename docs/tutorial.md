# Animated Room Card – Complete Walk-Through  
(from GPT prompt → Kling animation → Home-Assistant)

> Works with **ha-blinds-frame-card v15** and **ha-fan-loop-card v2**  
> Desktop uses WebM, mobile falls back to a pre-rendered PNG sequence.

---

## 0. Prerequisites
| Tool | Purpose |
|------|---------|
| ChatGPT (or any other image generation model) | Generate the photoreal isometric still |
| [Kling.ai](https://klingai.com/h5-app/invitation?code=7BLZEBP5VTT5) (referral link) | Turn the still into a short MP4 animation |
| Adobe After Effects (or any NLE) | Split MP4 → PNG sequences |
| FFmpeg 6.x | Encode all-I-frame WebM |
| Home-Assistant 2024.4+ | Lovelace dashboard |

---

## 1. Create the still

Upload an image of the room you wish to create to chatGPT along with this prompt.

**Prompt**

> Create a 1:1 isometric cut-away render with photorealistic materials and lighting—keeping the asymmetric “doll-house” perspective while matching the real furniture, colors, and floor pattern from your room

Tips:
* Make sure the room is lit and light bulbs and lamps are off
* Use wide lense


## 2. Animate it in Kling
 
Use any image to video tools in order to animate the image. You can create animation sequences of the covers, fans, day/night, etc'. In this example, I used [Kling.ai](https://klingai.com/h5-app/invitation?code=7BLZEBP5VTT5) (referral link) with the following prompt.

**Prompt:**
> The serene minimalist bedroom with a herringbone floor and soft green walls transitions as the dark electric window blinds slowly slide down, the ceiling fan begins rotating smoothly, captured in isometric perspective with a stationary camera



Tips:
* Make sure to use “**stationary camera**” in every prompt.  
* If an object needs transparency (fan blades) erase it in the still and let Kling render it separately.

Download the MP4 once you’re happy.

---

## 3. Export PNG sequences

| Layer | Frames | Export |
|-------|--------|--------|
| **Blinds** | 100 frames (0 % → 100 %) | PNG sequence **RGB + Alpha**<br> `blinds_000.png … blinds_099.png` |
| **Fan**    | 72 frames @ 60 fps (2 s loop) | PNG sequence **RGB + Alpha**<br> `fan_000.png … fan_071.png` |

*(Mobile-fallback will load these PNGs.)*

---

## 4. Encode WebM (desktop)

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
