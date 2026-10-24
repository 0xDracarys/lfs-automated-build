# Input-field visibility fix — evidence

**Professor item:** 21 Oct meeting — “apply a subtle gradient transition on input fields so
text is always clearly visible, and minimise visual effects around inputs. No glow, blur,
parallax or animated background behind any input, label or placeholder.”

**Commit under review:** `8dcc475` (the fix was *not* in that commit).

## Root cause

`CloudBuildForm.tsx` used `placeholder-gray-500` — Tailwind **v3** syntax. The project runs
Tailwind **v4**, where that class does not exist, so it was silently dropped and every
placeholder fell back to Tailwind v4's default (`color-mix(in oklab, currentColor 50%,
transparent)`), i.e. ~50 % of the input's text colour on a near-black field.

## Fix (one place, site-wide)

`lfs-learning-platform/app/globals.css` — a new **unlayered** block (unlayered CSS beats
Tailwind's `@layer utilities`, so the dead legacy class can no longer win):

| Property | Value | Why |
| --- | --- | --- |
| `background-image` | `linear-gradient(180deg, rgba(255,255,255,.065) 0%, rgba(255,255,255,.025) 42%, rgba(0,0,0,.22) 100%)` | the subtle gradient the professor asked for; static, never animated |
| `color` | `#f5f5f5` | 15.6:1 on `#141414` |
| `::placeholder` | `#a3a3a3`, `opacity: 1` | 7.4:1 on `#141414` — readable on a projector |
| `box-shadow` / `filter` / `backdrop-filter` | `none` | no glow, no blur, nothing behind the text |
| `caret-color` | `#22c55e` | platform accent, does not sit behind text |
| `:focus-visible` | `outline: 2px solid ring` | focus stays visible |
| `:-webkit-autofill` | `#f5f5f5` text on `#1b1b1b` | Chrome's white autofill can no longer produce white-on-white |
| transitions | `background-image` + `border-color`, 200 ms ease-out | border/gradient only; no layout shift, no motion over text |

`CloudBuildForm.tsx` also had its two dead `placeholder-gray-500` classes replaced with
`placeholder:text-neutral-400` so the component is correct on its own.

## Files in this folder

| File | What it shows |
| --- | --- |
| `before-100.png` | `/auth/login` at 100 % zoom, commit `8dcc475` (pre-fix) |
| `after-100.png` | `/auth/login` at 100 % zoom, post-fix |
| `before-125.png` | `/auth/login` at 125 % zoom, commit `8dcc475` (pre-fix) |
| `after-125.png` | `/auth/login` at 125 % zoom, post-fix |
| `comparison-100.png` | zoomed side-by-side crop of the email field at 100 % |
| `comparison-125.png` | zoomed side-by-side crop of the email field at 125 % |

Measured in-browser after the fix:

```
background-image : linear-gradient(rgba(255,255,255,0.067) 0%, rgba(255,255,255,0.024) 42%, rgba(0,0,0,0.22) 100%)
color            : rgb(245, 245, 245)
::placeholder    : rgb(163, 163, 163)   opacity 1
```

## Notes

* The gradient is deliberately subtle — it is a legibility cue, not decoration.
* Nothing behind an input animates. There is no parallax, glow or blur anywhere near a field.
* The fix is global, so it also covers the wizard, the VulnBox form and the auth pages.
