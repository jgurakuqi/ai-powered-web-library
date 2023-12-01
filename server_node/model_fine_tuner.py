import torch
import json
from transformers import BertTokenizer, BertForSequenceClassification, AdamW
from torch.utils.data import TensorDataset, DataLoader

# Load data from JSON file
with open("dataset.json", "r", encoding="utf-8") as file:
    data = json.load(file)

# Extract texts and labels
texts = [entry["text"] for entry in data]
labels = [entry["label"] for entry in data]

# Load BERT tokenizer
tokenizer = BertTokenizer.from_pretrained("bert-base-uncased")

# Tokenize input texts
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
tokenized_inputs = tokenizer(
    texts, padding=True, truncation=True, return_tensors="pt"
).to(device)

# Convert labels to numerical values
label_dict = {
    "very bad": 0,
    "slightly bad": 1,
    "mixed": 2,
    "slightly good": 3,
    "very good": 4,
}
numeric_labels = torch.tensor([label_dict[label] for label in labels]).to(device)

# Prepare PyTorch Dataset
dataset = TensorDataset(
    tokenized_inputs["input_ids"].to(device),
    tokenized_inputs["attention_mask"].to(device),
    numeric_labels.to(device),
)

# Load pre-trained BERT model
import os


# Load pre-trained BERT model or fine-tuned model if it already exists
model_path = "fine_tuned_bert_model"
if os.path.exists(model_path):
    fine_tuned_model = BertForSequenceClassification.from_pretrained(model_path).to(
        device
    )
    print("Loaded pre-existing fine-tuned model.")
else:
    # Load pre-trained BERT model
    model = BertForSequenceClassification.from_pretrained(
        "bert-base-uncased", num_labels=len(label_dict)
    ).to(device)

    # Create DataLoader
    train_dataloader = DataLoader(dataset, batch_size=2, shuffle=True)

    # Set up optimizer and scheduler
    optimizer = AdamW(model.parameters(), lr=5e-5)
    num_epochs = 3

    # Training loop
    for epoch in range(num_epochs):
        for batch in train_dataloader:
            optimizer.zero_grad()
            inputs = batch[:-1]  # Exclude labels
            labels = batch[-1].to(device)

            # Move inputs to GPU
            inputs = {
                key: value.to(device)
                for key, value in zip(tokenized_inputs.keys(), inputs)
            }

            outputs = model(**inputs, labels=labels)
            loss = outputs.loss
            loss.backward()
            optimizer.step()

    # Save the fine-tuned model
    model.save_pretrained(model_path)
    print("Saved fine-tuned model.")

    # Use the fine-tuned model for inference
    fine_tuned_model = model.to(device)

# INFERENCE:

# Load fine-tuned model
fine_tuned_model = BertForSequenceClassification.from_pretrained(
    "fine_tuned_bert_model"
).to(device)

# Tokenize input for inference
inference_text = "An utter waste of time. The writing was atrocious, and I couldn't connect with any of the characters. I kept hoping it would get better, but it only got worse. Avoid at all costs."
tokenized_input = tokenizer(inference_text, return_tensors="pt").to(device)

# Run inference
with torch.no_grad():
    outputs = fine_tuned_model(**tokenized_input)

# Access logits or probabilities
logits = outputs.logits
probabilities = logits.softmax(dim=1)

print(outputs)
print(logits)
print(probabilities)
