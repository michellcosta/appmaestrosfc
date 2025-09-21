import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DonationConfig {
  showInHome: boolean;
  showInDashboard: boolean;
  enabledCards: {
    helpArtist: boolean;
    coffeeForDev: boolean;
  };
}

interface DonationStore {
  config: DonationConfig;
  updateConfig: (newConfig: Partial<DonationConfig>) => void;
  toggleHomeDisplay: () => void;
  toggleDashboardDisplay: () => void;
  toggleHelpArtistCard: () => void;
  toggleCoffeeForDevCard: () => void;
  resetToDefaults: () => void;
}

const defaultConfig: DonationConfig = {
  showInHome: true,
  showInDashboard: true,
  enabledCards: {
    helpArtist: true,
    coffeeForDev: true,
  },
};

export const useDonationStore = create<DonationStore>()(
  persist(
    (set, get) => ({
      config: defaultConfig,
      
      updateConfig: (newConfig) =>
        set((state) => ({
          config: { ...state.config, ...newConfig },
        })),
      
      toggleHomeDisplay: () =>
        set((state) => ({
          config: { ...state.config, showInHome: !state.config.showInHome },
        })),
      
      toggleDashboardDisplay: () =>
        set((state) => ({
          config: { ...state.config, showInDashboard: !state.config.showInDashboard },
        })),
      
      toggleHelpArtistCard: () =>
        set((state) => ({
          config: {
            ...state.config,
            enabledCards: {
              ...state.config.enabledCards,
              helpArtist: !state.config.enabledCards.helpArtist,
            },
          },
        })),
      
      toggleCoffeeForDevCard: () =>
        set((state) => ({
          config: {
            ...state.config,
            enabledCards: {
              ...state.config.enabledCards,
              coffeeForDev: !state.config.enabledCards.coffeeForDev,
            },
          },
        })),
      
      resetToDefaults: () =>
        set({ config: defaultConfig }),
    }),
    {
      name: 'maestrosfc-donation-config',
    }
  )
);