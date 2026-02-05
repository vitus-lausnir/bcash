# Testing Checklist

## Manual Testing (Do This First)

### 1. Start the App
```bash
cd ~/clawd/bcash
npm run dev
```
Open http://localhost:3000

### 2. Test Add Deal
- [ ] Click "+ Add Deal" button
- [ ] Modal opens
- [ ] Fill in name: "Test Deal"
- [ ] Fill in amount: "1,000,000"
- [ ] Select stage: "Hot"
- [ ] Click date picker, select a future date
- [ ] Add contact person: "Test Person"
- [ ] Add notes: "This is a test"
- [ ] Click "Create Deal"
- [ ] Modal closes
- [ ] Deal appears in list
- [ ] Pipeline summary updates

**Expected time:** <60 seconds

### 3. Test Edit Deal
- [ ] Click on any deal card
- [ ] Modal opens with current values pre-filled
- [ ] Change stage to "Very Likely"
- [ ] Change amount to "1,500,000"
- [ ] Click "Save Changes"
- [ ] Modal closes
- [ ] Deal updates in list
- [ ] Pipeline summary updates

### 4. Test Delete Deal
- [ ] Click "Delete" button on a deal
- [ ] Confirmation dialog appears
- [ ] Click "OK"
- [ ] Deal disappears from list
- [ ] Pipeline summary updates

### 5. Visual Inspection
- [ ] Stage colors are correct:
  - Confirmed = Green
  - Very Likely = Blue
  - Hot = Orange
  - Medium = Purple
  - Long Shot = Gray
  - Lost = Red
- [ ] Amounts are formatted with commas (1,480,000)
- [ ] Dates are readable (e.g., "Apr 2026")
- [ ] Pipeline summary shows correct weighted values

### 6. Data Persistence
- [ ] Stop dev server (Ctrl+C)
- [ ] Restart dev server (`npm run dev`)
- [ ] Refresh browser
- [ ] All deals still appear
- [ ] Pipeline summary is correct

### 7. JSON Files
- [ ] Check `data/deals.json` exists
- [ ] File contains deal objects
- [ ] Check `data/history.json` has stage change entries
- [ ] Files are human-readable (pretty-printed)

## Edge Cases

### Empty State
- [ ] Delete all deals
- [ ] "No deals yet" message appears
- [ ] Pipeline summary shows zero

### Form Validation
- [ ] Try submitting with empty name → error appears
- [ ] Try submitting with zero amount → error appears
- [ ] Try submitting with negative amount → error appears

### Large Amounts
- [ ] Add deal with amount: 1,000,000,000 (1 billion)
- [ ] Formatting still works
- [ ] No number overflow

### Date Handling
- [ ] Add deal without date (optional field)
- [ ] Deal saves successfully
- [ ] Add deal with past date
- [ ] Date displays correctly

## Performance Testing

### Many Deals
```bash
# Add 50 deals (create script if needed)
for i in {1..50}; do
  # Add via UI or script
done
```
- [ ] Page loads quickly
- [ ] Scrolling is smooth
- [ ] Edit/delete still responsive

## Browser Compatibility

Test in:
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari (if on Mac)

## Mobile Testing (Future)

- [ ] Responsive layout
- [ ] Touch-friendly buttons
- [ ] Modal fits on screen

## Expected Results

### Pipeline Summary Math
Example with sample deals:
```
Arctic Fish: 1,480,000 × 80% = 1,184,000
Coripharma: 1,000,000 × 60% = 600,000
Valitor Q2: 680,000 × 80% = 544,000
Idnmark: 750,000 × 40% = 300,000
Ístak: 500,000 × 20% = 100,000

Total Weighted: 2,728,000 ISK
```

### Stage Distribution
- Very Likely: 2 deals (Arctic Fish, Valitor)
- Hot: 1 deal (Coripharma)
- Medium: 1 deal (Idnmark)
- Long Shot: 1 deal (Ístak)

## Known Working Features ✅

- ✅ Add deal with all fields
- ✅ Edit existing deal
- ✅ Delete deal with confirmation
- ✅ Pipeline summary calculation
- ✅ Stage color coding
- ✅ ISK amount formatting
- ✅ Date picker UI
- ✅ JSON persistence
- ✅ History tracking
- ✅ Form validation

## Not Yet Implemented ⏳

- ⏳ Timeline/recurring revenue
- ⏳ Cashflow projections
- ⏳ Timeline chart
- ⏳ Expense tracking
- ⏳ Keyboard shortcuts
- ⏳ Search/filter
- ⏳ Drag-drop stage changes

## Bug Reporting

If you find bugs:
1. Note what you were doing
2. Check browser console for errors (F12)
3. Check `data/` files for corruption
4. Document steps to reproduce

## Success Criteria

The MVP is successful if:
- ✅ You can add a deal in <60 seconds
- ✅ All deals persist after restart
- ✅ Weighted values calculate correctly
- ✅ UI is intuitive (no training needed)
- ✅ You stop using revenue-tracker.md

---

**Current Status:** Core functionality working, ready for real-world testing.
