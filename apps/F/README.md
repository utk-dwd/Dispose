<div align="center">

# 🗑️ Disposable Wallets (Frontend Prototype)

Minimal, responsive "temp wallet" interface inspired by temp-mail.org – built with React + TypeScript, TailwindCSS, and shadcn-style components. Purely frontend (no real chain calls) with mocked wallet generation & history.

</div>

## ✨ Features

- Generate ephemeral mock wallets (address, balance, network)
- One-click actions: Get Wallet, Copy, Refresh Balance, Delete (replace)
- Wallet history table (recent 20)
- Responsive layout (desktop multi-column / mobile stacked)
- Clean minimalist UI with bright mint highlight (#00FF91)
- Mock login flow (Privy placeholder) & navigation tabs (Home / History / Settings)

## 🧱 Tech Stack

- React 19 + TypeScript + Vite
- TailwindCSS (custom config with mint theme + glow effects)
- shadcn-inspired headless components (Button, Card, Table, etc.)
- Radix Slot primitive (`@radix-ui/react-slot`)
- class-variance-authority + tailwind-merge + clsx
- React Router v7

## 📁 Project Structure

```
apps/F/
  src/
    components/
      ui/ (primitive reusable components)
      Layout.tsx (Header/Footer/Layout wrappers)
    context/WalletContext.tsx (mock wallet state + history)
    pages/ (Home, Login, History, Settings, Deep placeholder)
    lib/utils.ts (cn utility)
    App.tsx (routing + providers)
    main.tsx (entry)
  tailwind.config.ts
  postcss.config.js
  index.html
  package.json
```

## 🚀 Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Run Dev Server

```bash
pnpm dev
```
Visit: http://localhost:5173

### 3. Type Check

```bash
pnpm exec tsc --noEmit
```

### 4. Lint

```bash
pnpm run lint
```

### 5. Production Build

```bash
pnpm build
```

### 6. Preview Build

```bash
pnpm preview
```

## 🧪 Mock Behavior

- Addresses are random hex (no persistence)
- Balance is random per refresh (0 → 0.5 ETH range mock)
- Networks rotate between: Base / Ethereum / Arbitrum
- Delete simply generates a new wallet (history retained)

## 🖥️ UI / UX Notes

- Desktop: Header + content area + footer action bar
- Mobile: Stacked sections; actions available near primary wallet card
- Bright Mint (#00FF91) used for primary actions + highlights
- Cards: rounded-2xl, soft shadow, subtle hover scale
- Tooltips: lightweight (title attribute placeholder; can upgrade to Radix Tooltip later)

## 🧩 Components Implemented

- Button (variants: default, secondary, outline, ghost, destructive)
- Card (Header/Title/Description/Content/Footer)
- Table (simple responsive wrapper)
- Input, Badge, Separator, ScrollArea, Tooltip (placeholder)
- Layout (Header, Footer, ActionBar, AppLayout)

## 🔐 Auth Placeholder

`/login` simulates Privy sign-in (no external SDK included). After click → redirect to `/`.

## 🛠️ Customization

- Adjust theme in `tailwind.config.ts`
- Extend variants in `src/components/ui/button.tsx`
- Add real chain integrations by replacing logic in `WalletContext.tsx`

## 📦 Libraries Used

| Library | Purpose |
|---------|---------|
| react / react-dom | UI rendering |
| react-router-dom | Client routing |
| tailwindcss + autoprefixer + postcss | Styling |
| class-variance-authority | Variantable component patterns |
| tailwind-merge / clsx | Class name composition |
| @radix-ui/react-slot | Slot primitive for polymorphic components |

## 🧪 Future Enhancements (Ideas)

- Real Privy auth & session gating
- Real wallet provisioning (AA / custodial service)
- Balance polling & toast notifications
- Export history (JSON / CSV)
- Replace tooltip placeholder with Radix Tooltip
- Dark mode toggle

## 📄 License

Prototype code – adapt freely within your project context.

---

Made with 🗑️ mint energy.
