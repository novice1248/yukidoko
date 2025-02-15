import React, { useState, useEffect, useRef } from "react";
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
  isPlaced: boolean;
  timestamp: string;
}

function GoogleMapAPI() {
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
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [zoom, setZoom] = useState(18); // ズームレベルを管理

  const mapRef = useRef<google.maps.Map | null>(null); // マップのインスタンスを保存
  
  const handleZoomChanged = () => {
    if (mapRef.current) {
      setZoom(mapRef.current.getZoom() || 18);
    }
  };

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
      if (selectedMarker && !selectedMarker.isPlaced) {
        handleRemoveMarker(selectedMarker);
      }

      const newMarkerPosition = event.latLng;
      const distancePolyLine = 30;
      const distanceMarker = 10;
      let isWithinPolyLine = false;
      let isWithinMarker = false;

      // ポリライン上の各点との距離を計算して、5m以内かどうかをチェック
      for (let i = 0; i < path.length; i++) {
        const distanceBetweenPolyLine =
          google.maps.geometry.spherical.computeDistanceBetween(
            newMarkerPosition,
            new google.maps.LatLng(path[i].lat, path[i].lng)
          );

        if (distanceBetweenPolyLine <= distancePolyLine) {
          isWithinPolyLine = true;
          break;
        }
      }

      // 既存のマーカーと距離をチェック
      for (let i = 0; i < markers.length; i++) {
        const existingMarker = markers[i];
        const distanceBetweenMarker =
          google.maps.geometry.spherical.computeDistanceBetween(
            newMarkerPosition,
            new google.maps.LatLng(existingMarker.lat, existingMarker.lng)
          );

        if (distanceBetweenMarker <= distanceMarker) {
          isWithinMarker = true;
          break;
        }
      }

      // distancePolyLine以内でdistanceMarkerの外の場合
      if (isWithinPolyLine == true && isWithinMarker == false) {
        const newMarker: MarkerData = {
          lat: newMarkerPosition.lat(),
          lng: newMarkerPosition.lng(),
          title: "サンプル",
          levelId: "Level1",
          isEditable: true,
          isPlaced: false,
          timestamp: new Date().toISOString(),
        };
        console.log("新しいマーカーの情報:", newMarker); // デバッグ用
        setMarkers((prevMarkers) => [...prevMarkers, newMarker]);
        setSelectedMarker(newMarker); // 最初に設置されたマーカーを選択
        setErrorMessage(""); // エラーメッセージをリセット
      } else if (isWithinPolyLine == false) {
        setErrorMessage(
          "マーカーはポリラインの" +
            distancePolyLine +
            "m以内にのみ追加できます"
        );
      } else if (isWithinMarker == true) {
        setErrorMessage(
          "マーカーは既存のマーカーから" +
            distanceMarker +
            "m以内には設置できません"
        );
      } else {
        setErrorMessage("あり得ない挙動です");
      }
    }
  };

  const handleRemoveMarker = (marker: MarkerData) => {
    setMarkers((prevMarkers) => prevMarkers.filter((m) => m !== marker));
    setSelectedMarker(null); // 削除後、選択されたマーカーを解除
  };

  const handleSaveMarker = (levelId: string) => {
    if (selectedMarker && selectedMarker.isEditable) {
      console.log("保存ボタンがクリックされました");
      const updatedMarker = {
        ...selectedMarker,
        levelId,
        isEditable: false,
        isPlaced: true,
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

  const handleInfoWindowClose = () => {
    if (selectedMarker && selectedMarker.isPlaced == false) {
      handleRemoveMarker(selectedMarker); // InfoWindowが閉じられたときにマーカーを削除
    } else if (selectedMarker) {
      setSelectedMarker(null);
    }
  };

  if (!isAvailable)
    return <p className="App-error-text">Geolocation IS NOT available</p>;
  if (!isLoaded) return <div>Google Maps APIのロード中...</div>;

  return (
    <GoogleMap
      mapContainerStyle={{ width: "400px", height: "400px" }}
      center={{ lat: position.latitude || 0, lng: position.longitude || 0 }}
      zoom={zoom}
      onLoad={handleZoomChanged} // マップのロード時に `handleLoad` を実行
      onZoomChanged={handleZoomChanged} // ズームレベルを変更する
      options={{
        mapId: mapId,
        disableDefaultUI: false,
        clickableIcons: false,
        streetViewControl: false, // これを追加して、ストリートビューのアイコンを非表示
        mapTypeControl: false, // 地図のタイプ（衛星表示など）のコントロールを非表示
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
    path: google.maps.SymbolPath.CIRCLE, // 丸いアイコン
    fillColor:
      levels.find((level) => level.id === marker.levelId)?.color || "gray", // レベルに応じた色
    fillOpacity: 1, // 完全に不透明
    scale: Math.max(8, zoom / 2), // ズームに応じたサイズ変更
    strokeColor: "white", // アイコンの枠線色
    strokeWeight: 2, // アイコンの枠線の太さ
  }}
          onClick={() => setSelectedMarker(marker)}
/>

))}


      {/* エラーメッセージを表示 */}
      {errorMessage && (
        <InfoWindow
          position={{
            lat: position.latitude || 0,
            lng: position.longitude || 0,
          }}
        >
          <div style={{ color: "red" }}>
            <h3>{errorMessage}</h3>
          </div>
        </InfoWindow>
      )}

      {selectedMarker && (
        <InfoWindow
          position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
          onCloseClick={handleInfoWindowClose} // InfoWindowを閉じる際にマーカーを削除
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

export default GoogleMapAPI;
