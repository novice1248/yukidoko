import React, { useState, useEffect } from "react";
import { GoogleMap, useJsApiLoader, Marker, Polyline, InfoWindow } from "@react-google-maps/api";
import { db } from "../firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const libraries: ("places" | "geometry" | "drawing")[] = ["places", "geometry"];

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
  timestamp: string;
}

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

  useEffect(() => {
    if ("geolocation" in navigator) {
      setAvailable(true);
      getCurrentPosition();
      const interval = setInterval(getCurrentPosition, 5000);
      // ★ Firestoreからの読み込みを必ず呼び出す
      loadPinsFromFirestore(); 
      return () => clearInterval(interval);
    } else {
      setAvailable(false);
      // ★ Geolocation非対応ならこちらで呼び出し
      loadPinsFromFirestore();
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
    if (!event.latLng) return;

    const newMarker: MarkerData = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
      title: "新しいピン",
      levelId: "Level1",
      isEditable: true,
      timestamp: new Date().toISOString(),
    };

    setMarkers((prevMarkers) => [...prevMarkers, newMarker]);

    // Firestore に保存
    savePinToFirestore(newMarker);
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
        timestamp: marker.timestamp, // marker.timestamp を使用
      });

      console.log("ピンを Firestore に保存しました");
    } catch (error) {
      console.error("ピンの保存に失敗しました", error);
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
        console.log("取得データ:", data); // Firestore からのデータを確認

        const marker: MarkerData = {
          lat: data.lat ?? 0,
          lng: data.lng ?? 0,
          title: data.title ?? "未設定",
          levelId: data.levelId ?? "N/A",
          isEditable: false,
          timestamp: data.timestamp ?? new Date().toISOString(),
        };
        loadedMarkers.push(marker);
      });

      console.log("Firestore から取得したピン (マーカー配列):", loadedMarkers);

      setMarkers(loadedMarkers);
    } catch (error) {
      console.error("Firestore からピンの取得に失敗:", error);
    }
  };

  if (!isAvailable) return <p className="App-error-text">Geolocation IS NOT available</p>;
  if (!isLoaded) return <div>Google Maps APIのロード中...</div>;

  return (
    <GoogleMap
      mapContainerStyle={{ width: "100%", height: "500px" }}
      center={{ lat: position.latitude || 0, lng: position.longitude || 0 }}
      zoom={18}
      options={{
        mapId: mapId,
        disableDefaultUI: false,
        clickableIcons: false,
      }}
      onClick={handleMapClick}
    >
      {markers.map((marker) => (
        <Marker
          key={marker.timestamp} // ドキュメント ID など一意な値を key に使用
          position={{ lat: marker.lat, lng: marker.lng }}
          title={marker.title}
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
            <p>レベル: {selectedMarker.levelId}</p>
          </div>
        </InfoWindow>
      )}
      <Polyline path={path} options={{ strokeColor: "#FF0000" }} />
    </GoogleMap>
  );
}

export default GoogleMapAPI;