import { create } from "zustand";
import { persist } from "zustand/middleware";
import { GeocodingResult } from "@/lib/geocoding";

export type Location = GeocodingResult;

interface LocationState {
    locations: Location[];
    addLocation: (loc: Location) => void;
    removeLocation: (id: number) => void;
    replaceLocation: (oldId: number, newLoc: Location) => void;
    reorderLocations: (newLocations: Location[]) => void;
}

const defaultLocations: Location[] = [
    {
        id: 2128295,
        name: "札幌",
        latitude: 43.06667,
        longitude: 141.35,
        country: "日本",
        admin1: "北海道",
    },
    {
        id: 1850147,
        name: "東京",
        latitude: 35.6895,
        longitude: 139.6917,
        country: "日本",
        admin1: "東京都",
    },
    {
        id: 1853909,
        name: "大阪",
        latitude: 34.69379,
        longitude: 135.50107,
        country: "日本",
        admin1: "大阪府",
    },
    {
        id: 1856057,
        name: "名古屋",
        latitude: 35.18147,
        longitude: 136.9064,
        country: "日本",
        admin1: "愛知県",
    },
    {
        id: 1863967,
        name: "福岡",
        latitude: 33.6,
        longitude: 130.41667,
        country: "日本",
        admin1: "福岡県",
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
