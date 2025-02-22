import magenta.music as mm
from magenta.models.shared import sequence_generator_bundle
from magenta.music.protobuf import generator_pb2
from magenta.music.protobuf import music_pb2
import tensorflow.compat.v1 as tf
import json

tf.disable_v2_behavior()

bundle = sequence_generator_bundle.read_bundle_file('basic_rnn.mag')
generator_map = mm.sequence_generator.get_generator_map()
generator = generator_map['basic_rnn'](checkpoint=None, bundle=bundle)
generator.initialize()

def generate_notes():
    primer_sequence = music_pb2.NoteSequence()
    primer_sequence.tempos.add(qpm=120)
    generator_options = generator_pb2.GeneratorOptions()
    generator_options.generate_sections.add(start_time=0, end_time=10)
    sequence = generator.generate(primer_sequence, generator_options)
    notes = [(note.pitch, note.start_time, note.end_time) for note in sequence.notes]
    return notes

if __name__ == '__main__':
    generated_notes = generate_notes()
    with open("generated_notes.json", "w") as f:
        json.dump(generated_notes, f)
    print("Generated notes saved to generated_notes.json")