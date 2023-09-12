import { useState } from 'react';
import { Image, ScrollView, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

import { api } from '../../services/api';

import { styles } from './styles';

import { Tip } from '../../components/Tip';
import { Item } from '../../components/Item';
import { Button } from '../../components/Button';
import { Loading } from '../../components/Loading';

export function Home() {
  const [selectedImageUri, setSelectedImageUri] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState([]);

  async function handleSelectImage() {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== ImagePicker.PermissionStatus.GRANTED) {
        return Alert.alert('Precisamos de acesso a sua galeria de fotos para continuar.');
      }

      setIsLoading(true);

      const response = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 4],
        quality: 1
      });

      if (response?.canceled) {
        return setIsLoading(false);
      }

      if (!response.canceled) {
        const imgManipuled = await ImageManipulator.manipulateAsync(
          response.assets[0].uri,
          [{ resize: { width: 900 } }],
          { compress: 1, format: ImageManipulator.SaveFormat.JPEG, base64: true }
        )
        setSelectedImageUri(imgManipuled.uri);
        foodDetect(imgManipuled.base64)
      }

    } catch (error) {
      console.log(error);
    }
  }

  async function foodDetect(imageBase64) {
    const response = await api.post(`/v2/models/general-image-recognition/versions/aa7f35c01e0642fda5cf400f543e7c40/outputs`, {
      "user_app_id": {
        "user_id": "victorb132",
        "app_id": "image-recognize"
      },
      "inputs": [
        {
          "data": {
            "image": {
              "base64": imageBase64
            }
          }
        }
      ]
    })

    const foods = response.data.outputs[0].data.concepts.map((concept) => {
      return {
        name: concept.name,
        percentage: `${Math.round(concept.value * 100)}%`
      }
    })

    setItems(foods);
    setIsLoading(false);
  }

  return (
    <View style={styles.container}>
      <Button onPress={handleSelectImage} disabled={isLoading} />

      {
        selectedImageUri ?
          <Image
            source={{ uri: selectedImageUri }}
            style={styles.image}
            resizeMode="cover"
          />
          :
          <Text style={styles.description}>
            Selecione a foto do seu prato para analizar.
          </Text>
      }

      <View style={styles.bottom}>
        {
          isLoading ? <Loading /> :
            <>
              <Tip message="Aqui vai uma dica" />

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 24 }}>
                <View style={styles.items}>
                  {items.map((item) => (
                    <Item key={item.name} data={item} />
                  ))}
                </View>
              </ScrollView>
            </>
        }
      </View>
    </View>
  );
}