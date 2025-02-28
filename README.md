# Universidad Central del Ecuador  
## Facultad de Ingeniería y Ciencias Aaplicadas  
### Ingeniería en Sistemas de Información  

# Minería de Datos - FloreStyle  
## Grupo 7  
### Integrantes:  
- Klever Robalino  
- Kevin Zurita  

---

# FloreStyle  

FloreStyle es una aplicación móvil desarrollada en React Native que utiliza un modelo preentrenado de YOLO (You Only Look Once) para el reconocimiento de imágenes de flores. La aplicación cuenta con un backend en Flask que maneja un endpoint para procesar las imágenes y obtener recomendaciones de cuidado y características de las flores reconocidas. Adicionalmente, se integra la API de OpenAI para proporcionar información detallada y personalizada sobre las flores detectadas.

## Características principales  
- **Reconocimiento de imágenes**: Utiliza un modelo preentrenado de YOLO para identificar diferentes tipos de flores.  
- **Recomendaciones de cuidado**: Proporciona consejos y características específicas para el cuidado de las flores reconocidas.  
- **Integración con OpenAI**: Utiliza la API de OpenAI para generar recomendaciones detalladas y personalizadas.  
- **Desarrollo móvil**: La aplicación está construida en React Native, lo que permite su uso en dispositivos iOS y Android.  
- **Backend en Flask**: Maneja el procesamiento de imágenes y la comunicación con el modelo de YOLO y la API de OpenAI.  

## Diagrama de flujo  

1. **Envío de imagen**: El usuario captura o selecciona una imagen desde la aplicación móvil.  
2. **Procesamiento en el backend**: La imagen se envía al backend en Flask, donde se utiliza el modelo de YOLO para reconocer las flores.  
3. **Generación de recomendaciones**: El backend utiliza la API de OpenAI para generar recomendaciones de cuidado y características de las flores detectadas.  
4. **Devolución de resultados**: Los resultados se envían de vuelta a la aplicación móvil, donde se muestran al usuario.  
 
## Requisitos del sistema  
- **React Native**: Para el desarrollo de la aplicación móvil.  
- **Flask**: Para el backend y el manejo de endpoints.  
- **YOLO**: Modelo preentrenado para el reconocimiento de imágenes.  
- **OpenAI API**: Para la generación de recomendaciones.  
- **Android Studio**: Para la compilación y emulación de la aplicación en dispositivos Android.  
- **Node.js y npm**: Para gestionar las dependencias de React Native.  
- **Python**: Para el backend en Flask.  

## Instalación y configuración  

1. Clona el repositorio:  
   ```bash  
   git clone https://github.com/tu-usuario/florestyle.git  
   cd florestyle  

2. Instala las dependencias del backend:
   ```bash
   cd backend  
   pip install -r requirements.txt  

3. Instala las dependencias de la aplicación móvil:
   ```bash
   cd ../florestyle  
   npm install  

4. Configura las variables de entorno:
   Crea un archivo .env en la carpeta backend y agrega tu clave de API de OpenAI:
   ```bash
   OPENAI_API_KEY=tu_clave_api  

5. Ejecuta el backend:
    ```bash
    bash
    Copy
    cd ../backend  
    python app.py 

6. Ejecuta la aplicación móvil:
    ```bash
    cd ../florestyle  
    npx react-native run-android  