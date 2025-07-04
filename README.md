# HA isometric animated picture card
 Tiny custom cards that let Home-Assistant picture-elements play WebM loops and frame-accurate videos whose speed or frame instantly follows any entity state (0-100 % or presets)

# 🏡 Animated Room Card for Home-Assistant

A photo-real **isometric room** that reacts to your smart-home entities:
blinds glide smoothly to any %, the ceiling-fan spins at live speed,
and everything runs client-side with two tiny JavaScript cards.

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20me%20a%20coffee-donate-yellow?logo=buymeacoffee)](https://buymeacoffee.com/tikel)

<p align="center">
  <img src="docs/demo.gif" width="550">
</p>

---

## ✨ Features
| Card | What it does |
|------|--------------|
| **`ha-blinds-frame-card.js`** | Plays a 0-→100 WebM sequence; seeks to the exact frame with easing and realistic motor timing. |
| **`ha-fan-loop-card.js`**    | Loops a WebM and maps entity speed → `playbackRate` (percentage **or** preset). |
| Mobile-safe  | Automatic PNG freeze-frame overlay—no grey “tap-to-play” triangle. |
| Pure Lovelace| No custom HACS, no build step—copy & refresh. |

---

## ⚡ Quick install

```yaml
# Dashboards ▶ Resources
resources:
  - url: /local/ha-blinds-frame-card.js?v=14
    type: module
  - url: /local/ha-fan-loop-card.js?v=1
    type: module
