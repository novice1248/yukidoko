import React, { useState, useEffect, useRef } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

/* エラーテキスト */
const ErrorText = () => (
  <p className="App-error-text">geolocation IS NOT available</p>
);

// 位置情報の型を定義
interface Position {
  latitude: number | null;
  longitude: number | null;
}

function Geolocation() {
  const [isAvailable, setAvailable] = useState(false);
  const [position, setPosition] = useState<Position>({
    latitude: null,
    longitude: null,
  });

  // useEffectが実行されているかどうかを判定するために用意しています
  const isFirstRef = useRef(true);

  /*
   * ページ描画時にGeolocation APIが使えるかどうかをチェックしています
   * もし使えなければその旨のエラーメッセージを表示させます
   */
  useEffect(() => {
    isFirstRef.current = false;
    if ("geolocation" in navigator) {
      setAvailable(true);
      getCurrentPosition(); // 位置情報を取得
    }
  }, []);

  const getCurrentPosition = () => {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      setPosition({ latitude, longitude });
    });
  };

  // useEffect実行前であれば、"Loading..."という呼び出しを表示させます
  if (isFirstRef.current) return <div className="App">Loading...</div>;

  // 位置情報が取得できなかった場合のエラーメッセージ
  if (!isAvailable) return <ErrorText />;

  return <GoogleMapAPI position={position} />;
}

function GoogleMapAPI({ position }: { position: Position }) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyCdasc3THxZXomus-ULUMfeAd3y4S6dKho",
  });

  const [map, setMap] = React.useState(null);

  const onLoad = React.useCallback(function callback(map) {
    setMap(map);
  }, []);

  const onUnmount = React.useCallback(function callback(map) {
    setMap(null);
  }, []);

  const containerStyle = {
    width: "400px",
    height: "400px",
  };

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={{
        lat: position.latitude || 0, // 取得した位置情報を地図の中心に設定
        lng: position.longitude || 0, // 取得した位置情報を地図の中心に設定
      }}
      zoom={18}
      onLoad={onLoad}
      onUnmount={onUnmount}
    >
      {/* Child components, such as markers, info windows, etc. */}
      <Marker
        position={{
          lat: position.latitude || 0, // 取得した位置情報を地図の中心に設定
          lng: position.longitude || 0, // 取得した位置情報を地図の中心に設定
        }}
      />
    </GoogleMap>
  ) : (
    <></>
  );
}

export default Geolocation;
