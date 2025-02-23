from flask import Flask, request, jsonify
from flask_cors import CORS
try:
    from test_model import generate_melody
except ImportError:
    import sys
    sys.path.append('/path/to/your/module')
    from test_model import generate_melody
import numpy as np

app = Flask(__name__)
CORS(app)  # Enable CORS

@app.route('/generate', methods=['POST'])
def generate():
    data = request.json
    notes = data.get('notes')
    if not notes:
        return jsonify({'error': 'No notes provided'}), 400

    generated_notes = generate_melody(notes)
    return jsonify({'generated_notes': generated_notes})

if __name__ == '__main__':
    app.run(debug=True)