import { useState, useEffect, useRef } from 'react';

const useGeolocation = (enabled = false, options = {}) => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const watchId = useRef(null);
  const lastUpdate = useRef(0);

  const { 
    throttleMs = 5000, 
    enableHighAccuracy = true, 
    maximumAge = 10000, 
    timeout = 15000 
  } = options;

  useEffect(() => {
    if (enabled && navigator.geolocation) {
      watchId.current = navigator.geolocation.watchPosition(
        (pos) => {
          const now = Date.now();
          if (now - lastUpdate.current >= throttleMs) {
            const { latitude, longitude, heading, speed } = pos.coords;
            setLocation({ lat: latitude, lng: longitude, heading, speed });
            lastUpdate.current = now;
            setError(null);
          }
        },
        (err) => {
          setError(err);
        },
        { enableHighAccuracy, maximumAge, timeout }
      );
    } else if (!enabled && watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }

    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, [enabled, throttleMs, enableHighAccuracy, maximumAge, timeout]);

  return { location, error };
};

export default useGeolocation;
