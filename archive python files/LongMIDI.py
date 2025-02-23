import argparse
import numpy as np
import mido
from mido import MidiFile, MidiTrack, Message, MetaMessage
from collections import defaultdict

def parse_midi(midi_path):
    """Extract notes and timing from MIDI file"""
    mid = MidiFile(midi_path)
    notes = []
    tempos = []
    ticks_per_beat = mid.ticks_per_beat
    current_time = 0  # In ticks
    
    for track in mid.tracks:
        for msg in track:
            current_time += msg.time
            if msg.type == 'set_tempo':
                tempos.append(msg)
            if msg.type == 'note_on' and msg.velocity > 0:
                notes.append({
                    'note': msg.note,
                    'time': current_time,
                    'velocity': msg.velocity
                })
    return notes, ticks_per_beat, tempos

def build_markov_model(notes, order=2):
    """Create Markov transition model"""
    model = defaultdict(list)
    for i in range(len(notes)-order):
        state = tuple(notes[i+j]['note'] for j in range(order))
        next_note = notes[i+order]['note']
        model[state].append(next_note)
    return model

def generate_continuation(model, last_notes, length=50):
    """Generate new notes using Markov chain"""
    current_state = tuple(last_notes)
    continuation = []
    
    for _ in range(length):
        if current_state not in model:
            # Fallback: use shorter state
            current_state = current_state[1:] if len(current_state) > 1 else ()
            if not current_state:
                break
        next_note = np.random.choice(model[current_state])
        continuation.append(next_note)
        current_state = tuple(list(current_state[1:]) + [next_note])
    return continuation

def save_midi(original_notes, new_notes, ticks_per_beat, tempos, output_path):
    """Save combined MIDI file"""
    mid = MidiFile(ticks_per_beat=ticks_per_beat)
    track = MidiTrack()
    mid.tracks.append(track)
    
    # Add original tempo events
    for tempo in tempos:
        track.append(tempo)
    
    # Combine all notes
    last_time = max(n['time'] for n in original_notes) if original_notes else 0
    all_notes = original_notes + [
        {'note': n, 'time': last_time + 480*(i+1), 'velocity': 64}
        for i, n in enumerate(new_notes)
    ]
    
    # Convert to MIDI messages
    all_notes.sort(key=lambda x: x['time'])
    current_time = 0
    for note in all_notes:
        delta = note['time'] - current_time
        track.append(Message('note_on', note=note['note'], 
                          velocity=note['velocity'], time=delta))
        track.append(Message('note_off', note=note['note'], 
                          velocity=0, time=0))
        current_time = note['time']
    
    mid.save(output_path)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='MIDI Melody Continuation')
    parser.add_argument('input', help='Input MIDI file')
    parser.add_argument('output', help='Output MIDI file')
    parser.add_argument('--length', type=int, default=50, 
                       help='Number of notes to generate')
    parser.add_argument('--order', type=int, default=2,
                       help='Markov chain order (1-3)')
    
    args = parser.parse_args()
    
    # Process MIDI
    notes, ticks, tempos = parse_midi(args.input)
    if not notes:
        print("Error: No notes found in input file")
        exit(1)
    
    # Build model
    model = build_markov_model(notes, args.order)
    
    # Generate continuation
    last_original = [n['note'] for n in notes[-args.order:]]
    new_notes = generate_continuation(model, last_original, args.length)
    
    # Save result
    save_midi(notes, new_notes, ticks, tempos, args.output)
    print(f"Generated {len(new_notes)} new notes in {args.output}")