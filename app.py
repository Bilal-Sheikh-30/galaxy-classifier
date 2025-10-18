from flask import Flask, render_template, request, jsonify
from PIL import Image
import io, base64, torch, keras
import numpy as np
from torchvision import transforms, models
import torch.nn as nn
import tensorflow as tf
from tensorflow.keras.preprocessing import image as keras_image

app = Flask(__name__)

auto_path = './model/galaxy_autoencoder_savedmodel'
autoencoder = keras.layers.TFSMLayer(auto_path, call_endpoint='serving_default')
GALAXY_THRESHOLD = 0.0020 

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
num_classes = 10
class_names = [
    "Disturbed Galaxy",
    "Merging Galaxy",
    "Round Smooth Galaxy",
    "In-between Round Smooth Galaxy",
    "Cigar Shaped Smooth Galaxy",
    "Barred Spiral Galaxy",
    "Unbarred Tight Spiral Galaxy",
    "Unbarred Loose Spiral Galaxy",
    "Edge-on Galaxy (No Bulge)",
    "Edge-on Galaxy (With Bulge)"
]

model = models.resnet50(weights=None)
model.fc = nn.Linear(model.fc.in_features, num_classes)
model.load_state_dict(torch.load('./model/galaxy_resnet50_fold4.pt', map_location=device))
model.eval().to(device)

resnet_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
])

def is_galaxy(img: Image.Image):
    """Check if image is galaxy using autoencoder reconstruction error."""
    img = img.resize((128, 128), Image.BILINEAR)
    arr = keras_image.img_to_array(img).astype("float32") / 255.0
    arr = np.expand_dims(arr, axis=0)

    reconstructed = list(autoencoder(arr).values())[0].numpy()
    mse = np.mean((arr - reconstructed) ** 2)

    is_gal = mse <= GALAXY_THRESHOLD
    return is_gal, mse


def classify_galaxy(img: Image.Image):
    """Classify galaxy type using trained ResNet."""
    img_t = resnet_transform(img).unsqueeze(0).to(device)
    with torch.no_grad():
        outputs = model(img_t)
        probs = torch.softmax(outputs, dim=1)[0]
        pred_idx = torch.argmax(probs).item()
        confidence = probs[pred_idx].item()
    return class_names[pred_idx], confidence


def image_to_base64(img: Image.Image):
    """Convert PIL image to base64 string."""
    buffered = io.BytesIO()
    img.save(buffered, format="JPEG")
    return base64.b64encode(buffered.getvalue()).decode("utf-8")

@app.route('/')
def home():
    return render_template('index.html')


@app.route('/predict', methods=['POST'])
def predict():
    files = request.files.getlist("images")
    if not files:
        return jsonify({"error": "No images uploaded"}), 400

    results = []
    for file in files:
        try:
            img = Image.open(file.stream).convert("RGB")
            img_base64 = image_to_base64(img)

            # Check if it's a galaxy
            is_gal, mse = is_galaxy(img)

            if not is_gal:
                results.append({
                    "image_base64": img_base64,
                    "predicted_class": "❌ Non-Galaxy",
                    "confidence": None,
                    "mse": round(float(mse), 6)
                })
                continue

            # Classify galaxy type
            pred_class, confidence = classify_galaxy(img)
            results.append({
                "image_base64": img_base64,
                "predicted_class": f"✅ {pred_class}",
                "confidence": round(float(confidence), 4),
                "mse": round(float(mse), 6)
            })

        except Exception as e:
            print("Error processing image:", e)
            results.append({
                "error": str(e)
            })

    return jsonify(results), 200


if __name__ == '__main__':
    app.run(debug=True)
