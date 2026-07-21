# 📱 UI Design System & Mobile Responsiveness

This document details the frontend design system, color tokens, responsive breakpoints, and mobile component implementations in **WhatsAI-CRM**.

---

## 🎨 Design Aesthetics & Color Palette

The interface follows a **Modern Dark Cyberpunk Aesthetic** tailored for high visual clarity and a premium user experience:

- **Primary Background**: `#141210` (Dark warm obsidian)
- **Card Container Background**: `#1a1714` (Elevated dark card fill)
- **Brand Primary Accent**: `#e98425` (Vibrant orange glow)
- **Success Accent**: `#10b981` (Emerald green for active states)
- **Warning Accent**: `#f59e0b` (Amber yellow for warm leads / mute status)
- **Danger Accent**: `#ef4444` (Crimson red for errors / deletions)
- **Text Primary**: `#ffffff` (Pure white headers)
- **Text Muted**: `#f5efe4` (Cream off-white at 40%–70% opacity)

---

## 📐 Mobile Breakpoints & Responsive Adaptations

| Component / Page | Desktop (>= 1024px) | Mobile (< 1024px) |
|---|---|---|
| **`AdminLayout` Sidebar** | Fixed 64-wide left sidebar | Collapsible sliding drawer (`lg:` breakpoint) + 5-Icon Bottom Nav Bar |
| **`Dashboard` CRM Workspace** | 3-Column Grid (Leads, Chat, Detail) | Mobile Tab Switcher (`👥 Leads`, `💬 Chat`, `📋 Detail`) |
| **`Dashboard` KPI Cards** | 4-Column Row | 2-Column Grid |
| **`Broadcast` Page** | 7-Col Form / 5-Col Sticky Preview | Stacked Single Column + Fluid Padding |
| **`HeldMessages` Log** | Full Data Table | Mobile Card List View with compact action buttons |
| **`LiveLogs` Console** | Fixed 520px height terminal | Fluid `clamp(350px, 50vh, 520px)` with auto-wrapping action bar |

---

## 📱 Mobile Component Breakdown

### 1. `AdminLayout.jsx` Mobile Bottom Navigation Bar
Located at the bottom of the screen on devices under `lg:` breakpoint:
```jsx
<div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#141210]/95 backdrop-blur-lg border-t border-[#ebe6dd]/10 px-4 py-2 flex items-center justify-around">
    {/* Home, Blast, QuickSend, Device, Menu Drawer Toggle */}
</div>
```

### 2. `Dashboard.jsx` Mobile Tab Switcher
Allows seamless switching between the 3 main CRM panels on small screens:
```jsx
<div className="xl:hidden flex items-center bg-[#1a1714] border border-[#ebe6dd]/10 rounded-2xl p-1 gap-1">
    <button onClick={() => setMobileTab('leads')}>👥 Leads</button>
    <button onClick={() => setMobileTab('chat')}>💬 Chat</button>
    <button onClick={() => setMobileTab('detail')}>📋 Detail</button>
</div>
```
*Note: Selecting any lead from the Leads tab automatically switches the active tab to `chat` for an intuitive user flow.*
