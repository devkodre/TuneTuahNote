import argparse
import numpy as np
import mido
from mido import MidiFile, MidiTrack, Message
from collections import defaultdict

def parse_midi(midi_path):
    """Extract notes and timing from MIDI file with validation"""
    try:
        mid = MidiFile(midi_path)
        notes = []
        tempos = []
        ticks_per_beat = mid.ticks_per_beat
        current_time = 0
        
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
        
        print(f"Parsed {len(notes)} notes from MIDI file")
        return notes, ticks_per_beat, tempos
    except Exception as e:
        print(f"Error parsing MIDI: {str(e)}")
        exit(1)

def build_adaptive_model(notes, max_order=3):
    """Build variable-order Markov model"""
    model = defaultdict(lambda: defaultdict(int))
    note_sequence = [n['note'] for n in notes]
    
    # Determine safe maximum order based on input length
    safe_max_order = min(max_order, len(note_sequence)-1)
    if safe_max_order < 1:
        safe_max_order = 1
    
    print(f"Using adaptive Markov order up to {safe_max_order}")
    
    # Build multi-order model
    for order in range(1, safe_max_order+1):
        for i in range(len(note_sequence)-order):
            state = tuple(note_sequence[i:i+order])
            next_note = note_sequence[i+order]
            model[state][next_note] += 1
    
    return model, safe_max_order

def generate_safe_continuation(model, last_notes, length=50, max_order=3, all_notes=[]):
    """Generate continuation with fallback strategies"""
    continuation = []
    current_state = tuple(last_notes[-max_order:])  # Start with max order
    
    for _ in range(length):
        # Try progressively smaller orders
        for order in range(len(current_state), 0, -1):
            state = current_state[-order:] if order > 0 else tuple()
            if state in model:
                probabilities = list(model[state].values())
                total = sum(probabilities)
                if total > 0:
                    notes = list(model[state].keys())
                    probs = [p/total for p in probabilities]
                    next_note = np.random.choice(notes, p=probs)
                    continuation.append(next_note)
                    current_state = (*current_state, next_note)[-max_order:]
                    break
        else:  # Fallback if no states found
            next_note = np.random.choice(all_notes) if all_notes else 60  # Middle C
            continuation.append(next_note)
            current_state = (*current_state, next_note)[-max_order:]
    
    return continuation

def save_midi(original_notes, new_notes, ticks_per_beat, tempos, output_path):
    """Save MIDI file with error handling"""
    try:
        mid = MidiFile(ticks_per_beat=ticks_per_beat)
        track = MidiTrack()
        mid.tracks.append(track)
        
        # Add tempo events
        for tempo in tempos:
            track.append(tempo)
        
        # Combine notes
        last_time = max(n['time'] for n in original_notes) if original_notes else 0
        all_notes = original_notes.copy()
        
        for i, note in enumerate(new_notes):
            all_notes.append({
                'note': note,
                'time': last_time + (i+1)*ticks_per_beat,
                'velocity': 64
            })
        
        # Create messages
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
        print(f"Successfully saved {len(new_notes)} new notes to {output_path}")
    except Exception as e:
        print(f"Error saving MIDI: {str(e)}")
        exit(1)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='MIDI Continuation for Small Files')
    parser.add_argument('input', help='Input MIDI file')
    parser.add_argument('output', help='Output MIDI file')
    parser.add_argument('--length', type=int, default=50, 
                       help='Notes to generate (default: 50)')
    parser.add_argument('--max_order', type=int, default=3,
                       help='Maximum Markov order (default: 3)')
    
    args = parser.parse_args()
    
    # Process MIDI
    notes, ticks, tempos = parse_midi(args.input)
    
    if not notes:
        print("Error: No notes found in input file")
        exit(1)
    
    # Build adaptive model
    model, actual_order = build_adaptive_model(notes, args.max_order)
    all_notes = [n['note'] for n in notes]
    
    # Generate continuation
    last_original = [n['note'] for n in notes[-actual_order:]]
    new_notes = generate_safe_continuation(
        model, 
        last_original,
        args.length,
        actual_order,
        all_notes
    )
    
    # Save result
    save_midi(notes, new_notes, ticks, tempos, args.output)