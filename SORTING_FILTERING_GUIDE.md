# Comprehensive Sorting, Filtering, Search & Pagination Implementation Guide

## ✅ COMPLETED PAGES (3)

1. **Pilgrims Page** - DONE
2. **Payments Page** - DONE  
3. **Bank Submissions** - Ready for table rendering (hook is set up)

## 📋 REMAINING PAGES (5)

### A. Bank Submissions Page (Complete Rendering)
**File**: `pages/dashboard/bank-submissions.tsx`

```typescript
import { useUserRole } from '@/hooks/useUserRole';
import { TableControlsWrapper, SortableHeader, TableFilter, TablePagination } from '@/components/Common/TableControls';
import { bankSubmissionStatusFilters, submissionMethodFilters } from '@/lib/filterConfigs';

// In component:
const { canSortAndFilter } = useUserRole();
const [pageSize, setPageSize] = useState(10);

// Replace the return section's filter area with:
<TableControlsWrapper
  title="Bank Payment Submissions"
  searchValue={tableState.searchQuery}
  onSearchChange={tableState.handleSearch}
  filters={
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <TableFilter label="Status" value={tableState.filters.status || ''} options={bankSubmissionStatusFilters} onChange={(value) => tableState.handleFilter('status', value)} />
      <TableFilter label="Method" value={tableState.filters.submission_method || ''} options={submissionMethodFilters} onChange={(value) => tableState.handleFilter('submission_method', value)} />
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Per page</label>
        <select value={pageSize} onChange={(e) => setPageSize(parseInt(e.target.value))} className="px-3 py-2 border border-gray-300 rounded-lg outline-none cursor-pointer">
          <option value="10">10</option>
          <option value="25">25</option>
          <option value="50">50</option>
        </select>
      </div>
    </div>
  }
  onClearFilters={tableState.handleClearFilters}
  hasActiveFilters={tableState.searchQuery !== '' || Object.values(tableState.filters).some((v) => v !== null && v !== '')}
  showControls={canSortAndFilter}
>
  {/* Table with SortableHeader and TablePagination */}
</TableControlsWrapper>
```

### B. Banks Page
**File**: `pages/dashboard/banks.tsx`
- **Searchable fields**: name, code, country, contact_email
- **Sortable columns**: name, status, created_at
- **Filters**: status (active/inactive)
- **Pagination**: 10/25/50

### C. Bank Portal - Dashboard
**File**: `bank/pages/dashboard/index.tsx`
- **Replace hardcoded 10-item limit with pagination**
- **Searchable fields**: reference_number, pilgrim_name, payer_name
- **Sortable columns**: amount, payment_date, status
- **Filters**: status
- **Role-based**: bank_staff and bank_admin can see sort/filter
- **Pagination**: 10/25/50

### D. Bank Portal - Hotels Page
**File**: `bank/pages/dashboard/hotels.tsx`
- **Searchable fields**: name, location, city, contact
- **Sortable columns**: name, location, rooms_available, status
- **Filters**: city, status (active/inactive)
- **Pagination**: 10/25/50

### E. Bank Portal - Staff Management
**File**: `bank/pages/dashboard/staff.tsx`
- **Convert from card layout to table**
- **Searchable fields**: username, email, first_name, last_name
- **Sortable columns**: username, email, role, status
- **Filters**: role (bank_admin/bank_staff), status
- **Pagination**: 10/25/50

### F. Bank Portal - Room Assignment
**File**: `bank/pages/dashboard/room-assignment.tsx`
- **Searchable fields**: pilgrim_name, room_number
- **Sortable columns**: pilgrim_name, room_number, status, check_in_date
- **Filters**: status, room_status
- **Pagination**: 10/25/50

## 🔐 ROLE-BASED ACCESS CONTROL

### Implementation Pattern
```typescript
import { useUserRole } from '@/hooks/useUserRole';

const { canSortAndFilter, role } = useUserRole();

// In TableControlsWrapper:
showControls={canSortAndFilter} // Only shows if bank_admin or hajj_admin
```

### Who Can Sort/Filter?
- ✅ **bank_admin** - Full access to sort & filter
- ✅ **hajj_admin** - Full access to sort & filter
- ❌ **bank_staff** - Can only view data (no sort/filter)
- ❌ **hajj_staff** - Can only view data (no sort/filter)

## 🚀 QUICK IMPLEMENTATION CHECKLIST

For each remaining page:
- [ ] Import `useTableState` hook
- [ ] Import `useUserRole` hook
- [ ] Import `TableControls` components
- [ ] Import filter configs
- [ ] Add `useTableState()` with searchable fields
- [ ] Add `useUserRole()` for role-based access
- [ ] Add `pageSize` state
- [ ] Wrap table in `TableControlsWrapper` with `showControls={canSortAndFilter}`
- [ ] Replace table headers with `SortableHeader`
- [ ] Use `tableState.paginatedData` instead of filtered data
- [ ] Add `TablePagination` component at bottom
- [ ] Test with different roles to verify controls visibility

## 📦 REUSABLE COMPONENTS LOCATION

- **Hook**: `lib/useTableState.ts`
- **Components**: `components/Common/TableControls.tsx`
- **Filters**: `lib/filterConfigs.ts`
- **Role Hook**: `hooks/useUserRole.ts`

## 🔄 STATE MANAGEMENT

Each table uses:
```typescript
const tableState = useTableState<DataType>(data, {
  initialPageSize: 10,
  searchableFields: ['field1', 'field2', 'field3']
});

// Access via:
tableState.paginatedData      // Current page data
tableState.filteredData       // All filtered (before pagination)
tableState.sortConfig         // Current sort state
tableState.filters            // Active filters
tableState.searchQuery        // Search text
tableState.currentPage        // Page number
tableState.totalPages         // Total pages
tableState.handleSort(key)    // Toggle sort
tableState.handleFilter(key, value)  // Set filter
tableState.handleSearch(query)       // Set search
tableState.handlePageChange(page)    // Change page
tableState.handleClearFilters()      // Clear all
```

## ✨ FEATURES AUTOMATICALLY INCLUDED

When using `TableControlsWrapper`:
- ✅ Full-text search across multiple fields
- ✅ Dynamic filtering with clear button
- ✅ Column-based sorting (click headers)
- ✅ Configurable pagination (10/25/50 per page)
- ✅ Results counter
- ✅ Active filter indication
- ✅ Role-based visibility control
- ✅ Mobile responsive
- ✅ Minimalist design consistency

## 🎯 NEXT STEPS

1. Complete Bank Submissions table rendering
2. Implement Banks page
3. Implement Bank Portal Dashboard
4. Implement Bank Portal Hotels
5. Implement Bank Portal Staff Management
6. Implement Bank Portal Room Assignment
7. Test role-based access on all pages
8. Commit with "Add comprehensive sorting/filtering to [page]"

All components and utilities are production-ready and tested on Pilgrims and Payments pages.
