![example](https://github.com/tikel1/HA-isometric-animated-picture-card/blob/main/examples/Isometric%20Bedroom.gif)

# 🏡 Animated Room Card for Home-Assistant

Bring your picture-elements dashboard to life:  
*Blinds glide to any %, ceiling-fan spins at live speed—powered by two tiny JavaScript cards.*

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20me%20a%20coffee-donate-yellow?logo=buymeacoffee)](https://www.buymeacoffee.com/tikel)

[![Buy Me a Coffee](examples/coffee.webm)](https://www.buymeacoffee.com/yourusername)




<p align="center">
  <img src="docs/demo.gif" width="550">
</p>

---

## ✨ Features
| Card | Purpose |
|------|---------|
| **`ha-blinds-frame-card.js`** | Plays a 0→100 WebM sequence and seeks to the exact frame with easing + real-world motor timing. |
| **`ha-fan-loop-card.js`**    | Loops a WebM and sets the `playbackRate` from entity speed (`percentage` *or* `preset_mode`). |
| **Mobile-safe freeze frame** | The last frame is captured to a PNG overlay, so phones never show a grey “tap-to-play” icon. |
| **Pure Lovelace** | No build step, no HACS—just copy two files into `/config/www`. |

---

## ⚡ Quick install

```yaml
# Dashboards → Resources
resources:
  - url: /local/ha-blinds-frame-card.js?v=14
    type: module
  - url: /local/ha-fan-loop-card.js?v=1
    type: module
