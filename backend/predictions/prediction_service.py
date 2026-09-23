import time
import os
import logging
import base64

# Set up basic logging
logger = logging.getLogger(__name__)

# ==============================================================================
# dY  AI AUTO-DETECTION ENGINE (WITH XAI GRAD-CAM)
# ==============================================================================

MODEL_PATH = "backend/brain_tumor_model.keras"
model = None

try:
    import tensorflow as tf
    import cv2
    import numpy as np
    
    if os.path.exists(MODEL_PATH):
        model = tf.keras.models.load_model(MODEL_PATH)
        logger.info("o. SUCCESS: Real AI Model loaded successfully!")
    else:
        logger.warning("Real AI Model not found. Using Mock Data.")
except Exception as e:
    logger.error(f"Error loading AI Model: {e}. Using Mock Data.")

def generate_gradcam(img_array, full_model, original_img):
    """
    Generates a Gradient-weighted Class Activation Map (Grad-CAM).
    Specifically handles nested Keras models (Sequential -> EfficientNet -> Head).
    """
    try:
        # Extract the base model
        base_model = full_model.get_layer("efficientnetb0")
        
        # Create a sub-model that outputs the last conv layer and the base model's final output
        last_conv_layer_name = "top_conv"
        grad_model_base = tf.keras.models.Model(
            [base_model.inputs], 
            [base_model.get_layer(last_conv_layer_name).output, base_model.output]
        )

        with tf.GradientTape() as tape:
            # 1. Preprocess the input
            preprocessed_input = full_model.get_layer("sequential")(img_array)
            
            # 2. Run through the base model
            last_conv_layer_output, base_output = grad_model_base(preprocessed_input)
            
            # Watch the conv layer output to compute gradients against it
            tape.watch(last_conv_layer_output)
            
            # 3. Run through the classification head (layers after efficientnetb0)
            x = base_output
            for layer in full_model.layers[3:]:
                x = layer(x)
            preds = x
            
            top_pred_index = tf.argmax(preds[0])
            class_channel = preds[:, top_pred_index]

        # Calculate gradients
        grads = tape.gradient(class_channel, last_conv_layer_output)
        
        # Pool gradients
        pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
        
        # Multiply feature maps by gradients
        feature_maps = last_conv_layer_output[0]
        heatmap = feature_maps @ pooled_grads[..., tf.newaxis]
        heatmap = tf.squeeze(heatmap)
        
        # Normalize
        heatmap = tf.maximum(heatmap, 0) / tf.math.reduce_max(heatmap)
        heatmap = heatmap.numpy()
        
        # Resize to match original image
        heatmap_resized = cv2.resize(heatmap, (original_img.shape[1], original_img.shape[0]))
        heatmap_resized = np.uint8(255 * heatmap_resized)
        
        # Apply Jet colormap
        heatmap_colored = cv2.applyColorMap(heatmap_resized, cv2.COLORMAP_JET)
        
        # Blend with original image
        alpha = 0.5
        blended = cv2.addWeighted(heatmap_colored, alpha, original_img, 1 - alpha, 0)
        
        # Encode to Base64
        _, buffer = cv2.imencode('.jpg', blended)
        return "data:image/jpeg;base64," + base64.b64encode(buffer).decode('utf-8')
    except Exception as e:
        logger.error(f"Grad-CAM Generation Failed: {e}")
        return None

def predict_mri(file_path: str):
    if model is not None:
        try:
            img = cv2.imread(file_path)
            if img is None:
                raise ValueError("Could not read image file.")
                
            # --- HYBRID OOD CHECK (Phase 1): OpenCV Color Variance ---
            b, g, r = cv2.split(img)
            diff_rg = np.mean(cv2.absdiff(r, g))
            diff_rb = np.mean(cv2.absdiff(r, b))
            diff_gb = np.mean(cv2.absdiff(g, b))
            
            if (diff_rg + diff_rb + diff_gb) > 15.0:
                logger.warning("OOD Detected: Uploaded image is a color photo, not an MRI.")
                return {
                    "prediction": "INVALID: Not a valid MRI Scan.",
                    "confidence": 0.0,
                    "probabilities": {"glioma": 0, "meningioma": 0, "pituitary": 0, "notumor": 0},
                    "gradcam": None
                }
            
            img_resized = cv2.resize(img, (224, 224))
            img_array = np.expand_dims(img_resized, axis=0)
            
            predictions = model.predict(img_array)[0]
            
            classes = ["glioma", "meningioma", "notumor", "pituitary"]
            probabilities = {
                classes[0]: round(float(predictions[0]) * 100, 2),
                classes[1]: round(float(predictions[1]) * 100, 2),
                classes[2]: round(float(predictions[2]) * 100, 2),
                classes[3]: round(float(predictions[3]) * 100, 2)
            }
            
            top_class = max(probabilities, key=probabilities.get)
            top_confidence = probabilities[top_class]
            
            display_name = top_class.capitalize()
            if top_class == "notumor":
                display_name = "No Tumor"
                
            # --- GENERATE REAL XAI GRAD-CAM HEATMAP ---
            b64_gradcam = generate_gradcam(img_array, model, img)
            
            return {
                "prediction": display_name,
                "confidence": top_confidence,
                "probabilities": probabilities,
                "gradcam": b64_gradcam
            }
            
        except Exception as e:
            logger.error(f"Error during Real AI prediction: {e}")
            return {
                "prediction": f"ERROR: {str(e)[:25]}...",
                "confidence": 0.0,
                "probabilities": {"glioma": 0, "meningioma": 0, "pituitary": 0, "notumor": 0},
                "gradcam": None
            }

    time.sleep(2)
    return {
        "prediction": "AI CRASHED" if model is not None else "MODEL IS NONE",
        "confidence": 97.83,
        "probabilities": {"glioma": 97.83, "meningioma": 1.02, "pituitary": 0.60, "notumor": 0.55},
        "gradcam": "sample_heatmap.png"
    }
