import React, { useState, useEffect } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Polyline,
  InfoWindow,
} from "@react-google-maps/api";

const libraries: ("places" | "geometry" | "drawing" | "marker")[] = ["marker"];

interface Position {
  latitude: number | null;
  longitude: number | null;
}

interface LevelData {
  id: string;
  label: string;
  color: string;
}

interface MarkerData {
  lat: number;
  lng: number;
  title: string;
  levelId: string;
  isEditable: boolean;
  timestamp: string;
}

function Geolocation() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAP_API_KEY || "",
    libraries,
  });

  const mapId = import.meta.env.VITE_GOOGLE_MAP_ID || "";
  const [isAvailable, setAvailable] = useState(false);
  const [position, setPosition] = useState<Position>({
    latitude: null,
    longitude: null,
  });
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [path, setPath] = useState<google.maps.LatLngLiteral[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<MarkerData | null>(null);

  const [levels] = useState<LevelData[]>([
    { id: "Level1", label: "Low", color: "green" },
    { id: "Level2", label: "Medium", color: "yellow" },
    { id: "Level3", label: "High", color: "orange" },
    { id: "Level4", label: "Very High", color: "red" },
    { id: "Level5", label: "Extreme", color: "darkred" },
    { id: "Level100", label: "地球崩壊", color: "black" },
  ]);

  useEffect(() => {
    if ("geolocation" in navigator) {
      setAvailable(true);
      getCurrentPosition();
      const interval = setInterval(getCurrentPosition, 5000);
      return () => clearInterval(interval);
    } else {
      setAvailable(false);
    }
  }, []);

  const getCurrentPosition = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setPosition({ latitude, longitude });
        setPath((prevPath) => [...prevPath, { lat: latitude, lng: longitude }]);
      },
      (error) => {
        console.error("位置情報の取得に失敗しました", error);
        setAvailable(false);
      }
    );
  };

  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const newMarker: MarkerData = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
        title: "サンプル",
        levelId: "Level1",
        isEditable: true, // 新しく追加: 設置したマーカーは編集できない
        timestamp: new Date().toISOString(),
      };
      console.log("新しいマーカーの情報:", newMarker); // デバッグ用
      setMarkers((prevMarkers) => [...prevMarkers, newMarker]);
      setSelectedMarker(newMarker); // 最初に設置されたマーカーを選択
    }
  };

  const handleSaveMarker = (levelId: string) => {
    if (selectedMarker && selectedMarker.isEditable) {
      console.log("保存ボタンがクリックされました");
      const updatedMarker = {
        ...selectedMarker,
        levelId,
        isEditable: false,
        timestamp: selectedMarker.timestamp,
      };
      setMarkers((prevMarkers) =>
        prevMarkers.map((marker) =>
          marker === selectedMarker ? updatedMarker : marker
        )
      );
      setSelectedMarker(updatedMarker);
      console.log("更新されたマーカー:", updatedMarker);
    }
  };

  const handleLevelChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (selectedMarker && selectedMarker.isEditable) {
      const updatedMarker = { ...selectedMarker, levelId: event.target.value };
      setMarkers((prevMarkers) =>
        prevMarkers.map((marker) =>
          marker === selectedMarker ? updatedMarker : marker
        )
      );
      setSelectedMarker(updatedMarker);
    }
  };

  if (!isAvailable)
    return <p className="App-error-text">Geolocation IS NOT available</p>;
  if (!isLoaded) return <div>Google Maps APIのロード中...</div>;

  return (
    <GoogleMap
      mapContainerStyle={{ width: "400px", height: "400px" }}
      center={{ lat: position.latitude || 0, lng: position.longitude || 0 }}
      zoom={18}
      options={{
        mapId: mapId,
        disableDefaultUI: false,
        clickableIcons: false,
        styles: [
          {
            featureType: "all",
            elementType: "labels",
            stylers: [{ visibility: "off" }], // ここでラベルを非表示にする
          },
        ],
      }}
      onClick={handleMapClick}
    >
      {markers.map((marker, index) => (
        <Marker
          key={index}
          position={{ lat: marker.lat, lng: marker.lng }}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            fillColor:
              levels.find((level) => level.id === marker.levelId)?.color ||
              "gray",
            fillOpacity: 1,
            scale: 10,
            strokeColor: "white",
            strokeWeight: 2,
          }}
          onClick={() => setSelectedMarker(marker)}
        />
      ))}

      {selectedMarker && (
        <InfoWindow
          position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
          onCloseClick={() => setSelectedMarker(null)}
        >
          <div>
            <h3>{selectedMarker.title}</h3>
            <p>日時: {new Date(selectedMarker.timestamp).toLocaleString()}</p>
            {selectedMarker.isEditable ? (
              <>
                <select
                  value={selectedMarker.levelId}
                  onChange={handleLevelChange}
                >
                  {levels.map((level) => (
                    <option key={level.id} value={level.id}>
                      {level.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleSaveMarker(selectedMarker.levelId)}
                >
                  保存
                </button>
              </>
            ) : (
              <>
                <p>
                  レベル:{" "}
                  {
                    levels.find((level) => level.id === selectedMarker.levelId)
                      ?.label
                  }
                </p>
              </>
            )}
          </div>
        </InfoWindow>
      )}
      <Polyline path={path} options={{ strokeColor: "#FF0000" }} />
    </GoogleMap>
  );
}

export default Geolocation;
