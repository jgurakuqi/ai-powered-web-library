# Python script (load_model.py)
import argparse
import torch
from transformers import BertForSequenceClassification, BertTokenizer

# print("ENTERED AI MODEL")

# Load fine-tuned model
model_path = "fine_tuned_bert_model"
fine_tuned_model = BertForSequenceClassification.from_pretrained(model_path)

# Load tokenizer
tokenizer = BertTokenizer.from_pretrained("bert-base-uncased")


def run_inference(inference_text):
    # Tokenize input for inference
    tokenized_input = tokenizer(inference_text, return_tensors="pt")

    # Run inference
    with torch.no_grad():
        outputs = fine_tuned_model(**tokenized_input)

    # Access logits or probabilities
    logits = outputs.logits
    probabilities = logits.softmax(dim=1)

    # Convert probabilities to a human-readable label
    label_dict = {
        0: "very bad",
        1: "slightly bad",
        2: "mixed",
        3: "slightly good",
        4: "very good",
    }

    # print("GELO")

    predicted_label = label_dict[torch.argmax(probabilities).item()]

    return predicted_label


def main():
    parser = argparse.ArgumentParser(description="Process some text for inference.")
    parser.add_argument("inference_text", type=str, help="Text for inference")

    args = parser.parse_args()
    inference_text = args.inference_text

    print(run_inference(inference_text))


import sys

main()
sys.stdout.flush()

# from flask import Flask, request, jsonify

# # from load_model import run_inference

# app = Flask(__name__)


# @app.route("/predict", methods=["POST"])
# def predict():
#     data = request.get_json()
#     inference_text = data["inference_text"]

#     result = run_inference(inference_text)

#     return jsonify({"result": result})


# if __name__ == "__main__":
#     # app.run(debug=True)
#     main()
