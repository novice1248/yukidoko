import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Polyline,
} from "@react-google-maps/api";

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
  return (
    <GoogleMapAPI
      position={position}
      markers={markers}
      setMarkers={setMarkers}
      path={path}
    />
  );
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
  const [zoomLevel, setZoomLevel] = useState(18);

  // クリック時にマーカーを追加する関数
  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    const { latLng } = event;
    if (latLng) {
      const newMarker = {
        lat: latLng.lat(),
        lng: latLng.lng(),
      };

      // ラインから3m以内かどうかを確認
      if (isCloseToLine(newMarker)) {
        setMarkers((prevMarkers) => [...prevMarkers, newMarker]);
      }
    }
  };

  // ラインから3m以内の点を確認する関数
  const isCloseToLine = (point: { lat: number; lng: number }) => {
    const line = path.map(({ lat, lng }) => new google.maps.LatLng(lat, lng));
    const radius = 3; // 3m

    for (let i = 0; i < line.length - 1; i++) {
      const segmentStart = line[i];
      const segmentEnd = line[i + 1];

      // セグメントとポイントの最短距離を計算
      const pointToSegmentDistance =
        google.maps.geometry.spherical.computeDistanceBetween(
          new google.maps.LatLng(point.lat, point.lng),
          google.maps.geometry.spherical.interpolate(
            segmentStart,
            segmentEnd,
            0.5
          )
        );

      if (pointToSegmentDistance <= radius) {
        return true;
      }
    }

    return false;
  };

  // ラインの始点と終点を丸で表示
  const drawStartEndMarkers = useCallback(() => {
    // ズームレベルに基づいてマーカーのサイズを決定する関数
    const getMarkerSize = () => {
      if (zoomLevel < 10) {
        return 6; // ズームレベルが低ければマーカー小さく
      } else if (zoomLevel < 15) {
        return 8; // 中程度のズームでマーカーのサイズを少し大きく
      } else {
        return 10; // ズームレベルが高ければマーカー大きく
      }
    };

    if (path.length > 0) {
      const startPoint = path[0];
      const endPoint = path[path.length - 1];

      // 始点マーカー
      new google.maps.Marker({
        position: startPoint,
        map: mapRef.current,
        title: "Start",
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: getMarkerSize(), // ズームレベルに基づいてマーカーサイズを動的に変更
          fillColor: "green",
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: "black",
        },
      });

      // 終点マーカー
      new google.maps.Marker({
        position: endPoint,
        map: mapRef.current,
        title: "End",
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: getMarkerSize(), // ズームレベルに基づいてマーカーサイズを動的に変更
          fillColor: "red",
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: "black",
        },
      });
    }
  }, [path, zoomLevel]);

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

      // 始点と終点に丸を表示
      drawStartEndMarkers();
    }
  }, [isLoaded, path, drawStartEndMarkers]); // pathが変更されるたびにラインを更新

  // ズームレベルが変更されたときに更新する
  const onZoomChanged = () => {
    if (mapRef.current) {
      const zoom = mapRef.current.getZoom();
      setZoomLevel(zoom || 18);
    }
  };

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
        map.addListener("zoom_changed", onZoomChanged); // ズーム変更時にイベントリスナーを追加
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
