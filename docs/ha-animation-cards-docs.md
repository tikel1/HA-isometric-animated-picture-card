# Home Assistant Animation Cards Documentation

This documentation covers two custom Home Assistant cards that provide animated visualizations for entities using WebM videos on desktop and PNG sequences on mobile devices.

## Overview

Both cards are designed to work within Home Assistant's picture-elements card configuration and provide smooth animations that respond to entity state changes. They automatically detect mobile devices and switch to PNG sequences for better compatibility.

---

## ha-blinds-frame-card

### Purpose
Animates blinds/covers by playing specific frames of a video or PNG sequence based on the cover's position. The animation smoothly transitions between the current position and target position when the cover state changes.

### Key Features
- **Smooth Frame-by-Frame Animation**: Plays specific frames rather than continuous video
- **Mobile Compatibility**: Automatically switches to PNG sequences on mobile devices
- **Easing Animation**: Optional smooth easing between positions
- **Anti-Spam Protection**: Built-in cooldown period to prevent excessive animations
- **Auto-Freeze**: Freezes on the exact frame when animation completes

### Configuration Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `entity` | string | **Required** | The cover entity ID (e.g., `cover.bedroom_blinds`) |
| `src` | string | **Required** | Path to the WebM video file for desktop |
| `png_path` | string | Optional | Base path for PNG sequence (auto-detects mobile) |
| `fps` | number | 25 | Frames per second of the source video/animation |
| `frames` | number | 100 | Total number of frames in the animation |
| `speed` | number | 0.5 | Speed multiplier (0.5 = 50% speed = slower animation) |
| `cooldownMs` | number | 15000 | Cooldown period in milliseconds between animations |
| `easing` | boolean | true | Enable smooth easing animation |
| `style` | object | {} | CSS styles applied to the card container |

### How It Works
1. **Position Mapping**: Converts cover position percentage to frame number
   - 0% cover position (fully open) → frame 99 (last frame)
   - 100% cover position (fully closed) → frame 0 (first frame)
2. **Animation**: Smoothly animates between current and target frames
3. **Cooldown**: Prevents new animations during the cooldown period
4. **Device Detection**: Uses PNG sequences on mobile for better performance

### PNG Sequence Naming Convention
PNG files should be named sequentially: `blinds_000.png`, `blinds_001.png`, `blinds_002.png`, etc.

---

## ha-fan-loop-card

### Purpose
Provides continuous looping animation for fans with variable speed based on fan speed percentage or preset modes. The animation speed changes dynamically to match the fan's current speed.

### Key Features
- **Variable Speed Animation**: Animation speed matches fan speed
- **Continuous Looping**: Seamless loop animation when fan is on
- **Multiple Speed Mapping**: Configurable speed mapping for different fan speeds
- **Preset Mode Support**: Works with fan preset modes (low, medium, high)
- **Mobile Compatibility**: Automatic PNG sequence support for mobile devices

### Configuration Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `entity` | string | **Required** | The fan entity ID (e.g., `fan.bedroom_fan`) |
| `src` | string | **Required** | Path to the WebM video file for desktop |
| `png_path` | string | Optional | Base path for PNG sequence (auto-detects mobile) |
| `fps` | number | 60 | Base frames per second for the animation |
| `frames` | number | 72 | Total number of frames in the loop animation |
| `playMap` | array | See below | Speed mapping configuration |
| `style` | object | {} | CSS styles applied to the card container |

### Default Speed Mapping (playMap)
```yaml
playMap:
  - [0, 0]     # 0% speed → stopped
  - [20, 0.5]  # 20% speed → 0.5x playback rate
  - [40, 1]    # 40% speed → 1x playback rate
  - [60, 1.5]  # 60% speed → 1.5x playback rate
  - [80, 2]    # 80% speed → 2x playback rate
  - [100, 2.5] # 100% speed → 2.5x playback rate
```

### How It Works
1. **Speed Detection**: Reads fan speed from `percentage` attribute or `preset_mode`
2. **Rate Mapping**: Maps speed percentage to playback rate using `playMap`
3. **Animation Control**: 
   - Fan OFF → Animation stops at frame 0
   - Fan ON → Continuous loop at calculated playback rate
4. **Preset Mode Fallback**: If no percentage, uses preset modes:
   - `low` → 0.5x speed
   - `medium` → 1x speed  
   - `high` → 2x speed

### PNG Sequence Naming Convention
PNG files should be named sequentially: `fan_000.png`, `fan_001.png`, `fan_002.png`, etc.

---

## Common Features

### Mobile Detection
Both cards automatically detect mobile browsers and switch to PNG sequences:
- **Desktop**: Uses WebM video for smooth playback
- **Mobile**: Uses PNG sequences for better compatibility

### Picture Elements Integration
Both cards are designed to work seamlessly with Home Assistant's picture-elements card:
- No automatic `ha-card` wrapper (maintains clean integration)
- Supports all CSS positioning and sizing
- Pointer events disabled to prevent interference

### Performance Optimization
- **Preloading**: PNG frames are preloaded for smooth playback
- **Error Handling**: Graceful fallback when frames fail to load
- **Memory Management**: Efficient canvas-based rendering for PNG sequences

---

## Usage Examples

### Basic Blinds Configuration
```yaml
- type: custom:ha-blinds-frame-card
  entity: cover.living_room_blinds
  src: /local/animations/blinds.webm
  png_path: /local/animations/blinds_
  style:
    left: 10%
    top: 20%
    width: 80%
    height: 60%
```

### Advanced Fan Configuration
```yaml
- type: custom:ha-fan-loop-card
  entity: fan.ceiling_fan
  src: /local/animations/fan.webm
  png_path: /local/animations/fan_
  fps: 30
  frames: 60
  playMap:
    - [0, 0]
    - [25, 0.8]
    - [50, 1.2]
    - [75, 1.8]
    - [100, 2.5]
  style:
    left: 45%
    top: 15%
    width: 10%
    height: 10%
```

---

## File Structure Requirements

### For Blinds Card
```
/local/images/3d_floorplan/Isometric Bedroom/
├── blinds_100f.webm          # WebM video (desktop)
├── blinds_000.png            # PNG frame 0 (mobile)
├── blinds_001.png            # PNG frame 1
├── ...
└── blinds_099.png            # PNG frame 99
```

### For Fan Card
```
/local/images/3d_floorplan/Isometric Bedroom/
├── fan_72f.webm              # WebM video (desktop)
├── fan_000.png               # PNG frame 0 (mobile)
├── fan_001.png               # PNG frame 1
├── ...
└── fan_071.png               # PNG frame 71
```

---

## Troubleshooting

### Common Issues
1. **Animation not playing**: Check entity ID and file paths
2. **PNG not loading on mobile**: Verify PNG file naming convention
3. **Performance issues**: Reduce frame count or fps for better performance
4. **Positioning problems**: Adjust `style` parameters for proper placement

### Browser Compatibility
- **Desktop**: Modern browsers with WebM support
- **Mobile**: All browsers (falls back to PNG sequences)
- **iOS**: PNG sequences recommended for best performance