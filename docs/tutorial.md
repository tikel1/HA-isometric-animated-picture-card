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

**Prompt**

> Create a 1:1 isometric cut-away render with photorealistic materials and lighting—keeping the asymmetric “doll-house” perspective while matching the real furniture, colors, and floor pattern from your room