# Converter — PWA Specification

## Overview

A single-screen currency converter PWA designed for mobile use. The user selects two currencies, types an amount (or a math expression) into one field, and sees the converted result in the other field instantly. Works offline using cached exchange rates fetched from the European Central Bank.

---

## Core Concepts

### Bidirectional Conversion

There are two currency input fields — "upper" and "lower". Exactly one is active (focused) at any time. When the active field's value changes, the other field is recalculated and updated automatically. Switching focus between fields re-calculates from the newly focused field's value.

### Expression Input

Input fields accept not just numbers but also arithmetic expressions: `+`, `-`, `×` (multiply), `÷` (divide), `(`, `)`. The expression is evaluated on-the-fly as the user types. If the expression is invalid or incomplete, the opposite field is simply left unchanged (no error shown).

The `=` button evaluates the expression in the active field, replaces the field's content with the numeric result, and stores that result as the "last answer".

The `ans` button inserts the last stored answer value into the active field at the current cursor position.

### Exchange Rate Source

Rates are fetched from the ECB (European Central Bank) daily XML feed. EUR is the base currency — all other rates are expressed relative to EUR. On app load, a fresh fetch is attempted. If offline or the fetch fails, the last cached rates are used silently. The app always shows a "rates updated X ago" label.

---

## Supported Currencies

The following currencies are available for selection (shown with flag emoji):

| Code | Flag | Symbol |
| ---- | ---- | ------ |
| CZK  | 🇨🇿   | Kč     |
| EUR  | 🇪🇺   | €      |
| GBP  | 🇬🇧   | £      |
| USD  | 🇺🇸   | $      |
| CAD  | 🇨🇦   | C$     |
| HUF  | 🇭🇺   | Ft     |
| AUD  | 🇦🇺   | A$     |
| CHF  | 🇨🇭   | CHF    |
| JPY  | 🇯🇵   | ¥      |
| CNY  | 🇨🇳   | ¥      |
| HKD  | 🇭🇰   | HK$    |
| SGD  | 🇸🇬   | S$     |

Default selections: upper = CZK, lower = EUR.

---

## UI Layout

The entire app is a single screen. From top to bottom:

```
┌─────────────────────────────────────┐
│         updated 3 hours ago         │  ← small grey text, centered
│  1 CZK = 0.04 €                     │  ← exchange rate label
│ ┌───────────────────────────────┐   │
│ │ CZK                   1500    │   │ ← upper input field (active)
│ └───────────────────────────────┘   │
│ ┌───────────────────────────────┐   │
│ │ EUR                   60.00   │   │  ← lower input field
│ └───────────────────────────────┘   │
│  [CZK 🇨🇿]  ⇄  [EUR 🇪🇺]              │  ← currency selectors + swap button
│─────────────────────────────────────│
│  del    (    )    ÷                 │
│   7     8    9    ×                 │
│   4     5    6    -                 │
│   1     2    3    +                 │
│  ans    0    .    =                 │
└─────────────────────────────────────┘
```

### Top Bar

- **"updated X ago"** — small, grey, centered. Displays time since last successful rate fetch. Possible values: "updated just now", "updated N seconds/minutes/hours/days ago", "never updated". Updates on fetch.

- **Exchange rate label** — below the updated text. Format: `1 [SYMBOL] = [VALUE] [SYMBOL]`. Shows the rate from the perspective of the upper currency. Example: `1 Kč = 0.04 €`. Updates whenever either currency selection changes.

### Input Fields

Two stacked text input fields with an outlined/bordered style. Each field:

- Has the selected currency code as its placeholder/label (e.g. "CZK")
- Displays large text (~32sp equivalent)
- Does NOT show the system keyboard — input is handled entirely by the custom keyboard below
- Is tappable to become the active (focused) field

The active field has a visually distinct outline (highlighted with the primary color). The inactive field's outline is neutral.

### Currency Selector Row

Sits below the two input fields. Contains:

- **Left dropdown** — selects the currency for the upper input field
- **Swap button** — centered between the two dropdowns. Clicking it swaps the two currency selections (left ↔ right). Plays a brief scale/bounce animation on press.
- **Right dropdown** — selects the currency for the lower input field

Each dropdown shows the currency code and its flag emoji (e.g. "CZK 🇨🇿"). Tapping opens a list of all supported currencies.

### Custom Keyboard

