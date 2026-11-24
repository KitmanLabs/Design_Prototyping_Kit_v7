# CLAUDE.md

## Project overview
Athlete management design system prototype for Kitman Labs. React 18, Vite 7, Material UI 7 and MUI X 7, Emotion, Storybook 10, ESLint 9.
This repo is a **design system reference implementation**: correct use of design tokens and components is the primary quality bar.

## Common commands
```
npm run dev                     # Dev server at localhost:3001
npm run build                   # Production build
npm run storybook               # Component browser at localhost:6006
npm run build-storybook         # Static Storybook build (runs in CI)
npm test                        # Vitest
npm run lint                    # ESLint (JS/JSX), config in eslint.config.js
npm run lint:css                # Stylelint (CSS)
npm run validate-design-system  # Full design system check (runs pre-commit and in CI)
npm run figma:publish           # Publish Code Connect templates to Figma (needs FIGMA_ACCESS_TOKEN)
npm run prototype:clone -- <dir> --intent IN0015   # Clone the primitives into a new prototype version
```

## Architecture
```
src/
├── App.jsx                # routes; App wraps every route in LayoutWithMainNav
├── components/            # App components (Icon, Card, PlayerAvatar, MainNavigation, drawers)
├── data/                  # All mock data, option lists, fixtures, form templates
├── floorplans/            # Page types: PageFrame and its regions; every page starts here
├── pages/                 # Page-level views (Calendar, Medical, Messaging, forms)
├── playbook-components/   # Playbook Components (MUI wrappers ported from the iP monorepo); edit here
├── stories/               # Storybook stories for the Playbook Components
├── styles/                # design-tokens.css and global styles
└── utils/                 # Shared utilities (pickerDates.js for date pickers)
```

## Use the components, don't rebuild them (critical)
Prototypes here exist to use iP's real components. Use the Playbook components, floorplans and the patterns in their stories as they are, with their own styling.
- Never assemble a stand-in for a component the kit has (for example a custom select instead of the Playbook `Autocomplete` with tick boxes).
- Never swap a Playbook component for a plain MUI one, even to avoid the MUI X license watermark.
- Never restyle a component to match a screenshot of iP.
- If the kit has nothing for part of a design, say so and ask before building anything. Build a custom component only when the person specifically asks for one.

## Component priority (critical)
Every page starts from a floorplan (`src/floorplans`): pick one with the decision list in `docs/reference/design-system.md` → "Floorplans", compose `PageFrame` with `PageHeader`, `PageToolbar`, `FloorplanFooter` and `PageState`, then fill it:

1. **Playbook Components first**: import from `src/playbook-components` (Button, DataGrid, DataGridPremium, DatePicker, Drawer, Toasts, ConfirmationModal, TabBar, SelectWrapper, Autocomplete, and MUI primitives re-exported by the barrel)
2. **App components**: import from `src/components` (Icon, Card, PlayerAvatar, LogoImage, StatusChip, AthleteDataGrid, LayoutWithMainNav)
3. **MUI fallback**: `@mui/material` only when 1 and 2 have no equivalent

```jsx
// ✅ Playbook first
import { Button, DataGrid, Drawer, TabBar } from '../playbook-components'
// ✅ App components
import { Icon, Card, PlayerAvatar } from '../components'
// ✅ Fallback when there is no Playbook equivalent
import { Tooltip } from '@mui/material'
// ❌ Blocked by ESLint: Button comes from the Playbook only
import { Button } from '@mui/material'
```

## MUI component defaults (non-negotiable)

`rootTheme` mirrors the real Playbook theme (KitmanLabs/kitman-playbook), so prototypes match iP. Write the variant props explicitly; leave size to the theme unless a design calls for a different one:

| Component     | Write explicitly                          | Theme default size (as in iP) |
|---------------|-------------------------------------------|-------------------------------|
| TextField     | `variant="filled"`                        | small                         |
| Select        | `variant="filled"`                        | small                         |
| FormControl   | `variant="filled"`                        | medium, full width            |
| Button        | `variant="contained" disableElevation={true}` | medium                    |
| Chip          |                                           | medium                        |
| IconButton    |                                           | medium (MUI default)          |

