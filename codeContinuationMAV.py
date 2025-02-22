import argparse
import numpy as np
from scipy.io import wavfile
import mido
from mido import MidiFile, MidiTrack, Message, MetaMessage
from collections import defaultdict

# MIDI Processing Functions
def parse_midi(midi_path):
    """Extract notes, tempo, and timing from MIDI file"""
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
                    'start': current_time,
                    'duration': 0,
                    'velocity': msg.velocity
                })
            elif msg.type in ['note_off', 'note_on']:
                for note in notes:
                    if note['note'] == msg.note and note['duration'] == 0:
                        note['duration'] = current_time - note['start']
                        break
    return notes, ticks_per_beat, tempos

# Markov Model Functions
def build_markov_model(notes, order=2):
    """Create Markov transition model from note sequence"""
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
            current_state = current_state[1:] if len(current_state) > 1 else ()
            if not current_state:
                break
        next_note = np.random.choice(model[current_state])
        continuation.append(next_note)
        current_state = tuple(list(current_state[1:]) + [next_note])
    return continuation

# MIDI Generation Functions
def save_midi(original_notes, new_notes, ticks_per_beat, tempos, output_path):
    """Save combined MIDI file with original and new notes"""
    mid = MidiFile(ticks_per_beat=ticks_per_beat)
    track = MidiTrack()
    mid.tracks.append(track)
    
    # Add tempo events
    for tempo in tempos:
        track.append(tempo)
    
    # Combine notes
    last_time = max(n['start'] + n['duration'] for n in original_notes) if original_notes else 0
    all_notes = original_notes.copy()
    
    # Add new notes with timing
    for i, note in enumerate(new_notes):
        all_notes.append({
            'note': note,
            'start': last_time + (i * ticks_per_beat),
            'duration': ticks_per_beat // 2,
            'velocity': 64
        })
    
    # Convert to MIDI messages
    all_notes.sort(key=lambda x: x['start'])
    current_time = 0
    
    for note in all_notes:
        delta = note['start'] - current_time
        track.append(Message('note_on', note=note['note'], 
                           velocity=note['velocity'], time=delta))
        track.append(Message('note_off', note=note['note'], 
                           velocity=0, time=note['duration']))
        current_time = note['start'] + note['duration']
    
    mid.save(output_path)

# WAV Conversion Functions
def midi_to_wav(midi_path, wav_path, sample_rate=44100):
    """Convert MIDI to WAV using basic sine wave synthesis"""
    mid = MidiFile(midi_path)
    audio = np.zeros(int(mid.length * sample_rate * 1.1))  # Buffer with 10% padding
    
    for track in mid.tracks:
        current_time = 0.0
        active_notes = {}
        
        for msg in track:
            # Convert delta time from ticks to seconds
            delta_seconds = mido.tick2second(msg.time, mid.ticks_per_beat, 500000)
            current_time += delta_seconds
            
            if msg.type == 'note_on' and msg.velocity > 0:
                # Calculate frequency and start time
                freq = 440.0 * (2 ** ((msg.note - 69) / 12))
                start_sample = int(current_time * sample_rate)
                active_notes[msg.note] = (start_sample, freq)
                
            elif msg.type in ['note_off', 'note_on'] and msg.velocity == 0:
                if msg.note in active_notes:
                    start_sample, freq = active_notes.pop(msg.note)
                    duration = current_time - (start_sample / sample_rate)
                    
                    if duration > 0:
                        # Generate sine wave
                        t = np.linspace(0, duration, int(sample_rate * duration))
                        wave = 0.3 * np.sin(2 * np.pi * freq * t)
                        
                        # Add to audio buffer
                        end_sample = start_sample + len(wave)
                        if end_sample > len(audio):
                            audio = np.pad(audio, (0, end_sample - len(audio)))
                        audio[start_sample:end_sample] += wave

    # Normalize and save
    audio /= np.max(np.abs(audio))
    wavfile.write(wav_path, sample_rate, (audio * 32767).astype(np.int16))

# Main Workflow
def main():
    parser = argparse.ArgumentParser(description='MIDI Melody Continuation with WAV Conversion')
    parser.add_argument('input', help='Input MIDI file')
    parser.add_argument('output', help='Output base name (no extension)')
    parser.add_argument('--length', type=int, default=50, help='Number of notes to generate')
    parser.add_argument('--order', type=int, default=2, help='Markov chain order')
    
    args = parser.parse_args()
    
    # Process MIDI
    notes, ticks, tempos = parse_midi(args.input)
    if not notes:
        print("Error: No notes found in input file")
        return
    
    # Build model and generate
    model = build_markov_model(notes, args.order)
    last_original = [n['note'] for n in notes[-args.order:]]
    new_notes = generate_continuation(model, last_original, args.length)
    
    # Save MIDI
    midi_output = f"{args.output}.mid"
    save_midi(notes, new_notes, ticks, tempos, midi_output)
    
    # Convert to WAV
    wav_output = f"{args.output}.wav"
    midi_to_wav(midi_output, wav_output)
    
    print(f"Created:\n- {midi_output}\n- {wav_output}")

if __name__ == "__main__":
    main()