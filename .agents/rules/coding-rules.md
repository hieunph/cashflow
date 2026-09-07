# CODING RULES & ARCHITECTURE FOR CASHFLOW PILOT (NEXT.JS)

When working on this codebase, always strictly adhere to the following rules:

1. **Framework & Stack:**
   - Next.js (App Router), React 18/19, TypeScript (Strict), Tailwind CSS, Lucide React, Recharts, Zustand.
2. **Layered Architecture:**
   - Pure Domain/Financial logic goes into `lib/engine/`. No React hooks or DOM dependencies here.
   - State management via Zustand with `persist` middleware in `store/`.
   - UI components in `components/` categorized by module.
   - Routing and pages in `app/`.
3. **Type Safety:**
   - Strictly no `any`.
   - Currency amounts are integers (`number`), formatted as currency string only at the UI display layer using `formatVND`.
4. **Offline First & Hydration:**
   - Handle Zustand LocalStorage hydration cleanly to prevent React SSR hydration mismatch.
5. **Mobile-First & Design System:**
   - Modern Slate/Navy palette, clear semantic colors for 3 Buckets (Spending: Blue, Buffer: Amber/Emerald, House Fund: Emerald).
   - Touch targets $\ge 44\text{px}$, responsive layout optimized for mobile screens.
6. **Financial Precision:**
   - Implement strict edge case checks: prevent division by zero in DSR, floor buffers at zero, guard against negative amounts.
