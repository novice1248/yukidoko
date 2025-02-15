import React, { useState, useEffect, useRef } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Polyline,
  InfoWindow,
} from "@react-google-maps/api";
<<<<<<< HEAD
import { db } from "../firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// LevelData インターフェースを追加
interface LevelData {
  id: string;
  label: string;
  color: string;
}
=======

const libraries: ("places" | "geometry" | "drawing" | "marker")[] = ["marker"];
>>>>>>> e04fe70 (exportする名前をGoogleMapAPIに変更 zoomに合わせて大きさを変化させる機能の追加　マーカーの設置条件の作成　バツを押した時設置途中のマーカーを消去)

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
<<<<<<< HEAD
  const [zoom, setZoom] = useState(18);

  const mapRef = useRef<google.maps.Map | null>(null);

  // LevelData を使うステート
=======
  const [zoom, setZoom] = useState(18); // ズームレベルを管理

  const mapRef = useRef<google.maps.Map | null>(null); // マップのインスタンスを保存
  
  const handleZoomChanged = () => {
    if (mapRef.current) {
      setZoom(mapRef.current.getZoom() || 18);
    }
  };

>>>>>>> e04fe70 (exportする名前をGoogleMapAPIに変更 zoomに合わせて大きさを変化させる機能の追加　マーカーの設置条件の作成　バツを押した時設置途中のマーカーを消去)
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
<<<<<<< HEAD
    if (!event.latLng) return;

    // Firestore 用の新規マーカー
    const newMarkerForFirestore: MarkerData = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
      title: "新しいピン",
      levelId: "Level1",
      isEditable: true,
      isPlaced: false,
      timestamp: new Date().toISOString(),
    };

    // Firestore に保存
    savePinToFirestore(newMarkerForFirestore);

    if (selectedMarker && !selectedMarker.isPlaced) {
      handleRemoveMarker(selectedMarker);
    }

    const newMarkerPosition = event.latLng;
    const distancePolyLine = 30;
    const distanceMarker = 10;
    let isWithinPolyLine = false;
    let isWithinMarker = false;

    // ポリライン上の各点との距離を計算し、30m以内かどうかをチェック
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

    // 既存のマーカーと距離をチェック
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

    if (isWithinPolyLine && !isWithinMarker) {
      const newMarker: MarkerData = {
        lat: newMarkerPosition.lat(),
        lng: newMarkerPosition.lng(),
        title: "サンプル",
        levelId: "Level1",
        isEditable: true,
        isPlaced: false,
        timestamp: new Date().toISOString(),
      };
      setMarkers((prevMarkers) => [...prevMarkers, newMarker]);
      setSelectedMarker(newMarker);
      setErrorMessage("");
    } else if (!isWithinPolyLine) {
      setErrorMessage(
        `マーカーはポリラインの${distancePolyLine}m以内にのみ追加できます`
      );
    } else if (isWithinMarker) {
      setErrorMessage(
        `マーカーは既存のマーカーから${distanceMarker}m以内には設置できません`
      );
    } else {
      setErrorMessage("あり得ない挙動です");
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
=======
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

>>>>>>> e04fe70 (exportする名前をGoogleMapAPIに変更 zoomに合わせて大きさを変化させる機能の追加　マーカーの設置条件の作成　バツを押した時設置途中のマーカーを消去)
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
<<<<<<< HEAD

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
        };
        loadedMarkers.push(marker);
      });

      console.log("Firestore から取得したピン (マーカー配列):", loadedMarkers);
      setMarkers(loadedMarkers);
    } catch (error) {
      console.error("Firestore からピンの取得に失敗:", error);
=======

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
>>>>>>> e04fe70 (exportする名前をGoogleMapAPIに変更 zoomに合わせて大きさを変化させる機能の追加　マーカーの設置条件の作成　バツを押した時設置途中のマーカーを消去)
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
<<<<<<< HEAD
      onLoad={(map) => (mapRef.current = map)} // マップインスタンスを保持
      onZoomChanged={handleZoomChanged}
=======
      onLoad={handleZoomChanged} // マップのロード時に `handleLoad` を実行
      onZoomChanged={handleZoomChanged} // ズームレベルを変更する
>>>>>>> e04fe70 (exportする名前をGoogleMapAPIに変更 zoomに合わせて大きさを変化させる機能の追加　マーカーの設置条件の作成　バツを押した時設置途中のマーカーを消去)
      options={{
        mapId: mapId,
        disableDefaultUI: false,
        clickableIcons: false,
<<<<<<< HEAD
        streetViewControl: false,
        mapTypeControl: false,
=======
        streetViewControl: false, // これを追加して、ストリートビューのアイコンを非表示
        mapTypeControl: false, // 地図のタイプ（衛星表示など）のコントロールを非表示
>>>>>>> e04fe70 (exportする名前をGoogleMapAPIに変更 zoomに合わせて大きさを変化させる機能の追加　マーカーの設置条件の作成　バツを押した時設置途中のマーカーを消去)
        styles: [
          {
            featureType: "all",
            elementType: "labels",
<<<<<<< HEAD
            stylers: [{ visibility: "off" }],
=======
            stylers: [{ visibility: "off" }], // ここでラベルを非表示にする
>>>>>>> e04fe70 (exportする名前をGoogleMapAPIに変更 zoomに合わせて大きさを変化させる機能の追加　マーカーの設置条件の作成　バツを押した時設置途中のマーカーを消去)
          },
        ],
      }}
      onClick={handleMapClick}
    >
<<<<<<< HEAD
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
=======
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
>>>>>>> e04fe70 (exportする名前をGoogleMapAPIに変更 zoomに合わせて大きさを変化させる機能の追加　マーカーの設置条件の作成　バツを押した時設置途中のマーカーを消去)
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
