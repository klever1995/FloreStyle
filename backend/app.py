from flask import Flask, request, jsonify
from ultralytics import YOLO
import os
import openai  # Corregido
from flask_cors import CORS
from dotenv import load_dotenv

# Cargar las variables de entorno desde el archivo .env
load_dotenv()

# Obtener la clave de API de OpenAI desde las variables de entorno
openai.api_key = os.getenv("OPENAI_API_KEY")

app = Flask(__name__)

# Habilitar CORS en toda la aplicación
CORS(app)

# Cargar el modelo de YOLO
MODEL_PATH = "yolo11_flowers.pt"
model = YOLO(MODEL_PATH)

# Carpeta para guardar imágenes temporales
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Extensiones permitidas para las imágenes
ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Función para generar una recomendación usando OpenAI
def get_recommendation(flower_classes):
    try:
        # Crear un prompt detallado que incluya las clases de flores y las probabilidades
        flower_description = ", ".join([f"{flower[0]} (confianza: {flower[1]:.2f})" for flower in flower_classes])
        prompt = f"Recomendación bien concisa de cuidado para las flores detectadas: {flower_description}"
        
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",  # Usa un modelo compatible como gpt-3.5-turbo
            messages=[
                {"role": "system", "content": "Eres un asistente experto en flores. Responde proporcionando los cuidados necesarios para cada flor mencionada."},
                {"role": "user", "content": f"Dime cómo cuidar la flor {prompt}."} 
            ],
            max_tokens=300,
            temperature=0.2  # Parámetro de temperatura para respuestas más concisas
        )

        recommendation = response["choices"][0]["message"]["content"].strip()
        if not recommendation:
            return "No se pudo obtener una recomendación."
        return recommendation
    
    except Exception as e:
        print(f"Error al obtener la recomendación: {e}")
        return "No se pudo obtener una recomendación."

# Función para obtener características de la flor usando OpenAI
def get_flower_details(flower_classes):
    try:
        # Crear un prompt detallado que incluya las clases de flores y las probabilidades
        flower_description = ", ".join([f"{flower[0]} (confianza: {flower[1]:.2f})" for flower in flower_classes])
        prompt = f"Proporciona detalles sobre las siguientes flores: {flower_description}. Incluye lugar de origen, nombre científico, y características principales."

        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",  # Usa un modelo compatible como gpt-3.5-turbo
            messages=[
                {"role": "system", "content": "Eres un asistente experto en botánica. Responde proporcionando detalles como lugar de origen, nombre científico y características principales de las flores mencionadas."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=400,  # Aumentamos los tokens para permitir más detalles
            temperature=0.2  # Parámetro de temperatura para respuestas más concisas
        )

        flower_details = response["choices"][0]["message"]["content"].strip()
        if not flower_details:
            return "No se pudieron obtener detalles sobre las flores."
        return flower_details

    except Exception as e:
        print(f"Error al obtener los detalles de la flor: {e}")
        return "No se pudieron obtener detalles sobre las flores."

# Modificamos la ruta /predict para incluir los detalles de la flor
@app.route("/predict", methods=["POST"])
def predict():
    if "image" not in request.files:
        return jsonify({"error": "No se encontró ninguna imagen"}), 400

    image = request.files["image"]

    if not allowed_file(image.filename):
        return jsonify({"error": "Archivo no permitido, se esperan imágenes JPG, JPEG o PNG"}), 400

    image_path = os.path.join(UPLOAD_FOLDER, image.filename)
    image.save(image_path)

    # Obtener el umbral de confianza (por defecto 0.8)
    threshold = float(request.args.get("threshold", 0.8))

    # Realizar la predicción
    results = model(image_path)

    # Extraer las clases detectadas con la condición de que la confianza sea mayor o igual al umbral
    predictions = []
    flower_classes = []
    for result in results:
        for box in result.boxes:
            if box.conf >= threshold:  # Filtrar las predicciones por el umbral
                flower_class = model.names[int(box.cls)]
                predictions.append({
                    "class": flower_class,
                    "confidence": float(box.conf)
                })
                flower_classes.append((flower_class, float(box.conf)))

    # Si no se detectaron flores, devolver un mensaje
    if not predictions:
        return jsonify({"message": "No se detectaron flores en la imagen. Intenta con otra imagen."}), 200

    # Obtener las recomendaciones y detalles de las flores detectadas
    recommendation = get_recommendation(flower_classes)
    flower_details = get_flower_details(flower_classes)

    return jsonify({
        "predictions": predictions,
        "recommendation": recommendation,
        "flower_details": flower_details
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)