Fixed to the bottom of the screen. A 5-row × 4-column grid of buttons, full width. Rows from top to bottom:

| Col 1 | Col 2 | Col 3 | Col 4 |
| ----- | ----- | ----- | ----- |
| del   | (     | )     | ÷     |
| 7     | 8     | 9     | ×     |
| 4     | 5     | 6     | -     |
| 1     | 2     | 3     | +     |
| ans   | 0     | .     | =     |

All buttons are equal width (stretching to fill the row). Height should be comfortable for thumb tapping (~60–70px).

---

## Visual Design

### Color Palette

| Role                | Color                                 |
| ------------------- | ------------------------------------- |
| Primary (cyan/teal) | `#00b2d2`                             |
| Primary dark        | `#0082a1`                             |
| Secondary (purple)  | `#4b1e76`                             |
| Background          | `#ffffff` (light) / dark in dark mode |
| Grey (subtle text)  | `#777777`                             |
| Error/delete accent | `#ff5449` (optional, not required)    |

### Button Colors

- **Digit buttons** (0–9, `.`): neutral/black text on light background
- **Operator buttons** (`(`, `)`, `÷`, `×`, `-`, `+`, `=`): primary color (`#00b2d2`) text
- **del** and **ans** buttons: secondary color (`#4b1e76`) text
- All buttons: no visible border, flat style, subtle press feedback

### Typography

- Input field values: large (~32sp), bold or medium weight
- Exchange rate label: medium (~16sp), normal weight
- "Updated" label: small (~12sp), grey
- Keyboard buttons: medium (~18sp)

### Active Field Indicator

The currently focused input field should have its outline drawn in the primary color (`#00b2d2`). The inactive field uses a neutral grey outline.

### Dark Mode

The app should support system dark mode. In dark mode:

- Background becomes dark (near-black)
- Input field backgrounds: slightly lighter dark surface
- Text colors invert accordingly
- Primary/secondary accent colors remain the same

---

## Behavior Specification

### Input Rules

- Tapping a digit or `.` appends it to the active field's value.
- Tapping an operator (`+`, `-`, `×`, `÷`, `(`, `)`) appends to the active field. Consecutive duplicate operators are ignored (e.g. tapping `+` twice in a row does nothing the second time). Specifically: if the last character in the field is the same operator, the tap is a no-op.
- Tapping **del**: removes the last character from the active field.
- Long-pressing **del**: clears both input fields entirely.
- Tapping **=**: evaluates the expression in the active field. If valid, replaces the field content with the numeric result and stores it as `lastAnswer`. If invalid, does nothing.
- Tapping **ans**: appends the stored `lastAnswer` value to the active field.

### Conversion Trigger

Conversion recalculates whenever:

1. The active field's content changes (after any key press)
2. Either currency selection changes
3. Focus switches between fields

The conversion formula (all rates relative to EUR as base):

- `result = inputValue × (rateOf(activeCurrency) / rateOf(otherCurrency))`
- Round output to 2 decimal places

If the active field's expression cannot be evaluated (e.g. incomplete like "12+"), leave the other field as-is.

If the active field is empty or cleared, clear the other field too.

### Focus / Active Field

- On first load, the upper field is active by default.
- Tapping an input field makes it active.
- The last active field is persisted so it survives app restarts.

### Swap Button

Swaps the currency selections: upper currency becomes lower and vice versa. The values in the input fields remain unchanged but will be recalculated based on the new currency pair. The button plays a brief scale animation (grow then shrink) on press.

### Currency Dropdowns

Opening a dropdown shows a scrollable list of all supported currencies. Each entry shows the code and flag (e.g. "CZK 🇨🇿"). Selecting one updates the corresponding field's label/hint and triggers recalculation.

---

## Data & Persistence

### Exchange Rates

- Source: `https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml`
- Format: XML. Each `<Cube currency="XXX" rate="Y.YY"/>` element contains a currency code and its rate relative to EUR.
- EUR itself has rate `1.0` (not present in the XML, assumed).
- On app start, attempt to fetch fresh rates. On success, cache them locally with a timestamp.
- On failure or no network, load from local cache silently.
- Rates and timestamp are stored in persistent local storage (survives app restart).

### Persisted State

The following must survive app restart:

