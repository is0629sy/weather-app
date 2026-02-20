import { create } from "zustand";
import { persist } from "zustand/middleware";
import { GeocodingResult } from "@/lib/geocoding";

export interface Location extends GeocodingResult { }

interface LocationState {
    locations: Location[];
    addLocation: (loc: Location) => void;
    removeLocation: (id: number) => void;
    replaceLocation: (oldId: number, newLoc: Location) => void;
    reorderLocations: (newLocations: Location[]) => void;
}

const defaultLocations: Location[] = [
    {
        id: 1850147,
        name: "Tokyo",
        latitude: 35.6895,
        longitude: 139.6917,
        country: "Japan",
        admin1: "Tokyo",
    },
    {
        id: 5128581,
        name: "New York",
        latitude: 40.7143,
        longitude: -74.006,
        country: "United States",
        admin1: "New York",
    },
    {
        id: 2643743,
        name: "London",
        latitude: 51.5085,
        longitude: -0.1257,
        country: "United Kingdom",
        admin1: "England",
    },
];

export const useLocations = create<LocationState>()(
    persist(
        (set) => ({
            locations: defaultLocations,

            addLocation: (loc) =>
                set((state) => {
                    // すでに存在している場合は追加しない
                    if (state.locations.find((l) => l.id === loc.id)) {
                        return state;
                    }
                    // 最大6件まで
                    if (state.locations.length >= 6) {
                        return state;
                    }
                    return { locations: [...state.locations, loc] };
                }),

            removeLocation: (id) =>
                set((state) => ({
                    locations: state.locations.filter((loc) => loc.id !== id),
                })),

            replaceLocation: (oldId, newLoc) =>
                set((state) => {
                    // すでに新しい地点が存在している場合は、古い地点を消すだけにするか、追加しない
                    if (state.locations.find((l) => l.id === newLoc.id)) {
                        return {
                            locations: state.locations.filter((loc) => loc.id !== oldId),
                        };
                    }
                    return {
                        locations: state.locations.map((loc) =>
                            loc.id === oldId ? newLoc : loc
                        ),
                    };
                }),

            reorderLocations: (newLocations) => set({ locations: newLocations }),
        }),
        {
            name: "weather-locations-storage", // localStorageのキー名
        }
    )
);
