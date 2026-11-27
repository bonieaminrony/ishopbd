# iShopBD design system (storefront)

One set of rules for every customer-facing page, tab, window and form, so the whole site
looks like one product. The parts live in `src/components/ui/ds.tsx`. Build new screens
from them; do not hand-style a new button, chip or tab.

The admin panel has its own gray theme (`html.admin-dark`) and is not covered here.

## Colours

| Role | Value | Use for |
|---|---|---|
| Primary red | `--color-primary` #da1522 | Main action button, prices, selected state, discount badge |
| Navy | `--color-secondary` #26225a | Page and section titles, the active tab |
| Text | gray-900 / gray-700 / gray-500 | Body, labels, secondary notes |
| Lines | gray-200 (cards), gray-300 (inputs) | Borders and dividers |
| Surface | white, gray-50 for quiet panels | Backgrounds |

No purple anywhere on the storefront. No gradients, no coloured badge rainbows: one red for
emphasis, navy for titles, grays for everything else. Green is only for "in stock".

## Sizes

| Thing | Size |
|---|---|
| Control height (chips, inputs, secondary buttons) | 44px `h-11`; text inputs 48px `h-12` |
| Main action button | 48px `h-12`, full width on phones |
| Corner radius | controls 12px `rounded-xl`; cards and windows 16px `rounded-2xl`; pills `rounded-full` |
| Spacing | 16px inside a card (`p-4`), 20px between sections (`gap-5` / `mt-5`), 8px between chips |
| Text | page title 20–24px bold navy; section title 16px semibold navy; label 13px semibold; body 14px; small note 12px |
| Product photos | always inside `ProductThumb` (square, white, `object-contain`), so every photo is the same size |

Shadows: none, except the primary action button. Separate things with a gray-200 border or space.

## Parts

| Part | When to use |
|---|---|
| `Button` (`primary` / `secondary` / `ghost`, `md` / `lg`, `block`, `loading`) | Any action. One `primary` per screen area. |
| `PillButton` | Small actions beside a title: Share, Save, Size guide. |
| `OptionChip` + `OptionGroup` | Any one-of-many choice: colour, size, delivery area. The group shows "Title: chosen value". |
| `Field` + `fieldClass` | Every text input and textarea, with the label above. |
| `Card` | Any boxed section or window body. Title in navy, 16px padding. |
| `Tabs` | Any tab row. Pills; scroll sideways on phones instead of wrapping. |
| `ProductThumb`, `MiniProductCard` | Any product picture or small product tile. |
| `RatingStars` | Star rating with count. |
| `shareLink()` (`src/utils/share.ts`) | The only Share action: opens the phone's own share sheet, copies the link where there is none. |

## Writing

- Bengali first for customer actions ("অর্ডার কনফার্ম করুন", "কার্টে রাখুন"); keep the existing `t(bn, en)` helper.
- A button says what happens. No "Submit", no arrows or emoji in button text.
- Don't add a label above content unless it helps someone find something.
- Hide sections that have no content instead of showing an empty box.

## Checklist for a new screen

1. Built from the parts above; no new one-off colours, radii or heights.
2. Works at 390px wide and on desktop; tap targets at least 44px.
3. One primary action, clearly the strongest thing on screen.
4. Empty data hides its section.
5. Screenshot it on phone and desktop before shipping.
