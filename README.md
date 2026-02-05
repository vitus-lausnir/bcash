# BCash - Sales Pipeline & Cashflow Management

Visual sales pipeline tracker with cashflow projections. Built with Next.js, TypeScript, and JSON file storage.

## 🚀 Quick Start

```bash
# Install dependencies (already done)
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

## ✅ What's Working (MVP v0.1)

### Core Features
- ✅ **Add Deal** - Fast modal form (<60 seconds to add)
- ✅ **Edit Deal** - Click any deal to edit
- ✅ **Delete Deal** - Remove deals with confirmation
- ✅ **Pipeline Summary** - Weighted values by stage
- ✅ **Deal List** - Visual card view with stage indicators
- ✅ **JSON Storage** - All data stored in `data/` directory

### Stage Management
- Confirmed (100% probability)
- Very Likely (80%)
- Hot (60%)
- Medium (40%)
- Long Shot (20%)
- Lost (0%)

### Data Captured
- Deal name
- Amount (ISK with formatting)
- Stage (with automatic probability)
- Expected close date (visual date picker)
- Contact person
- Notes

## 📁 Project Structure

```
bcash/
├── app/
│   ├── actions/
│   │   └── deals.ts          # Server Actions (CRUD)
│   ├── dashboard/
│   │   ├── page.tsx          # Main dashboard
│   │   └── dashboard-content.tsx
│   └── layout.tsx
├── components/
│   ├── ui/                   # shadcn/ui components
│   ├── add-deal-modal.tsx    # Add/Edit modal
│   ├── deal-list.tsx         # Deal cards
│   └── pipeline-summary.tsx  # Summary widget
├── lib/
│   ├── types.ts              # TypeScript types
│   ├── data.ts               # Data access layer
│   └── utils.ts              # Utilities
├── data/                     # JSON storage
│   ├── stage-config.json     # Stage configuration
│   ├── deals.json            # All deals
│   ├── timeline.json         # Timeline entries
│   ├── history.json          # Stage change history
│   └── expenses.json         # Expenses (future)
└── scripts/
    ├── seed.ts               # Initialize data directory
    ├── test-add-deal.ts      # Test script
    └── add-sample-deals.ts   # Add sample data
```

## 🎯 Sample Data

The system has 5 sample deals:
- **Arctic Fish Q2** - 1.48M ISK (Very Likely)
- **Coripharma** - 1M ISK (Hot)
- **Ístak** - 500K ISK (Long Shot)
- **Idnmark Pharmaceuticals** - 750K ISK (Medium)
- **Valitor Q2** - 680K ISK (Very Likely)

Total weighted value: ~3.26M ISK

## 🔧 Available Scripts

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run start    # Start production server
npm run seed     # Initialize data directory
```

## 📊 Data Storage (JSON)

All data is stored in JSON files in the `data/` directory:

- **deals.json** - Main deal records
- **timeline.json** - Monthly revenue breakdowns (future)
- **history.json** - Stage change audit trail
- **stage-config.json** - Stage configuration (colors, probabilities)
- **expenses.json** - Expense tracking (future)

### Why JSON?
- Zero setup (no database to install)
- Easy to debug (`cat data/deals.json`)
- Version control friendly
- Fast enough for <1000 deals
- Can migrate to SQLite/Postgres later if needed

## 🚧 Coming Next (Phase 2)

### Timeline & Recurring Revenue
- [ ] Monthly breakdown per deal
- [ ] "Add Month" interface
- [ ] Recurring revenue helper (e.g., 60K/month × 8 months)
- [ ] Timeline visualization chart

### Cashflow Projections
- [ ] 3 scenarios (best/realistic/worst)
- [ ] Monthly cashflow chart
- [ ] Runway calculation
- [ ] Expense tracking

### UX Improvements
- [ ] Keyboard shortcuts (n=new, e=edit, /=search)
- [ ] Drag-drop stage changes (kanban view)
- [ ] Mobile responsive
- [ ] Inline editing
- [ ] Search/filter deals

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts (for timeline/cashflow)
- **Date Handling:** date-fns
- **Storage:** JSON files

## 📝 Usage Tips

### Adding a Deal (Fast!)
1. Click "+ Add Deal" button
2. Fill in name and amount (required)
3. Select stage (probability auto-set)
4. Pick close date (optional)
5. Add notes (optional)
6. Click "Create Deal"

**Total time: <60 seconds**

### Editing a Deal
1. Click on any deal card
2. Modal opens with current values
3. Make changes
4. Click "Save Changes"

### Understanding Weighted Values
Each deal's weighted value = `amount × (probability / 100)`

Example:
- Arctic Fish: 1.48M × 80% = 1.18M
- Ístak: 500K × 20% = 100K

Total weighted value is the sum of all weighted values (realistic revenue expectation).

## 🐛 Known Issues

- None yet! This is the initial build.

## 🎨 Design Philosophy

**Speed over perfection:**
- Adding deals should be <60 seconds
- Everything is visual (no CLI, no markdown)
- Optimistic UI updates (instant feedback)
- Simple data model (easy to understand)

**Storage:**
- JSON files are the right choice for this use case
- Don't over-engineer storage until you need it
- Focus 90% of effort on UI/UX

## 🔐 Security Note

This is a local tool (not multi-user). No authentication required. Data lives in `data/` directory.

For deployment, consider:
- Adding basic auth
- HTTPS
- Backup strategy

## 📚 Documentation

See `SPEC.md` for full specification.
See `PROGRESS.md` for build progress.

## 🙋 Questions?

Check the code - it's well-commented and follows the spec closely.

---

Built by Stan (Engineer Agent) • February 2026
