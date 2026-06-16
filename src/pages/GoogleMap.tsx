import { useState, useEffect, useRef } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Polyline,
  InfoWindow,
} from "@react-google-maps/api";
import { db } from "../firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// LevelData インターフェースを追加
interface LevelData {
  id: string;
  label: string;
  color: string;
}

interface Position {
  latitude: number | null;
  longitude: number | null;
}

interface MarkerData {
  lat: number;
  lng: number;
  title: string;
  levelId: string;
  isEditable: boolean;
  isPlaced: boolean;
  timestamp: string;
  userName?: string; // ユーザー名を追加（オプション）
}

const libraries: ("places" | "geometry" | "drawing")[] = ["places", "geometry"];

function GoogleMapAPI() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAP_API_KEY || "",
    libraries,
  });

  const mapId = import.meta.env.VITE_GOOGLE_MAP_ID || "";
  const [isAvailable, setAvailable] = useState(false);
  const [position, setPosition] = useState<Position>({ latitude: null, longitude: null });
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [path, setPath] = useState<google.maps.LatLngLiteral[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<MarkerData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [zoom, setZoom] = useState(18);

  const mapRef = useRef<google.maps.Map | null>(null);

  // LevelData を使うステート
  const [levels] = useState<LevelData[]>([
    { id: "Level1", label: "雪がない", color: "green" },
    { id: "Level2", label: "歩行しやすい", color: "yellow" },
    { id: "Level3", label: "歩行しにくい", color: "orange" },
    { id: "Level4", label: "よく転ぶ", color: "red" },
    { id: "Level5", label: "道がない", color: "darkred" },
    { id: "Level100", label: "地球崩壊", color: "black" },
  ]);

  useEffect(() => {
    if ("geolocation" in navigator) {
      setAvailable(true);
      getCurrentPosition();
      const interval = setInterval(getCurrentPosition, 5000);
      // ★ Firestore からの読み込みを必ず呼び出す
      loadPinsFromFirestore();
      return () => clearInterval(interval);
    } else {
      setAvailable(false);
      // ★ Geolocation 非対応ならこちらで呼び出し
      loadPinsFromFirestore();
    }
  }, []);

  const getCurrentPosition = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition({ latitude, longitude });
        setPath((prevPath) => [...prevPath, { lat: latitude, lng: longitude }]);
      },
      (error) => {
        console.error("位置情報の取得に失敗しました", error);
        setAvailable(false);
      }
    );
  };

  // ポリラインまたはマーカーから外れた未確定マーカーを削除する関数
  const handleRemoveMarker = (marker: MarkerData) => {
    setMarkers((prev) => prev.filter((m) => m !== marker));
  };

  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (!event.latLng) return;

    // まだ保存（確定）していない選択中のマーカーがあれば削除してリセット
    if (selectedMarker && !selectedMarker.isPlaced) {
      handleRemoveMarker(selectedMarker);
    }

    const newMarkerPosition = event.latLng;
    const distancePolyLine = 30;
    const distanceMarker = 10;
    let isWithinPolyLine = false;
    let isWithinMarker = false;

    // 1. ポリライン（現在地ルート）の30m以内かチェック
    for (let i = 0; i < path.length; i++) {
      const distanceBetweenPolyLine = google.maps.geometry.spherical.computeDistanceBetween(
        newMarkerPosition,
        new google.maps.LatLng(path[i].lat, path[i].lng)
      );
      if (distanceBetweenPolyLine <= distancePolyLine) {
        isWithinPolyLine = true;
        break;
      }
    }

    // 2. 既存のマーカーから10m以内かチェック
    for (let i = 0; i < markers.length; i++) {
      const existingMarker = markers[i];
      const distanceBetweenMarker = google.maps.geometry.spherical.computeDistanceBetween(
        newMarkerPosition,
        new google.maps.LatLng(existingMarker.lat, existingMarker.lng)
      );
      if (distanceBetweenMarker <= distanceMarker) {
        isWithinMarker = true;
        break;
      }
    }

    // ★ 3. 条件判定：30m以内で、かつ10m以内に既存ピンがない場合のみ設置処理へ
    if (isWithinPolyLine && !isWithinMarker) {

      // 【12時間経過した古いピンの置き換えチェック】
      const markersToCheck = markers.filter((marker) => {
        const markerTimestamp = new Date(marker.timestamp);
        const currentTime = new Date();
        const timeDiff = currentTime.getTime() - markerTimestamp.getTime();
        return timeDiff >= 12 * 60 * 60 * 1000;
      });

      if (markersToCheck.length > 0) {
        // 一番近い古いピンを特定して削除
        let closestMarker = markersToCheck[0];
        let closestDistance = google.maps.geometry.spherical.computeDistanceBetween(
          newMarkerPosition,
          new google.maps.LatLng(closestMarker.lat, closestMarker.lng)
        );

        markersToCheck.forEach((marker) => {
          const distance = google.maps.geometry.spherical.computeDistanceBetween(
            newMarkerPosition,
            new google.maps.LatLng(marker.lat, marker.lng)
          );
          if (distance < closestDistance) {
            closestDistance = distance;
            closestMarker = marker;
          }
        });
        handleRemoveMarker(closestMarker);
      }

      // 新しいマーカーを追加
      const newMarker: MarkerData = {
        lat: newMarkerPosition.lat(),
        lng: newMarkerPosition.lng(),
        title: "新しいマーカー",
        levelId: "Level1",
        isEditable: true,
        isPlaced: false,
        timestamp: new Date().toISOString(),
      };
      setMarkers((prevMarkers) => [...prevMarkers, newMarker]);
      setSelectedMarker(newMarker);
      setErrorMessage(""); // エラーをクリア

    } else if (!isWithinPolyLine) {
      // 30mより外側ならメッセージを出すだけで、setMarkersはしない（ブロック）
      setErrorMessage(`マーカーはポリラインの${distancePolyLine}m以内にのみ追加できます`);
    } else if (isWithinMarker) {
      // 10m以内ならメッセージを出すだけで、setMarkersはしない（ブロック）
      setErrorMessage(`マーカーは既存のマーカーから${distanceMarker}m以内には設置できません`);
    }
  };

  const savePinToFirestore = async (marker: MarkerData) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        console.error("ユーザーが認証されていません");
        return;
      }

      await addDoc(collection(db, "pins"), {
        lat: marker.lat,
        lng: marker.lng,
        title: marker.title,
        levelId: marker.levelId,
        userId: user.uid,
        timestamp: marker.timestamp,
      });
      console.log("ピンを Firestore に保存しました");
    } catch (error) {
      console.error("ピンの保存に失敗しました", error);
    }
  };

  // マーカーを確定する関数（例: レベル選択後に編集モードを解除）
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
      // Firestore に保存
      savePinToFirestore(updatedMarker);
      console.log("更新されたマーカー:", updatedMarker);
    }
  };

  const loadPinsFromFirestore = async () => {
    try {
      console.log("Firestore からピンを取得開始...");
      const querySnapshot = await getDocs(collection(db, "pins"));
      console.log("querySnapshot:", querySnapshot);

      const loadedMarkers: MarkerData[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log("取得データ:", data);

        // データがなければデフォルト値を入れるように
        const marker: MarkerData = {
          lat: data.lat ?? 0,
          lng: data.lng ?? 0,
          title: data.title ?? "未設定",
          levelId: data.levelId ?? "N/A",
          isEditable: false,
          isPlaced: true, // すでに設置済みとする
          timestamp: data.timestamp ?? new Date().toISOString(),
          userName: data.userName ?? "匿名",
        };
        loadedMarkers.push(marker);
      });

      console.log("Firestore から取得したピン (マーカー配列):", loadedMarkers);
      setMarkers(loadedMarkers);
    } catch (error) {
      console.error("Firestore からピンの取得に失敗:", error);
    }
  };

  const handleZoomChanged = () => {
    if (mapRef.current) {
      setZoom(mapRef.current.getZoom() || 18);
    }
  };

  if (!isAvailable) return <p className="App-error-text">Geolocation IS NOT available</p>;
  if (!isLoaded) return <div>Google Maps API のロード中...</div>;

  return (
    <GoogleMap
      mapContainerStyle={{ width: "100%", height: "500px" }}
      center={{ lat: position.latitude || 0, lng: position.longitude || 0 }}
      zoom={zoom}
      onLoad={(map) => {
        mapRef.current = map;
      }} // マップインスタンスを保持
      onZoomChanged={handleZoomChanged}
      options={{
        mapId: mapId,
        disableDefaultUI: false,
        clickableIcons: false,
        streetViewControl: false,
        mapTypeControl: false,
        styles: [
          {
            featureType: "all",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
      }}
      onClick={handleMapClick}
    >
      {/* 既存マーカーの描画 */}
      {markers.map((marker, index) => (
        <Marker
          key={index}
          position={{ lat: marker.lat, lng: marker.lng }}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            fillColor:
              levels.find((level) => level.id === marker.levelId)?.color || "gray",
            fillOpacity: 1,
            scale: Math.max(8, zoom / 2),
            strokeColor: "white",
            strokeWeight: 2,
          }}
          onClick={() => setSelectedMarker(marker)}
        />
      ))}

      {/* エラーメッセージ用 InfoWindow */}
      {errorMessage && (
        <InfoWindow
          position={{
            lat: position.latitude || 0,
            lng: position.longitude || 0,
          }}
          onCloseClick={() => setErrorMessage("")}
        >
          <div style={{ color: "red" }}>
            <h3>{errorMessage}</h3>
          </div>
        </InfoWindow>
      )}

      {/* マーカーをクリックしたときの InfoWindow */}
      {selectedMarker && (
        <InfoWindow
          position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
          onCloseClick={() => {
            // 未確定マーカーなら削除
            if (!selectedMarker.isPlaced) {
              handleRemoveMarker(selectedMarker);
            }
            setSelectedMarker(null);
          }}
        >
          <div>
            <h3>{selectedMarker.title}</h3>
            <p>投稿者: <strong>{selectedMarker.userName || "名無しのユーザー"}</strong></p>
            <p>日時: {new Date(selectedMarker.timestamp).toLocaleString()}</p>
            <p>レベル: {selectedMarker.levelId}</p>

            {/* レベル変更ボタン例 */}
            {selectedMarker.isEditable && (
              <div>
                {levels.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => handleSaveMarker(level.id)}
                    style={{ backgroundColor: level.color, marginRight: "6px" }}
                  >
                    {level.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </InfoWindow>
      )}

      <Polyline path={path} options={{ strokeColor: "#FF0000" }} />
    </GoogleMap>
  );
}

export default GoogleMapAPI;
