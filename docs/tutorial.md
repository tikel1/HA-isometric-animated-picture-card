# Complete Guide: From Real Room to Animated Home Assistant Card

This comprehensive tutorial shows you how to transform a photograph of any room into a stunning animated Home Assistant dashboard card. You'll create:

- **Animated blinds** that move smoothly to match your actual cover position
- **Spinning fans** that rotate at the speed of your real fan
- **Day/night lighting** that changes based on time or sensors
- **Any other animated elements** you can imagine

The best part? **No 3D software experience required!** We'll use AI tools to do all the heavy lifting.

## What You'll Create

By the end of this tutorial, you'll have a professional-looking isometric room visualization where every animated element responds to your actual Home Assistant entities in real-time.

![Fan Animation Demo](examples/Isometric-Bedroom.gif)

## Prerequisites

You'll need access to these tools:

| Tool | Purpose | Why This One | Alternatives |
|------|---------|--------------|--------------|
| **ChatGPT**| Create 3D isometric room from your photo | Best AI image generation quality | Midjourney, Claude, etc. |
| **[Kling.ai](https://klingai.com/h5-app/invitation?code=7BLZEBP5VTT5)** (Referral link)| Add motion to your still image | Excellent at creating smooth animations | Runway, Pika, Luma |
| **Adobe After Effects** | Split video into individual frames | Professional frame extraction | DaVinci Resolve, Blender |
| **FFmpeg** | Convert frames to WebM format | Industry standard, free | Built into many video editors |
| **Home Assistant** | Where your card will live | Version 2024.4+ required | Any HA installation type |

---

## Step 1: Create Your Isometric Room

### Take Your Source Photo

First, photograph your room with these tips:
- **Use wide-angle lens** or step back to capture the entire room
- **Turn on all lights** - we want the room well-lit
- **Turn off decorative lamps** - we'll add lighting effects later
- **Clear the room** of clutter for best results

### Generate the 3D Isometric Version

![Original](examples/original.jpg)

1. **Go to ChatGPT** and upload your room photo
2. **Use this exact prompt:**

```
Create a 1:1 isometric cut-away render with photorealistic materials and lighting. Keep the asymmetric "doll-house" perspective while matching the real furniture, colors, and floor pattern from this room. The room should be well-lit with natural lighting, and all lamps/decorative lights should be off.
```

3. **Refine if needed** - you might need to ask for adjustments:
   - "Make the walls more green"
   - "Add the bookshelf I see in the corner"
   - "Make the floor pattern more accurate"

4. **Save the final image** - this becomes your background

### Tips for Better Results
- If ChatGPT struggles with complex rooms, try focusing on one area at a time
- You can generate multiple versions and combine elements
- Don't worry about moving parts (blinds, fans) - we'll animate those next

---

## Step 2: Create Your Animations

Now we'll bring your room to life by adding motion. We'll create separate animations for each moving element.

### Planning Your Animations

Think about what in your room moves:
- **Blinds/curtains** - opening and closing
- **Fans** - rotating blades
- **Lights** - on/off, dimming
- **Day/night** - changing lighting throughout the day



### Create Blinds Animation

1. **Go to Kling.ai** and upload your isometric room image
2. **Use this prompt:**

![kling](examples/kling.jpg)

```
The serene minimalist bedroom with herringbone floor and soft green walls transitions as the dark electric window blinds slowly slide down completely closed. The ceiling fan remains stationary. Camera is completely stationary with isometric perspective maintained throughout.
```

3. **Important settings:**
   - **Duration:** 5 seconds (gives us enough frames)
   - **Camera:** Stationary/Fixed
   - **Quality:** High

4. **Wait for generation** (usually 5-10 minutes)
5. **Download the MP4** when ready

**Key prompt tips:**
- Always include "**camera is completely stationary**"
- Be specific about what moves and what doesn't
- Describe the start and end state clearly

### Create Fan Animation

1. **Upload your isometric room** again to Kling.ai
2. **Use this prompt:**

```
The bedroom ceiling fan begins rotating smoothly and continuously. The blinds remain completely stationary. Camera is stationary with isometric perspective maintained. The fan blades rotate at medium speed creating a seamless loop.
```

**For animations like ceiling fans, it's recommended to render them separately. You can cut out the fan from the original image using Photoshop or any other editing tool, and then upload it to Kling as a separate asset.
![fan](examples/isolated-fan.jpg)

3. **Download the result** - this should be a seamless loop


### Create Additional Animations (Optional)

You can create more animations:
- **Day to night lighting changes**
- **Lamps turning on/off**
- **Curtains blowing in wind**

Each animation should focus on ONE moving element while keeping everything else static.

---

## Step 3: Prepare Your Animation Files

Now we need to convert your MP4 videos into the specific formats our Home Assistant cards need.

### Understanding the File Requirements

Our cards need two versions of each animation:
- **WebM files** - for desktop browsers (smooth video playback)
- **PNG sequences** - for mobile devices (individual frame images)

### Install Required Software

**For Windows:**
```powershell
# Install FFmpeg
winget install --id Gyan.FFmpeg --source winget
```

**For Mac:**
```bash
# Install FFmpeg with Homebrew
brew install ffmpeg
```

**For Linux:**
```bash
# Install FFmpeg
sudo apt install ffmpeg
```

### Extract PNG Frames with After Effects

1. **Open After Effects** and create a new project
2. **Import your MP4** (blinds animation first)
3. **Create a new composition** from your footage
4. **Trim the timeline** so the animation starts and ends cleanly:
   - **For blinds:** First frame = fully open, last frame = fully closed
   - **For fans:** Create a perfect 2-second loop
5. **Add to Render Queue** (Composition → Add to Render Queue)
6. **Set output format:**
   - **Format:** PNG Sequence
   - **Channels:** RGB + Alpha (for transparency)
   - **Color:** Straight (Unmatted)
7. **Set filename:** `blinds_[###].png` (three digits)
8. **Render** - this creates numbered PNG files

**[INSERT EXAMPLE: After Effects interface showing render settings]**

### Convert to WebM Format

Open terminal/command prompt in your PNG folder:

**For Blinds (Frame-based animation):**
```bash
ffmpeg -framerate 25 -i blinds_%03d.png -c:v libvpx-vp9 -pix_fmt yuva420p -g 1 -keyint_min 1 -b:v 0 -crf 28 blinds_100f.webm
```

**For Fan (Loop animation):**
```bash
ffmpeg -framerate 60 -i fan_%03d.png -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 0 -crf 30 fan_loop.webm
```

**What these commands do:**
- `-framerate 25/60` - sets playback speed
- `-g 1 -keyint_min 1` - makes every frame seekable (important for blinds)
- `-crf 28/30` - quality setting (lower = better quality, bigger file)
- `yuva420p` - preserves transparency

**[INSERT EXAMPLE: Terminal showing successful conversion]**

---

## Step 4: Install the Custom Cards

### Download the Card Files

1. **Go to the GitHub repository** (link in documentation)
2. **Download these files:**
   - `ha-blinds-frame-card.js`
   - `ha-fan-loop-card.js`
3. **Copy them to** your Home Assistant's `/config/www/` folder

### Add to Lovelace Resources

**Option A: Through UI**
1. Go to **Settings → Dashboards → Resources**
2. Click **Add Resource**
3. Add these entries:
   - URL: `/local/ha-blinds-frame-card.js`
   - Type: JavaScript Module
   - URL: `/local/ha-fan-loop-card.js`
   - Type: JavaScript Module

**Option B: Through YAML**
Add to your `configuration.yaml`:
```yaml
lovelace:
  resources:
    - url: /local/ha-blinds-frame-card.js
      type: module
    - url: /local/ha-fan-loop-card.js
      type: module
```

### Organize Your Files

Create this folder structure in `/config/www/`:
```
/config/www/
├── ha-blinds-frame-card.js
├── ha-fan-loop-card.js
└── images/
    └── my-bedroom/
        ├── background.jpg          # Your isometric room
        ├── blinds_100f.webm       # Blinds WebM
        ├── fan_loop.webm          # Fan WebM
        ├── blinds_000.png         # Blinds PNG frames
        ├── blinds_001.png         # (000 to 099)
        ├── ...
        ├── blinds_099.png
        ├── fan_000.png            # Fan PNG frames
        ├── fan_001.png            # (000 to 071)
        ├── ...
        └── fan_071.png
```

**[INSERT EXAMPLE: File manager showing correct folder structure]**

---

## Step 5: Create Your Dashboard Card

### Basic Picture Elements Setup

Create a new dashboard card with this YAML:

```yaml
type: picture-elements
image: /local/images/my-bedroom/background.jpg
elements:
  # We'll add animated elements here
```

### Add Blinds Animation

Add this to your `elements:` section:

```yaml
  - type: custom:ha-blinds-frame-card
    entity: cover.bedroom_blinds              # ← Replace with your cover entity
    src: /local/images/my-bedroom/blinds_100f.webm
    png_path: /local/images/my-bedroom/blinds_
    frames: 100                               # Total frames in animation
    fps: 25                                   # Frames per second
    speed: 0.5                                # Animation speed (0.5 = slower)
    cooldownMs: 15000                         # Wait 15 seconds between animations
    easing: true                              # Smooth animation curves
    style:
      left: 25%                               # Position on your background
      top: 30%
      width: 15%
      height: 40%
```

### Add Fan Animation

Add this to your `elements:` section:

```yaml
  - type: custom:ha-fan-loop-card
    entity: fan.bedroom_ceiling               # ← Replace with your fan entity
    src: /local/images/my-bedroom/fan_loop.webm
    png_path: /local/images/my-bedroom/fan_
    frames: 72                                # Total frames in loop
    fps: 60                                   # Frames per second
    playMap:                                  # Speed mapping
      - [0, 0]                                # 0% fan speed = stopped
      - [25, 0.5]                             # 25% fan speed = half animation speed
      - [50, 1.0]                             # 50% fan speed = normal speed
      - [75, 1.5]                             # 75% fan speed = 1.5x speed
      - [100, 2.0]                            # 100% fan speed = double speed
    style:
      left: 50%                               # Position on your background
      top: 15%
      width: 10%
      height: 10%
```

### Position Your Animations

To find the right position values:
1. **Start with rough estimates** (left: 50%, top: 50%)
2. **View your card** and see where the animation appears
3. **Adjust the percentages** until it lines up with your background
4. **Fine-tune the size** with width and height

**[INSERT EXAMPLE: Dashboard showing positioned animations]**

---

## Step 6: Test and Refine

### Test Your Animations

1. **Check blinds:** Change your cover position and watch the animation
2. **Check fan:** Turn your fan on/off and adjust speed
3. **Test on mobile:** Ensure PNG fallback works properly

### Common Issues and Solutions

**Animation not playing:**
- Check that entity IDs match your actual devices
- Verify file paths are correct
- Look for errors in Home Assistant logs

**Poor performance:**
- Reduce frame count (fewer frames = smaller files)
- Lower the FPS setting
- Optimize PNG file sizes

**Positioning problems:**
- Use browser developer tools to inspect element positioning
- Test on multiple screen sizes
- Fine-tune percentages gradually

### Optimization Tips

**For better performance:**
- Keep WebM files under 5MB each
- Use 100 frames or fewer for blinds
- Use 60-72 frames for fans
- Optimize PNG files with compression tools

**For mobile compatibility:**
- Test on actual mobile devices
- PNG sequences should be under 100 frames
- Keep individual PNG files under 100KB

---

## Step 7: Advanced Customization

### Add More Animations

Once you have the basics working, you can add:
- **Multiple fans** with different speeds
- **Day/night lighting changes** based on time
- **Weather effects** based on weather sensors
- **Seasonal variations** based on calendar

### Custom Speed Mappings

For fans with different characteristics:
```yaml
playMap:
  - [0, 0]      # Off
  - [10, 0.2]   # Very slow start
  - [30, 0.8]   # Gradual ramp up
  - [70, 1.8]   # Fast
  - [100, 3.0]  # Maximum speed
```

### Styling Options

Add visual effects to your animations:
```yaml
style:
  left: 50%
  top: 25%
  width: 20%
  height: 20%
  opacity: 0.9                    # Slight transparency
  filter: brightness(1.1)         # Brighter
  transform: rotate(5deg)         # Slight rotation
  border-radius: 10px            # Rounded corners
```

**[INSERT EXAMPLE: Advanced dashboard with multiple animations]**

---

## Troubleshooting Guide

### Files Not Loading
- Check file paths are correct (case sensitive)
- Verify files exist in `/config/www/`
- Clear browser cache
- Check Home Assistant logs for errors

### Animations Not Smooth
- Reduce frame count
- Lower FPS setting
- Optimize file sizes
- Check device performance

### Mobile Issues
- Ensure PNG files are named correctly (`blinds_000.png`, `blinds_001.png`, etc.)
- Test PNG sequence plays smoothly
- Check mobile browser compatibility

### Entity Not Responding
- Verify entity ID is correct
- Check entity has the expected attributes
- Test entity changes in Home Assistant

---

## What's Next?

### Share Your Creation
- Post screenshots in Home Assistant community
- Share your YAML configurations
- Help others troubleshoot their setups

### Expand Your Setup
- Create animations for other rooms
- Add seasonal variations
- Integrate with automation scenarios
- Create themed collections

### Advanced Techniques
- **Multiple animation layers** for complex scenes
- **Conditional animations** based on multiple sensors
- **Interactive elements** that respond to clicks
- **Sound effects** synchronized with animations

---

## Support and Resources

### Getting Help
- **Home Assistant Community Forum** - Active community support
- **GitHub Issues** - Report bugs and request features
- **Documentation** - Complete technical reference

### Show Your Appreciation
If this guide helped you create something amazing:
- ⭐ **Star the GitHub repository**
- ☕ **[Buy me a coffee](https://www.buymeacoffee.com/tikel)**
- 📸 **Share your results** with the community

### Keep Learning
- **Explore the full documentation** for advanced features
- **Try different AI tools** for creating animations
- **Experiment with different room styles** and themes

---

## Final Tips for Success

1. **Start simple** - Get one animation working before adding more
2. **Test frequently** - Check your progress at each step
3. **Keep backups** - Save your working configurations
4. **Document your settings** - Note what works for your specific setup
5. **Be patient** - AI generation and rendering takes time, but results are worth it

**Happy automating!** 🎉

---

*Created with ❤️ for the Home Assistant community*