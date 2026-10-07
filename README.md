# AuraCalc — Modern Dynamic Calculator Web App

A modern, fancy, and user-friendly calculator web application built with pure **HTML5**, **CSS3**, and **JavaScript** (ES6+).

![AuraCalc Banner](https://img.shields.io/badge/Stack-HTML%20%7C%20CSS%20%7C%20JS-blue?style=for-the-badge)
![Themes](https://img.shields.io/badge/Themes-4%20Vibrant%20Palettes-purple?style=for-the-badge)
![Audio](https://img.shields.io/badge/Audio-Synthesized%20Web%20Audio-green?style=for-the-badge)

---

## ✨ Highlights & Features

### 🎨 1. Fancy & Dynamic UI
- **Ambient Glowing Mesh Background**: Dynamic moving aurora orbs create depth and visual vibrance.
- **Interactive Mouse Spotlight**: Reactive glowing spotlight that follows the user's cursor across the screen.
- **Tactile 3D Button Effects**: Smooth button-press physics with radial ripple animations.
- **Glassmorphism Aesthetic**: Frosted blur glass cards (`backdrop-filter`) with subtle luminous neon/pastel borders.
- **4 Beautiful Themes**:
  1. 🌌 **Dark Nebula** (Default modern obsidian with indigo & violet glow)
  2. ⚡ **Cyber Neon** (High-voltage cyberpunk black with hot pink & electric cyan)
  3. 🌿 **Emerald Aurora** (Deep spruce green with jade and emerald glow)
  4. ❄️ **Frosted Pearl** (Ultra-clean modern light glassmorphic mode)
  *(Themes persist across sessions in `localStorage`)*

---

### 🧮 2. Smart & User-Friendly Calculation Engine
- **Dual-Line Display**: Formula expression on top, formatted current input below.
- **Live Ghost Preview**: Computes and previews the answer in real-time as you type, before pressing `=`!
- **Auto-Scaling Font Size**: Display numbers dynamically adjust font size to prevent overflow.
- **Copy & Paste Support**:
  - One-click **Copy** button with toast feedback ("Copied to clipboard!").
  - `Ctrl + C` (or `Cmd + C`) to copy current result.
  - `Ctrl + V` (or `Cmd + V`) to paste any number into the calculator.
- **Memory Functions**: `MC` (Clear), `MR` (Recall), `M+` (Add), and `M-` (Subtract) with an active `[M]` badge indicator.
- **Trigonometric Modes**: Seamless switch between **DEG** (Degrees) and **RAD** (Radians).

---

### 🧪 3. Collapsible Scientific Panel
Expandable drawer packed with essential advanced scientific functions:
- Trigonometry: `sin`, `cos`, `tan`, `sin⁻¹`, `cos⁻¹`, `tan⁻¹`
- Powers & Roots: `x²`, `√x`, `xʸ`, `10ˣ`, `¹/x`
- Logarithms: `log₁₀`, `ln`
- Constants: `π` (Pi), `e` (Euler's number)
- Advanced Math: `x!` (Factorials), `|x|` (Absolute value), `mod` (Modulo remainder)
- Parentheses: `(` and `)` for grouped formulas

---

### 📜 4. Timestamped Calculation History
- Slide-out side drawer with all previous operations and calculated results.
- **One-Click Recall**: Tap any item from the history list to reload it directly into the calculator.
- **Persistent Storage**: Saved in `localStorage` so calculations aren't lost on page reload.
- **Clear All**: One-click wipe of history when needed.

---

### 🔊 5. Synthesized Audio Feedback (Web Audio API)
- Pure synthesized mechanical tactile click sounds generated via the Web Audio API without needing external MP3 audio files.
- Works 100% offline.
- Toggle sound on or off with the speaker button in the header.

---

### ⌨️ 6. Full Keyboard Support & Visual Keypress Feedback
Typing on your physical keyboard highlights the on-screen buttons with a visual press flash!

| Key | Action |
| :--- | :--- |
| `0` – `9` | Input numbers |
| `+`, `-`, `*`, `/` | Basic arithmetic operations |
| `Enter` or `=` | Calculate result |
| `%` | Percentage |
| `Backspace` | Delete last character |
| `Esc` or `Delete` | Clear all (`AC`) |
| `(` and `)` | Parentheses |
| `^` | Exponent (power) |
| `s`, `t` | `sin` and `tan` functions |
| `Ctrl + C` | Copy current result |
| `Ctrl + V` | Paste number into display |
| `H` | Toggle calculation history drawer |
| `?` | Toggle keyboard shortcuts modal |

---

## 🚀 How to Run

1. Open the project folder:
   ```bash
   c:\Users\KUMAR\Onedrive\Desktop\Vibe Coding
   ```
2. Double-click **`index.html`** or right-click and choose **"Open with Chrome"** (or Edge, Firefox, Safari).
3. Alternatively, serve with any local HTTP server:
   ```bash
   npx serve .
   # or
   python -m http.server 3000
   ```


   <img width="842" height="911" alt="{FC0398E2-779A-4FC2-9EF2-5085A84C8321}" src="https://github.com/user-attachments/assets/008c9fa9-dd5c-433d-83ac-478d77c61ac9" />


