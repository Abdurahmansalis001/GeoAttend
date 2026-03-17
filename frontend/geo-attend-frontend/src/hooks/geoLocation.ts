
import { useState, useCallback } from 'react';
import { Location } from '../../types';

interface GeolocationState {
  location: Location | null;
  loading: boolean;
  error: string | null;
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    loading: false,
    error: null
  });

  const getCurrentPosition = useCallback((): Promise<Location> => {
    return new Promise((resolve, reject) => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      if (!navigator.geolocation) {
        const error = 'Geolocation is not supported by your browser';
        setState(prev => ({ ...prev, loading: false, error }));
        reject(new Error(error));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: Location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setState({ location, loading: false, error: null });
          resolve(location);
        },
        (error) => {
          let errorMessage = 'Unable to retrieve your location';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied. Please enable location permissions.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out.';
              break;
          }
          setState(prev => ({ ...prev, loading: false, error: errorMessage }));
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    getCurrentPosition,
    clearError
  };
};
