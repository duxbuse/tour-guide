# Single Price for All Variants - Implementation Summary

## User Request
"All variants of an item will have the same price. I don't want to set a price for each variant of a shirt"

## Changes Needed

### 1. State Updates
**Current:**
```typescript
const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    imageUrl: '',
});

const [variants, setVariants] = useState([
    { size: 'S', type: '', price: '' },
]);
```

**New:**
```typescript
const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    imageUrl: '',
    price: '',  // ← ADD THIS
});

const [variants, setVariants] = useState([
    { size: 'S', type: '' },  // ← REMOVE price
]);
```

### 2. Form UI Changes
**Add a single price field BEFORE the variants section:**
```tsx
<div className="form-group">
    <label className="form-label">Price</label>
    <input
        type="number"
        step="0.01"
        className="form-input"
        placeholder="e.g. 25.00"
        value={newItem.price}
        onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
        required
    />
    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
        This price will apply to all variants
    </p>
</div>
```

**Remove the price input from each variant row** (lines ~382-390)

**Change the label from "Variants" to "Variants (Sizes/Types)"**

### 3. Function Updates

**addVariant:**
```typescript
const addVariant = () => {
    setVariants([...variants, { size: '', type: '' }]);  // Remove price
};
```

**handleCreateItem:**
```typescript
const response = await fetch('/api/merch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        tourId: selectedTourId,
        name: newItem.name,
        description: newItem.description,
        imageUrl: newItem.imageUrl,
        variants: variants
            .filter(v => v.size)
            .map(v => ({ ...v, price: newItem.price })),  // Apply item price to all variants
    }),
});

// Reset form
setNewItem({ name: '', description: '', imageUrl: '', price: '' });
setVariants([{ size: 'S', type: '' }]);
```

## Benefits
- ✅ Simpler UI - one price field instead of many
- ✅ Faster data entry - set price once for all sizes
- ✅ Less error-prone - no risk of inconsistent pricing
- ✅ More intuitive - matches real-world merch pricing

## Testing
After implementing:
1. Go to `/dashboard/inventory`
2. Click "+ New Item"
3. You should see:
   - Single "Price" field
   - "Variants (Sizes/Types)" section with only Size and Type inputs
   - Helper text: "This price will apply to all variants"
4. Create an item with multiple variants
5. All variants should have the same price

## Files to Modify
- `src/app/dashboard/inventory/page.tsx` (lines 33-41, 121-136, 149-150, 360-400)
