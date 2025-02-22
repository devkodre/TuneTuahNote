from flask import Flask, jsonify
import magenta.music as mm
from magenta.models.performance_rnn import performance_sequence_generator
from magenta.models.shared import sequence_generator_bundle
import tensorflow.compat.v1 as tf

app = Flask(__name__)

# Load the Magenta model
BUNDLE_FILE = "performance_rnn.mag"  # Ensure you have the correct model file
bundle = sequence_generator_bundle.read_bundle_file(BUNDLE_FILE)
generator = performance_sequence_generator.PerformanceRnnSequenceGenerator(bundle)
generator.initialize()

@app.route('/generate-music', methods=['GET'])
def generate_music():
    """Generates a sequence of notes and returns them as JSON."""
    qpm = 120  # Tempo
    primer = mm.NoteSequence()
    
    # Generate a 4-bar phrase
    generator_options = generator.default_generate_options()
    generator_options.args['temperature'].float_value = 1.0  # Randomness

    generated_sequence = generator.generate(primer, generator_options)
    
    notes = []
    for note in generated_sequence.notes:
        notes.append({
            "note": f"{mm.note_number_to_note_name(note.pitch)}{(note.pitch // 12) - 1}",
            "start_time": note.start_time,
            "end_time": note.end_time
        })

    return jsonify({"notes": notes})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