For a loading state, use Button's `loading` prop (no need for LoadingButton from `@mui/lab`).

The kit runs the same MUI versions as the Playbook (KitmanLabs/kitman-playbook): Material UI 7.3 and MUI X 7.29.

## MUI 7 APIs (critical)
- **slotProps, not the removed props**: `InputProps` → `slotProps.input`, `inputProps` → `slotProps.htmlInput`, `InputLabelProps` → `slotProps.inputLabel`, `SelectProps` → `slotProps.select`, Menu/Popover/Drawer/Dialog `PaperProps` → `slotProps.paper`, `MenuListProps` → `slotProps.list`
- **Grid**: `<Grid size={{ xs: 12, sm: 6 }}>`; no `item`, no `xs=`/`sm=` props
- **DataGrid**: `valueGetter`/`valueFormatter` take `(value, row)`; `rowSelectionModel` is an array of row ids; a toolbar slot shows whenever it is set
- Details and the full list: `docs/reference/design-system.md` → "MUI 7 APIs"
- Also installed: MUI X Charts, Scheduler (beta) and Chat (alpha). Usage notes and stories: `docs/reference/design-system.md` → "Charts, Scheduler and Chat". Scheduler and Chat only exist as MUI X 9 prereleases; they run on Material UI 7.3.

## Design rules (enforced by linting)
- **Colors**: always `var(--color-primary)` and other tokens, never hardcoded hex/rgb/hsl
- **Buttons**: `variant="contained"` only; secondary actions use `color="secondary"`
- **TextFields/Selects**: `variant="filled"` only
- **Icons**: `*Outlined` variants only, e.g. `DashboardOutlined`, not `Dashboard`
- **Text casing**: sentence case, "Add athlete", not "Add Athlete" or "ADD ATHLETE"
- **Design tokens**: `src/styles/design-tokens.css`
- **Theme**: one MUI theme, `rootTheme` in `src/playbook-components/themes.js`, used by the app and Storybook. Never add a second `createTheme`.
- **Dates**: moment only, with `AdapterMoment`. Components holding `Date` state convert at the picker with `toMoment()` / `withDate()` from `src/utils/pickerDates.js`.

## Data conventions
- All mock data, constants, option lists and fixtures go in `src/data/`, never inline in components
- Form templates go in `src/data/formTemplates/`
- The club's people and records (athletes, staff, squads, injuries, games, training, assessments, questionnaires) are generated: `src/data/club.js` describes the club, `fakerFor()` in `src/data/fake.js` seeds each dataset, and `src/data/clock.js` sets "today". Never hand-write a person or a fixed date; generate it, dated with `clock.js`, not `moment()`.

## Boundaries
🚫 NEVER hardcode colors (linting blocks the commit)
🚫 NEVER use non-Outlined MUI icon variants in app code
🚫 NEVER add npm dependencies without explicit instruction
⚠️  Always run `npm run validate-design-system` after changes
✅ Edit `src/playbook-components/` to change Playbook component behavior; it is plain JavaScript (no Flow, no build step)

## Prototype clones
Prototypes are never built in the kit: `npm run prototype:clone` copies the primitives (Playbook, floorplans, shell, styles, utils, shared data, lint rules) into a self-contained folder with `PROTOTYPE.md` as its rules. What a clone gets, and what it never gets, is in `docs/reference/prototype-clones.md`; change the template in `scripts/prototype/template`.

## Docs
- All docs live in `docs/`: guides for designers at the top level, rules and conventions in `docs/reference/`. Index: `docs/README.md`.
- Update the relevant doc in the same change as the code it describes. Change a rule in `docs/reference/design-system.md` first; other docs link to it.
- `docs/understanding-the-data.md` is generated by `npm run docs:data` (from `scripts/generate-data-docs.js`); don't edit it by hand.
- Follow the Kitman Labs naming rules in docs and UI copy: "iP: Intelligence Platform" on first reference, then "iP"; "athlete" rather than "player"; no em dashes.

## References
- Full design rules: `@docs/reference/design-system.md`
- Project structure: `@docs/reference/project-structure.md`
- Setup and workflow (for people, not imported): `docs/getting-started.md`
