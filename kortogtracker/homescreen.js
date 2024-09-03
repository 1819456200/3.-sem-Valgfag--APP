// HomeScreen.js
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, ScrollView, Dimensions } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';

function HomeScreen({ navigation }) {
  const [location, setLocation] = useState(null);
  const [route, setRoute] = useState([]);
  const [tracking, setTracking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [locationSubscription, setLocationSubscription] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Tilladelse nægtet', 'Tilladelse til at få adgang til placering er nødvendig.');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation.coords);
    })();
  }, []);

  const startTracking = async () => {
    Alert.alert(
      "Start Rutesporing",
      "Er du sikker på, at du vil starte rutesporingen?",
      [
        {
          text: "Annuller",
          style: "cancel"
        },
        {
          text: "Start",
          onPress: async () => {
            setTracking(true);
            setPaused(false);
            const subscription = await Location.watchPositionAsync(
              {
                accuracy: Location.Accuracy.High,
                timeInterval: 1000,
                distanceInterval: 1,
              },
              (newLocation) => {
                setLocation(newLocation.coords);
                setRoute((prevRoute) => [...prevRoute, newLocation.coords]);
              }
            );
            setLocationSubscription(subscription);
          }
        }
      ]
    );
  };

  const stopTracking = () => {
    if (locationSubscription) {
      locationSubscription.remove();
      setLocationSubscription(null);
      setTracking(false);
      setPaused(false);
    }
  };

  const pauseTracking = () => {
    if (locationSubscription) {
      locationSubscription.remove();
      setLocationSubscription(null);
      setPaused(true);
    }
  };

  const resumeTracking = async () => {
    setPaused(false);
    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 1000,
        distanceInterval: 1,
      },
      (newLocation) => {
        setLocation(newLocation.coords);
        setRoute((prevRoute) => [...prevRoute, newLocation.coords]);
      }
    );
    setLocationSubscription(subscription);
  };

  const saveRoute = () => {
    Alert.alert('Rute gemt!', 'Din rute er blevet gemt.');
    // Perform save logic here before navigating
    navigation.navigate('SaveScreen'); // Navigate to SaveScreen after saving the route
  };

  return (
    <ScrollView 
      horizontal 
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      style={styles.container}
    >
      <View style={styles.page}>
        <View style={styles.topBanner}>
          <Text style={styles.bannerText}>GO´TUR</Text>
        </View>

        <View style={styles.mapContainer}>
          {location && (
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              showsUserLocation={true}
              followsUserLocation={true}
            >
              <Polyline coordinates={route} strokeColor="#FF0000" strokeWidth={3} />
              <Marker coordinate={location} title="Du er her" />
            </MapView>
          )}
          <View style={styles.mapButtonContainer}>
            {tracking && !paused ? (
              <>
                <TouchableOpacity style={styles.mapButton} onPress={pauseTracking}>
                  <Text style={styles.mapButtonText}>Pause</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.mapButton} onPress={stopTracking}>
                  <Text style={styles.mapButtonText}>Stop</Text>
                </TouchableOpacity>
              </>
            ) : tracking && paused ? (
              <TouchableOpacity style={styles.mapButton} onPress={resumeTracking}>
                <Text style={styles.mapButtonText}>Genoptag</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.mapButton} onPress={startTracking}>
                <Text style={styles.mapButtonText}>Start</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.mapButton} onPress={saveRoute} disabled={tracking}>
              <Text style={[styles.mapButtonText, tracking && { color: '#bbb' }]}>Gem Rute</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navButton}>
            <FontAwesome5 name="shoe-prints" size={24} color="white" />
            <Text style={styles.navButtonText}>Find rute</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navButton}>
            <FontAwesome5 name="home" size={24} color="white" />
            <Text style={styles.navButtonText}>Hjem</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navButton}>
            <FontAwesome5 name="plus" size={24} color="white" />
            <Text style={styles.navButtonText}>Opret rute</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#94A89A',
  },
  page: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  topBanner: {
    backgroundColor: '#314F3E',
    paddingTop: 40,
    paddingBottom: 10,
    alignItems: 'center',
  },
  bannerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  mapContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 30,
    borderRadius: 10,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mapButton: {
    backgroundColor: '#3E5641',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  mapButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#314F3E',
    paddingVertical: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  navButton: {
    alignItems: 'center',
  },
  navButtonText: {
    color: 'white',
    marginTop: 5,
    fontSize: 12,
  },
});

export default HomeScreen;
