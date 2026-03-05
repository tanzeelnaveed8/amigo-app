# Design System – uisample (Figma Ghost Mode) → Current App

Use this as the single source of truth. Replace current UI/UX with these values.

---

## 1. Colors

### Dark / Night theme (default)
| Token | Hex | Usage |
|-------|-----|--------|
| `bgGradientStart` | `#050509` | Top of gradient backgrounds |
| `bgGradientEnd` | `#141426` | Bottom of gradient |
| `bgScreen` | `#0A0A14` | Solid screen bg |
| `bgCard` | `#141422` | Cards, modals |
| `bgCardHover` | `#1A1A2E` | Card hover |
| `bgInput` | `#0E0E18` | Input background |
| `bgMessageOwn` | `#7B5CFF` | Own message bubble |
| `bgMessageOther` | `#1F2033` | Other user bubble |
| `bgNav` | `#050509` @ 80% | Nav bar (with backdrop blur) |
| `textPrimary` | `#FFFFFF` | Headings, primary text |
| `textSecondary` | `#C5C6E3` | Body, subtitles |
| `textMuted` | `#8B8CAD` | Labels, hints |
| `textPlaceholder` | `#5E607E` | Input placeholder |
| `accent` | `#9B7BFF` | Primary accent (purple) |
| `accentLight` | `#B88DFF` | Gradient end, sender name |
| `accentGradientStart` | `#9B7BFF` | Button gradient start |
| `accentGradientEnd` | `#B88DFF` | Button gradient end |
| `border` | `rgba(255,255,255,0.04)` | Dividers, card borders |
| `borderInput` | `rgba(255,255,255,0.12)` | Input border |
| `borderFocus` | `#9B7BFF` | Input focus ring |
| `danger` | `#FF6363` | Delete, error |
| `success` | `#10B981` | Online dot, success |
| `warning` | `#FFA500` / `#FBBF24` | Flagged, mute |

### Day / Light theme
| Token | Hex |
|-------|-----|
| `bgScreen` | `#F5F5F7` |
| `bgCard` | `#FFFFFF` |
| `bgCardAlt` | `#F8F9FA` |
| `textPrimary` | `#111111` |
| `textSecondary` | `#6B6B8A` |
| `textMuted` | `#8B8CAD` |
| `border` | `rgba(0,0,0,0.08)` |
| `accent` | `#2563EB` (blue for day) |

### Ghost theme (purple)
- Same as Dark but accent stays `#9B7BFF` everywhere.
- `themeColor` day: `#2563EB`, night: `#3B82F6`, ghost: `#9B7BFF`.

---

## 2. Typography

| Element | Size | Weight | Line height | Notes |
|---------|------|--------|-------------|--------|
| Splash title | 32px | bold | 38px | "Ghost Mode" |
| Screen title | 28px | bold | 34px | "Welcome" |
| Card title | 20px | semibold | tight | Section titles |
| Nav title | 17px | semibold | tight | Header |
| Body | 16px | normal | 22px | Body copy |
| Body small | 14px | normal | 20px | Descriptions |
| Label | 12px | normal | 18px | "or", hints |
| Caption | 12px | normal | tight | Nav subtitle |
| Message text | 15px | normal | relaxed | Chat bubble |
| Sender name | 11px | medium | - | Above other's bubble |
| Time | 10px | - | - | In bubble |

Font family: system sans (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`). In RN use `FontFamily.robotoBold` / `robotoRegular` / `robotoMedium`.

---

## 3. Spacing & Radius

- **Radius:** Buttons `rounded-2xl` (16px), Cards `rounded-[24px]` (24px), Inputs `rounded-xl` (12px), Pills `rounded-full`.
- **Padding:** Screen horizontal `24px` (p-6), Card padding `20px` (p-5), Button vertical `14px` (h-14 for lg).
- **Gaps:** Between sections `24px`, between list items `10–12px`, icon–text `8–12px`.

---

## 4. Animations

- **Page enter:** `initial opacity 0, y 20` → `animate opacity 1, y 0`, duration `0.4`, delay `0.2–0.3`.
- **Ghost icon float:** `y: [-4, 4, -4]` or `[-8, 8, -8]`, duration `2.5–3s`, ease `easeInOut`, repeat infinite.
- **Button tap:** `whileTap scale 0.96` (or 0.97).
- **Toggle:** thumb animate `x: 2 → 22`, spring stiffness 500, damping 30.

---

## 5. Components (uisample → RN)

### Entry / Choose Mode
- Background: linear gradient `#050509` → `#141426`.
- Centered ghost icon (80px) with float animation.
- Title: "Welcome" (28px bold white).
- Subtitle: "Choose how you want to continue" (16px, #C5C6E3).
- Primary button: gradient `#9B7BFF` → `#B88DFF`, rounded-2xl, h-14, shadow `0px 0px 20px rgba(155,123,255,0.3)`.
- Secondary button: bg `#181830`, border `rgba(255,255,255,0.04)`.
- Divider: "or" with two lines `rgba(255,255,255,0.04)`.
- Footer note: 12px #8B8CAD.

### Splash
- Same gradient bg.
- Ghost icon 120px, color #9B7BFF (or gradient #5FD4FF → #9B7BFF), float animation.
- Title: "Ghost Mode" (32px bold white).
- Subtitle: "Anonymous · Temporary · Free" (14px #8B8CAD).

### Top Nav Bar
- Height 56px, sticky, bg `#050509` @ 80%, backdrop blur, border-bottom `rgba(255,255,255,0.08)`.
- Back: ArrowLeft 24px, touch area 44px, color white.
- Title: 17px semibold white, centered.
- Subtitle (optional): 12px #8B8CAD.

### Buttons (GhostButton)
- Primary: gradient #9B7BFF → #B88DFF, text white, rounded-2xl, shadow purple.
- Secondary: bg #181830, border rgba(255,255,255,0.04).
- Ghost: transparent, text #C5C6E3, hover bg rgba(255,255,255,0.04).
- Danger: bg #FF6363.
- Sizes: sm h-9, md h-12, lg h-14. Padding horizontal md 24px, lg 32px.

### Input (GhostInput)
- Height 48px, rounded-xl, bg #0E0E18, border rgba(255,255,255,0.12).
- Focus: border & ring #9B7BFF.
- Placeholder #5E607E, label #8B8CAD.

### Message bubble
- Own: bg #7B5CFF, text white, rounded-2xl, rounded-br-sm.
- Other: bg #1F2033, rounded-bl-sm, sender name #B88DFF 11px.
- Time 10px, right-aligned.

### Chat list card
- Unread: left edge 4px gradient #3B82F6 → #60A5FA.
- Online dot: 15px, #10B981, border 3px (bg color).
- Unread badge: gradient #3B82F6 → #2563EB, 22px min height, 11px font bold white.

---

## 6. Icons

- Use **lucide-react-native** (Ghost, LogIn, ArrowLeft, Settings, etc.).
- Size: nav 24px, list 20–28px, button 20px.
- Color: primary white or accent #9B7BFF.

---

## 7. Logo / Brand

- "Ghost Mode" / "AMIGO" text: accent color or white.
- Splash ghost: fill #9B7BFF or gradient #5FD4FF → #9B7BFF.

Apply these across: ChooseModeScreen, AnimatedSplashScreen, Drawer, Settings, Wallet, Chat list, Message bubbles, Headers.
