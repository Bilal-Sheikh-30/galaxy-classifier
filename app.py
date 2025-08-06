from flask import Flask, render_template, url_for, jsonify, request
from PIL import Image
import io, base64
import torch
from torchvision import transforms, models
import torch.nn as nn

app = Flask(__name__)

# Load model
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

# Create model and load weights
model = models.resnet50(weights=None)
model.fc = nn.Linear(model.fc.in_features, num_classes)
model.load_state_dict(torch.load('./model/galaxy_resnet50_fold4.pt', map_location=device))
model.eval()
model.to(device)

# Image preprocessing
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
])

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
            # Load image
            img = Image.open(file.stream).convert("RGB")
            img_t = transform(img).unsqueeze(0).to(device)

            # Predict
            with torch.no_grad():
                outputs = model(img_t)
                probs = torch.softmax(outputs, dim=1)[0]
                pred_idx = torch.argmax(probs).item()
                confidence = probs[pred_idx].item()

            # Encode image to base64
            buffered = io.BytesIO()
            img.save(buffered, format="JPEG")
            img_base64 = base64.b64encode(buffered.getvalue()).decode("utf-8")

            # Append result
            results.append({
                "image_base64": img_base64,
                "predicted_class": class_names[pred_idx],
                "confidence": confidence
            })
        except Exception as e:
            print("Error processing image:", e)

    return jsonify(results), 200


if __name__ == '__main__':
    app.run()