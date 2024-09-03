useEffect(() => {
  if (isTracking) {
    // Start the timer if it's not already running
    if (!timerRef.current) {
      timerRef.current = setInterval(() => {
        setElapsedTime(prevTime => prevTime + 1);
      }, 1000);
    }

    // Start watching location
    const startLocationTracking = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('Permission to access location was denied');
          return;
        }

        locationSubscriptionRef.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            distanceInterval: 1,
            timeInterval: 1000,
          },
          (location) => {
            const { latitude, longitude } = location.coords;

            if (previousLocation) {
              const distance = haversine(previousLocation, { latitude, longitude }, { unit: 'meter' });
              setTotalDistance(prevDistance => prevDistance + distance);
            }

            setPreviousLocation({ latitude, longitude });
          }
        );
      } catch (error) {
        console.error('Error starting location tracking', error);
      }
    };

    startLocationTracking();
  } else {
    // Stop the timer and location tracking
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (locationSubscriptionRef.current) {
      locationSubscriptionRef.current.remove();
      locationSubscriptionRef.current = null;
    }
  }

  return () => {
    // Cleanup
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (locationSubscriptionRef.current) {
      locationSubscriptionRef.current.remove();
    }
  };
}, [isTracking]);

