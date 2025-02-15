import React, { useState, useEffect, useRef } from "react";
import { GoogleMap, useJsApiLoader, Marker, Polyline } from "@react-google-maps/api";

const ErrorText = () => (
  <p className="App-error-text">Geolocation IS NOT available</p>
);

interface Position {
  latitude: number | null;
  longitude: number | null;
}

const libraries: ("places" | "geometry" | "drawing" | "marker")[] = ["marker"];

function Geolocation() {
  const [isAvailable, setAvailable] = useState(false);
  const [position, setPosition] = useState<Position>({
    latitude: null,
    longitude: null,
  });
  const [markers, setMarkers] = useState<google.maps.LatLngLiteral[]>([]); // マーカーを保持する型を修正
  const [path, setPath] = useState<google.maps.LatLngLiteral[]>([]); // ラインの座標を保持

  useEffect(() => {
    if ("geolocation" in navigator) {
      setAvailable(true);
      getCurrentPosition();
    } else {
      setAvailable(false);
    }

    const interval = setInterval(getCurrentPosition, 5000);
    return () => clearInterval(interval);
  }, []);

  const getCurrentPosition = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newPosition = { lat: latitude, lng: longitude };

        setPosition({ latitude, longitude });

        // ラインを描くためにpathに追加
        setPath((prevPath) => [...prevPath, newPosition]);
      },
      (error) => {
        console.error("位置情報の取得に失敗しました", error);
        setAvailable(false);
      }
    );
  };

  if (!isAvailable) return <ErrorText />;
  return <GoogleMapAPI position={position} markers={markers} setMarkers={setMarkers} path={path} />;
}

function GoogleMapAPI({
  position,
  markers,
  setMarkers,
  path,
}: {
  position: Position;
  markers: google.maps.LatLngLiteral[];
  setMarkers: React.Dispatch<React.SetStateAction<google.maps.LatLngLiteral[]>>;
  path: google.maps.LatLngLiteral[];
}) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAP_API_KEY || "",
    libraries: libraries,
  });

  const mapRef = useRef<google.maps.Map | null>(null);

  // クリック時にマーカーを追加する関数
  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    const { latLng } = event;
    if (latLng) {
      const newMarker = {
        lat: latLng.lat(),
        lng: latLng.lng(),
      };
      setMarkers((prevMarkers) => [...prevMarkers, newMarker]); // クリックした位置にマーカーを追加
    }
  };

  // 現在位置のラインを描画
  useEffect(() => {
    if (isLoaded && mapRef.current) {
      const polyline = new google.maps.Polyline({
        path: path, // pathに基づいてラインを描画
        geodesic: true, // 地球の曲率を考慮して描画
        strokeColor: "#FF0000", // ラインの色
        strokeOpacity: 1.0, // ラインの透明度
        strokeWeight: 2, // ラインの太さ
      });
      polyline.setMap(mapRef.current); // 地図にラインを描画
    }
  }, [isLoaded, path]); // pathが変更されるたびにラインを更新

  if (!isLoaded) return <div className="App">Google Maps APIのロード中...</div>;

  const mapOptions = {
    mapId: "dc2b461c6c6edfa6", // ここに Map ID を指定
    // その他のオプション
  };

  return (
    <GoogleMap
      mapContainerStyle={{ width: "400px", height: "400px" }}
      center={{
        lat: position.latitude || 0,
        lng: position.longitude || 0,
      }}
      zoom={18}
      options={mapOptions}
      onLoad={(map) => {
        mapRef.current = map;
      }}
      onClick={handleMapClick} // クリック時にマーカーを追加
    >
      {/* markers 配列からマーカーを描画 */}
      {markers.map((marker, index) => (
        <Marker
          key={index}
          position={marker} // マーカーの位置を設定
        />
      ))}
      {/* 現在位置に基づくラインを描画 */}
      <Polyline
        path={path}
        options={{
          geodesic: true,
          strokeColor: "#FF0000",
          strokeOpacity: 1.0,
          strokeWeight: 2,
        }}
      />
    </GoogleMap>
  );
}

export default Geolocation;
