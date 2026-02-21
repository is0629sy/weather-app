"use client";

import { useState } from "react";
import { useLocations, Location } from "@/hooks/useLocations";
import { LocationSearch } from "@/components/LocationSearch";
import { WeatherCard } from "@/components/WeatherCard";
import { WeatherDetailModal } from "@/components/WeatherDetailModal";
import { ReplaceLocationDialog } from "@/components/ReplaceLocationDialog";
import { GeocodingResult } from "@/lib/geocoding";
import { WeatherData } from "@/lib/weather";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CloudRainWind } from "lucide-react";

export default function Home() {
  const { locations, removeLocation, replaceLocation, reorderLocations } = useLocations();

  // 詳細表示モーダルのState
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedWeather, setSelectedWeather] = useState<WeatherData | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // 入れ替え用ダイアログのState
  const [pendingLocation, setPendingLocation] = useState<GeocodingResult | null>(null);
  const [isReplaceOpen, setIsReplaceOpen] = useState(false);

  // dnd-kit設定
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = locations.findIndex((l) => l.id === active.id);
      const newIndex = locations.findIndex((l) => l.id === over.id);

      reorderLocations(arrayMove(locations, oldIndex, newIndex));
    }
  };

  // 6件到達時に検索コンポーネントから呼ばれるコールバック
  const handleAddRequireReplace = (loc: GeocodingResult) => {
    setPendingLocation(loc);
    setIsReplaceOpen(true);
  };

  // 入れ替えダイアログで「これと入れ替える」を選択した時
  const handleReplaceConfirm = (oldId: number, newLoc: GeocodingResult) => {
    replaceLocation(oldId, newLoc);
    setIsReplaceOpen(false);
    setPendingLocation(null);
  };

  // カードをクリックした時の詳細表示
  const handleCardClick = (loc: Location, weather: WeatherData) => {
    setSelectedLocation(loc);
    setSelectedWeather(weather);
    setIsDetailOpen(true);
  };

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-blue-100 dark:selection:bg-blue-900">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <header className="flex flex-col items-center mb-12 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-2xl text-blue-600 dark:text-blue-400">
              <CloudRainWind className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              Weather Dashboard
            </h1>
          </div>
          <p className="text-zinc-500 dark:text-zinc-400 text-center max-w-xl">
            Open-Meteo APIを活用した高機能天気ダッシュボード。<br className="hidden sm:block" />
            都市を検索して追加し、最大6件までの気象情報をリアルタイムで管理します。
          </p>
        </header>

        {/* 検索セクション */}
        <section className="mb-12 relative z-20">
          <LocationSearch onAddRequireReplace={handleAddRequireReplace} />
        </section>

        {/* 天気カードグリッド */}
        <section className="relative z-10">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={locations.map((l) => l.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {locations.map((loc) => (
                  <WeatherCard
                    key={loc.id}
                    location={loc}
                    onRemove={removeLocation}
                    onClick={handleCardClick}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          {locations.length === 0 && (
            <div className="text-center text-zinc-500 py-12 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
                <CloudRainWind className="w-8 h-8 text-zinc-400" />
              </div>
              <p>地点が登録されていません。<br />検索バーから都市を追加してください。</p>
            </div>
          )}
        </section>
      </div>

      {/* モーダル群 */}
      <WeatherDetailModal
        location={selectedLocation}
        weather={selectedWeather}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />

      <ReplaceLocationDialog
        isOpen={isReplaceOpen}
        newLocation={pendingLocation}
        existingLocations={locations}
        onReplace={handleReplaceConfirm}
        onCancel={() => setIsReplaceOpen(false)}
      />
    </main>
  );
}
