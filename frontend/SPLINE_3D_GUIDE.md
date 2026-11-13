# SevaCoop — 3D Model & Spline Integration Guide

This project features a dedicated **Hero 3D Model Showcase** built to mirror high-end cyberpunk / brutalist product landing pages, with direct support for **Spline 3D scenes** (`@splinetool/react-spline`).

---

## 🚀 How to Add or Swap Spline 3D Models

### Method 1: On-Screen Live Switcher (No code edits needed)
1. Open the website in your browser.
2. In the center 3D viewport, click the **`SWAP 3D / SPLINE`** button at the bottom-right of the viewport.
3. Paste any `.splinecode` link (e.g., from [Spline.design](https://spline.design)) or choose one of the pre-loaded 3D presets.
4. Click **Apply**. The model renders live immediately.

---

### Method 2: Permanent Configuration in Code (Recommended for Final Submission)
Open `src/config/splineConfig.js`:

```javascript
export const SPLINE_CONFIG = {
  // Option A: Paste your public Spline URL
  defaultSplineUrl: "https://prod.spline.design/YOUR_SCENE_ID/scene.splinecode",

  // Option B: Or use a local file placed in frontend/public/
  // defaultSplineUrl: "/scene.splinecode",

  enableSpline: true,
  ...
};
```

---

### Method 3: Exporting from Spline.design
1. Create or open your 3D model in [Spline.design](https://spline.design).
2. Click **Export** in the top navigation bar.
3. Select the **Spline Viewer** or **Code** tab.
4. Under **URL**, copy the generated `.splinecode` link:
   - Example: `https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode`
5. Paste it into `src/config/splineConfig.js` or in the on-screen modal.

---

## 🛡️ Built-in Procedural Three.js Fallback
If no Spline URL is supplied or if network is unavailable, the 3D viewer automatically renders an interactive, metallic procedural 3D model:
- OrbitControls (Click and drag to rotate in 360°)
- Real-time metallic reflections & physical materials
- Dynamic lighting (cyan / emerald / white rim lights)
- Zero crash risk during college project evaluations or offline presentations.

---

## 🎨 Theme & Typography Tokens
- **Background**: Stoneblack (`#0d0e12`) with fine technical CAD grid (`bg-grid-stoneblack`).
- **Typography**: Oversized brutalist headings (`SEVA MATTERS.`) with `Space Grotesk` and `Chakra Petch`.
- **Top Bar**: Wireframe globe badge, on-demand reticle crosshair, and kicker banner.
- **Spec Cards**: 5 numbered cards (`01` to `05`) for Electrical, Plumbing, Carpentry, Sanitation, and HVAC.
- **Brand Strip**: `"TRUSTED BY FORWARD-THINKING TEAMS"` partner grid at the bottom.