| Key             | Description                                                        |
| --------------- | ------------------------------------------------------------------ |
| `upperCurrency` | Selected currency code for upper field                             |
| `lowerCurrency` | Selected currency code for lower field                             |
| `activeFied`    | Which field was last active ("upper" or "lower")                   |
| `ratesMap`      | All cached exchange rates (key: currency code, value: rate vs EUR) |
| `lastUpdated`   | Timestamp (ms since epoch) of last successful rate fetch           |

---

## PWA Requirements

- **Offline support**: the app must be fully functional offline using cached rates. If rates were never fetched, show the "never updated" label and use fallback rate of `1.0` for unknown currencies.
- **Installable**: include a web app manifest so the app can be added to the home screen. App name: "Converter". Display mode: `standalone`. Orientation: `portrait`.
- **Service worker**: cache all app assets for offline use. Background-fetch fresh rates when online.
- **No system keyboard**: suppress the virtual keyboard for the input fields. All input goes through the custom on-screen keyboard.
- **Mobile-first**: designed for portrait phone screens. Should also work on tablet/desktop but that is not the primary target.
- **No backend**: the app is entirely client-side. The only external call is the ECB rate feed.

---

## Assets

All visual assets live in the `assets/` directory at the project root. File names are prefixed with `converter-` to be unambiguous when referenced from HTML/manifest/service worker.

### App Icons

| File                     | Size       | Description                                                                                                                         |
| ------------------------ | ---------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `converter-icon-512.png` | 512×512 px | Primary app icon — used in the web app manifest and as the highest-quality source. Copied from the Android Play Store release icon. |
| `converter-icon-192.png` | 192×192 px | Standard manifest icon required by Chrome/Android for installability. Copied from the Android xxxhdpi launcher icon.                |
| `converter-icon-144.png` | 144×144 px | Medium-density icon (xxhdpi equivalent). Copied from the Android xxhdpi launcher icon.                                              |
| `converter-icon-96.png`  | 96×96 px   | Medium-density icon (xhdpi equivalent). Copied from the Android xhdpi launcher icon.                                                |
| `converter-icon-72.png`  | 72×72 px   | Low-medium-density icon (hdpi equivalent). Copied from the Android hdpi launcher icon.                                              |
| `converter-icon-48.png`  | 48×48 px   | Low-density icon (mdpi equivalent). Copied from the Android mdpi launcher icon.                                                     |

### Maskable Icons

Maskable icons allow the OS to apply its own shape (circle, squircle, etc.) to the icon. The safe zone is the inner 80% of the image.

| File                              | Size       | Description                                                                                                                |
| --------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------- |
| `converter-icon-maskable-512.png` | 512×512 px | Full-size maskable icon for the web manifest. Derived from `converter-icon-512.png`.                                       |
| `converter-icon-maskable-192.png` | 192×192 px | Standard maskable icon. Copied from the Android xxxhdpi round launcher icon, which already has circular safe-zone framing. |

### Favicons

| File                       | Size     | Description                                                                                                         |
| -------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------- |
| `converter-favicon-32.png` | 32×32 px | Standard browser tab favicon. Resized from `converter-icon-512.png`. Referenced in `<link rel="icon">`.             |
| `converter-favicon-16.png` | 16×16 px | Small browser tab favicon (legacy sizes). Resized from `converter-icon-512.png`. Referenced in `<link rel="icon">`. |

### Apple / iOS

| File                                 | Size       | Description                                                                                                                                  |
| ------------------------------------ | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `converter-apple-touch-icon-180.png` | 180×180 px | Home screen icon for iOS (Safari Add to Home Screen). Resized from `converter-icon-512.png`. Referenced via `<link rel="apple-touch-icon">`. |

### UI Icons

| File                      | Format               | Description                                                                                                                                                              |
| ------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `converter-swap-icon.svg` | SVG (24×24 viewport) | The swap/compare-arrows icon used on the currency swap button. Converted from the Android `baseline_compare_arrows_24` vector drawable. Fill color: `#00b2d2` (primary). |

---

## Edge Cases

- **Same currency selected on both sides**: show rate as `1.00`. Conversion should work correctly (value × 1).
- **Zero or negative input**: allow it — just convert normally.
- **Very large numbers**: display without scientific notation where possible; truncate to 2 decimal places.
- **Network timeout**: treat as failure, fall back to cache silently.
- **First launch, no cache, no network**: use `1.0` for all rates. Both fields show the raw input value mirrored.
- **Expression result is Infinity or NaN** (e.g. division by zero): treat as invalid, leave other field unchanged.
