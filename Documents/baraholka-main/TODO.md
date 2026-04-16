# TODO: Fix Edit/Delete in User-Created Ad Cards

## Approved Plan Steps:
1. [x] **Fix EditListingForm.tsx**: Change `updateListing` → `updateMyListing` with tgUser.id check (add import tgUser, store).
2. [ ] **Add edit buttons to ListingCard.tsx**: Small ✏️🗑️ buttons for own ads (check localStorage/server).
3. [ ] **Sync localStorage in MyListings/App**: Fallback `getMyListings(tgUser.id)` if localStorage empty → populate IDs.
4. [ ] **Test**: Create ad → verify buttons appear in card/detail/MyListings → test edit/delete.
5. [ ] **Minor**: Better error toasts in Detail/MyListings.

Current step: 1/5 - Edit EditListingForm.tsx
