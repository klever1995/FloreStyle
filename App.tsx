import React, { useState } from 'react';
import { SafeAreaView, View, Button, Image, StyleSheet, Alert, Text, TouchableOpacity, ScrollView } from 'react-native';
import * as ImagePicker from 'react-native-image-picker';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import axios from 'axios';

const App = () => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [flowerDetails, setFlowerDetails] = useState<string | null>(null); // Nuevo estado para los detalles
  const [showWelcome, setShowWelcome] = useState(true);

  const selectImage = () => {
    ImagePicker.launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (response.assets && response.assets.length > 0) {
        setImageUri(response.assets[0].uri || null);
        // Resetear predicciones, recomendaciones y detalles
        setPredictions([]);
        setRecommendation(null);
        setFlowerDetails(null);
      } else {
        Alert.alert('Error', 'No se seleccionó ninguna imagen');
      }
    });
  };

  const takePhoto = async () => {
    const cameraPermission = await request(PERMISSIONS.ANDROID.CAMERA);
    if (cameraPermission === RESULTS.GRANTED) {
      ImagePicker.launchCamera({
        mediaType: 'photo',
        cameraType: 'back',
        saveToPhotos: true,
      }, (response) => {
        if (response.didCancel) {
          Alert.alert('Cancelado', 'La cámara fue cancelada');
        } else if (response.errorCode) {
          Alert.alert('Error', response.errorMessage || 'Error desconocido');
        } else if (response.assets && response.assets.length > 0) {
          setImageUri(response.assets[0].uri || null);
          // Resetear predicciones, recomendaciones y detalles
          setPredictions([]);
          setRecommendation(null);
          setFlowerDetails(null);
        } else {
          Alert.alert('Error', 'No se tomó ninguna foto');
        }
      });
    } else {
      Alert.alert('Permiso denegado', 'No se pudo obtener acceso a la cámara');
    }
  };

  const predictFlowers = async () => {
    if (imageUri) {
      const extension = imageUri.split('.').pop();
      if (extension && ['jpg', 'jpeg', 'png'].includes(extension.toLowerCase())) {
        const formData = new FormData();
        formData.append('image', {
          uri: imageUri,
          type: `image/${extension}`,
          name: `flower.${extension}`,
        });

        try {
          const response = await axios.post('http://192.168.0.10:5000/predict', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          console.log('Respuesta del servidor:', response.data);

          if (response.data.predictions) {
            setPredictions(response.data.predictions);
          } else if (response.data.message) {
            Alert.alert('Resultado', response.data.message);
          }

          if (response.data.recommendation) {
            setRecommendation(response.data.recommendation);
          }

          if (response.data.flower_details) {
            setFlowerDetails(response.data.flower_details); // Guardar los detalles de las flores
          }

        } catch (error) {
          console.error('Error en la predicción:', error);
          Alert.alert('Error', 'Hubo un problema con la predicción');
        }
      } else {
        Alert.alert('Error', 'Solo se permiten imágenes JPG, JPEG o PNG');
      }
    } else {
      Alert.alert('Error', 'Primero selecciona una imagen');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {showWelcome ? (
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeTitle}>Bienvenido a</Text>
            <Image source={require('./assets/logo3.png')} style={styles.welcomeLogo} />
            <Text style={styles.welcomeDescription}>
              Descubre qué flores están en tu imagen con nuestra aplicación de predicción basada en IA.
            </Text>
            <TouchableOpacity style={styles.startButton} onPress={() => setShowWelcome(false)}>
              <Text style={styles.startButtonText}>Comenzar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.mainContainer}>
            <Image source={require('./assets/logo3.png')} style={styles.logo} />
            <View style={styles.buttonRow}>
              <Button title="Seleccionar Imagen" onPress={selectImage} />
              <Button title="Tomar Foto" onPress={takePhoto} />
            </View>
            {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}
            {imageUri && <Button title="Obtener Predicción" onPress={predictFlowers} />}

            {predictions.length > 0 && (
              <View style={styles.predictionsContainer}>
                <Text style={styles.predictionsTitle}>Las flores presentes en la imagen son:</Text>
                {predictions.map((prediction, index) => (
                  <Text key={index} style={styles.predictionText}>
                    {prediction.class}: {prediction.confidence.toFixed(2)}
                  </Text>
                ))}
              </View>
            )}

            {recommendation && (
              <View style={styles.recommendationContainer}>
                <Text style={styles.recommendationTitle}>Recomendación de cuidado:</Text>
                <Text style={styles.recommendationText}>{recommendation}</Text>
              </View>
            )}

            {flowerDetails && ( // Nuevo contenedor para los detalles de las flores
              <View style={styles.detailsContainer}>
                <Text style={styles.detailsTitle}>Detalles de las flores:</Text>
                <Text style={styles.detailsText}>{flowerDetails}</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E3F2FD',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E88E5',
  },
  welcomeLogo: {
    width: 400,
    height: 400,
    resizeMode: 'contain',
  },
  welcomeDescription: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#555',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  startButton: {
    backgroundColor: '#1E88E5',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  startButtonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  mainContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: 140,
    height: 140,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 20,
  },
  image: {
    width: 280,
    height: 280,
    resizeMode: 'contain',
    marginVertical: 20,
  },
  predictionsContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#FFCCCB',
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A0D6B4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  predictionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  predictionText: {
    fontSize: 16,
  },
  recommendationContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#D1F7D5',
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A0D6B4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  recommendationText: {
    fontSize: 16,
    textAlign: 'center',
  },
  detailsContainer: { // Nuevo estilo para el contenedor de detalles
    marginTop: 20,
    padding: 10,
    backgroundColor: '#E6E6FA', // Color lila claro
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A0D6B4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  detailsText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default App;