
  import React, { useEffect, useState } from 'react';
  import { StyleSheet, Text, View, Button } from 'react-native';
  import * as Location from 'expo-location';
  import * as TaskManager from 'expo-task-manager';
  import axios from 'axios';
  
  const LOCATION_TRACKING = 'location-tracking';
  
  TaskManager.defineTask(LOCATION_TRACKING, async ({ data, error }) => {
    if (error) {
      console.error(error);
      return;
    }
    if (data) {
      const { locations } = data;
      try {
      console.log("locations=>",locations)
        await axios.post('http://192.168.1.14:3000/api/tracking/add', {
          lalt: locations[0].coords.latitude,
          lang: locations[0].coords.longitude
        });
      } catch (err) {
        console.error('Erreur envoi données:', err);
      }
    }
  });
  
  export default function TabTwoScreen() {
    const [location, setLocation] = useState(null);
    const [trackingStatus, setTrackingStatus] = useState(false);
  
    const startLocationTracking = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.error('Permission refusée');
          return;
        }
  
        const backgroundStatus = await Location.requestBackgroundPermissionsAsync();
        if (backgroundStatus.status !== 'granted') {
          console.error('Permission background refusée');
          return;
        }
  
        await Location.startLocationUpdatesAsync(LOCATION_TRACKING, {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 10000,
          distanceInterval: 0,
          foregroundService: {
            notificationTitle: "Tracking actif",
            notificationBody: "Localisation en cours..."
          }
        });
  
        setTrackingStatus(true);
      } catch (err) {
        console.error('Erreur:', err);
      }
    };
  
    const stopLocationTracking = async () => {
      try {
        await Location.stopLocationUpdatesAsync(LOCATION_TRACKING);
        setTrackingStatus(false);
      } catch (err) {
        console.error('Erreur arrêt tracking:', err);
      }
    };
  
    return (
      <View style={styles.container}>
        <Text style={styles.status}>
          Statut: {trackingStatus ? 'Actif' : 'Inactif'}
        </Text>
        <Button
          title={trackingStatus ? "Arrêter le tracking" : "Démarrer le tracking"}
          onPress={trackingStatus ? stopLocationTracking : startLocationTracking}
        />
      </View>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
    status: {
      fontSize: 18,
      marginBottom: 20,
    },
  });