import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
 import type { CasesFilterState } from '@/interfaces/case.interface';
import type { CaseStatus } from '@/types';
import type { RootState } from '../rootReducer';

const initialState: CasesFilterState = {
  search: '',
  status: '',
  assignedTo: '',
  page: 1,
  limit: 10,
};

const casesFilterSlice = createSlice({
  name: 'casesFilter',
  initialState,
  reducers: {
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
      state.page = 1;
    },
    setStatus: (state, action: PayloadAction<CaseStatus | ''>) => {
      state.status = action.payload;
      state.page = 1;
    },
    setAssignedTo: (state, action: PayloadAction<string>) => {
      state.assignedTo = action.payload;
      state.page = 1;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    resetFilters: () => initialState,
  } 
});

export const { setSearch, setStatus, setAssignedTo, setPage, resetFilters } =
  casesFilterSlice.actions;

export const selectCasesFilter = (state: RootState) => state.casesFilter;

export default casesFilterSlice.reducer;
