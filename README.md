# Galaxy Image Classification using CNN and ResNet-50

<div align="center">
  [![Watch the demo](https://res.cloudinary.com/dacj8pmtm/video/upload/Galaxy_Classifier_Demo_ki2wis.mp4)
</div>

## 📋 Project Overview

This project implements an automated galaxy morphology classification system using deep learning techniques. The classifier can identify 10 different types of galaxies from astronomical images with 84% accuracy using a pretrained ResNet-50 model.

**🔗 Repository:** [GitHub - Galaxy Classifier](https://github.com/Bilal-Sheikh-30/galaxy-classifier)

## 🌌 Dataset

The project uses the **Galaxy10 DECaLS dataset**, which contains:
- **17,736 colored galaxy images** (256×256×3)
- **10 galaxy classes** with varying morphologies
- Images sourced from DESI Legacy Imaging Surveys
- Class labels obtained from Galaxy Zoo

### Galaxy Classes:
- **Class 0:** Disturbed Galaxies (944 samples)
- **Class 1:** Merging Galaxies (1,616 samples) 
- **Class 2:** Round Smooth Galaxies (2,165 samples)
- **Class 3:** In-between Round Smooth Galaxies (1,840 samples)
- **Class 4:** Cigar Shaped Smooth Galaxies (290 samples)
- **Class 5:** Barred Spiral Galaxies (1,860 samples)
- **Class 6:** Unbarred Tight Spiral Galaxies (1,551 samples)
- **Class 7:** Unbarred Loose Spiral Galaxies (2,366 samples)
- **Class 8:** Edge-on Galaxies without Bulge (1,264 samples)
- **Class 9:** Edge-on Galaxies with Bulge (1,553 samples)

## 🔬 Methodology

### Data Preprocessing
- Removed nulls and outliers using z-score thresholding (z > 2)
- Applied data augmentation to handle class imbalance
- Balanced all classes to 2,366 samples each
- Maintained original RGB color channels
- Dataset shuffling for better training

### Model Architectures

#### Model 1: Custom CNN
```
Conv2D (32) → MaxPool
Conv2D (64) → MaxPool  
Conv2D (128) → MaxPool
Flatten → Dense (128) → Dropout (0.5) → Dense (10)
```
- **Optimizer:** Adam
- **Loss:** Sparse Categorical Crossentropy
- **Callback:** Early Stopping (patience=5)

#### Model 2: ResNet-50 (Final Model)
- **Base:** Pretrained ResNet-50 (PyTorch)
- **Modification:** Custom final FC layer for 10 classes
- **Training Strategy:** Stratified K-Fold Cross Validation (k=4)
- **Input Size:** 224×224
- **Epochs:** 10 per fold
- **Batch Size:** 32
- **Optimizer:** Adam (lr=1e-4)
- **Loss:** CrossEntropyLoss

## 📊 Results

### Model Performance Comparison

| Model | Accuracy | Notes |
|-------|----------|-------|
| Custom CNN | 14% | Severe overfitting, only predicted Class 2 |
| ResNet-50 | **84%** | Robust generalization across all classes |

### ResNet-50 Detailed Results
- **Test Set:** 1,500 unseen samples
- **Cross-Validation:** Stratified K-Fold (k=4)
- **Best Fold:** Fold 4 selected for final model
- **Performance:** Consistent across all folds with balanced precision and recall

## 🚀 Key Features

- **Automated Galaxy Classification:** Classify galaxies into 10 morphological types
- **Robust Data Handling:** Comprehensive preprocessing and augmentation pipeline
- **Transfer Learning:** Leverages pretrained ResNet-50 for better performance
- **Cross-Validation:** Stratified K-Fold ensures reliable model evaluation
- **Production Ready:** 84% accuracy suitable for astronomy workflows

## 🛠️ Technologies Used

- **Deep Learning:** PyTorch
- **Computer Vision:** ResNet-50 Architecture
- **Data Processing:** NumPy, Pandas
- **Visualization:** Matplotlib, Seaborn
- **Validation:** Stratified K-Fold Cross Validation

## 📈 Applications

This galaxy classifier can be integrated into:
- **Astronomical Survey Pipelines:** Automated morphology classification
- **Research Workflows:** Large-scale galaxy analysis
- **Educational Tools:** Galaxy identification and learning
- **Citizen Science Projects:** Assisting Galaxy Zoo-style classifications

## 🔍 Model Insights

The project demonstrates the importance of:
- **Transfer Learning:** Pretrained models significantly outperform custom architectures
- **Proper Validation:** Stratified K-Fold ensures robust performance estimates
- **Data Balance:** Augmentation techniques handle class imbalance effectively
- **Architecture Choice:** Complex astronomical data requires sophisticated models

## 📄 Documentation

Refer to the complete project report below.

📊 **[Click here for the full project report](./Galaxy%20Image%20Classification%20report.pdf)**
