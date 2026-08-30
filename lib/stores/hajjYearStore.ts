import { create } from 'zustand';
import { HajjYear } from '@/types';
import api from '@/lib/api';

interface HajjYearStoreState {
  // State
  activeHajjYear: HajjYear | null;
  selectedHajjYear: number | null;
  hajjYears: HajjYear[];
  loading: boolean;
  error: string | null;

  // Actions
  setActiveHajjYear: (year: HajjYear | null) => void;
  setSelectedHajjYear: (year: number) => void;
  setHajjYears: (years: HajjYear[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // API Methods
  fetchActiveHajjYear: () => Promise<void>;
  fetchHajjYears: () => Promise<void>;
  createHajjYear: (data: Partial<HajjYear>) => Promise<HajjYear>;
  initializeHajjYear: () => Promise<void>;
}

export const useHajjYearStore = create<HajjYearStoreState>((set, get) => ({
  // Initial state
  activeHajjYear: null,
  selectedHajjYear: null,
  hajjYears: [],
  loading: false,
  error: null,

  // Setters
  setActiveHajjYear: (year: HajjYear | null) => {
    set({ activeHajjYear: year });
  },

  setSelectedHajjYear: (year: number) => {
    set({ selectedHajjYear: year });
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedHajjYear', year.toString());
    }
  },

  setHajjYears: (years: HajjYear[]) => {
    set({ hajjYears: years });
  },

  setLoading: (loading: boolean) => {
    set({ loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  // Fetch active Hajj year
  fetchActiveHajjYear: async () => {
    try {
      set({ loading: true, error: null });
      const response = await api.get('/hajj-years/active/');
      const activeYear = response.data;
      set({ activeHajjYear: activeYear });

      // If no selected year, use active year
      const state = get();
      if (!state.selectedHajjYear && activeYear) {
        set({ selectedHajjYear: activeYear.id });
        if (typeof window !== 'undefined') {
          localStorage.setItem('selectedHajjYear', activeYear.id.toString());
        }
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Failed to fetch active Hajj year';
      set({ error: errorMsg });
      console.error('Error fetching active Hajj year:', error);
    } finally {
      set({ loading: false });
    }
  },

  // Fetch all Hajj years
  fetchHajjYears: async () => {
    try {
      set({ loading: true, error: null });
      const response = await api.get('/hajj-years/');
      const years = response.data.results || response.data;
      set({ hajjYears: years });
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Failed to fetch Hajj years';
      set({ error: errorMsg });
      console.error('Error fetching Hajj years:', error);
    } finally {
      set({ loading: false });
    }
  },

  // Create new Hajj year
  createHajjYear: async (data: Partial<HajjYear>) => {
    try {
      set({ loading: true, error: null });
      const response = await api.post('/hajj-years/', data);
      const newYear = response.data;

      // Add to the list
      const state = get();
      set({ hajjYears: [...state.hajjYears, newYear] });

      return newYear;
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Failed to create Hajj year';
      set({ error: errorMsg });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Initialize: Fetch active year and all years
  initializeHajjYear: async () => {
    try {
      set({ loading: true, error: null });

      // Fetch active year first
      const activeRes = await api.get('/hajj-years/active/');
      const activeYear = activeRes.data;

      // Fetch all years
      const allRes = await api.get('/hajj-years/');
      const allYears = allRes.data.results || allRes.data;

      // Check localStorage for previously selected year
      let selectedYear = activeYear.id;
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('selectedHajjYear');
        if (saved) {
          selectedYear = parseInt(saved, 10);
        }
      }

      set({
        activeHajjYear: activeYear,
        selectedHajjYear: selectedYear,
        hajjYears: allYears,
      });
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Failed to initialize Hajj year';
      set({ error: errorMsg });
      console.error('Error initializing Hajj year:', error);
    } finally {
      set({ loading: false });
    }
  },
}));

// Hook for component usage
export const useHajjYear = () => {
  return useHajjYearStore();
};
