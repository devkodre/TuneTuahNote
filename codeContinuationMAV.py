import argparse
import numpy as np
from scipy.io import wavfile
import mido
from mido import MidiFile, MidiTrack, Message, MetaMessage
from collections import defaultdict

# ===================== MIDI PROCESSING =====================
def parse_midi(midi_path):
    """Extract notes with proper timing"""
    mid = MidiFile(midi_path)
    notes = []
    tempos = []
    ticks_per_beat = mid.ticks_per_beat
    abs_time = 0  # Absolute time in ticks
    
    for track in mid.tracks:
        for msg in track:
            abs_time += msg.time
            if msg.type == 'set_tempo':
                tempos.append(msg)
            if msg.type == 'note_on' and msg.velocity > 0:
                notes.append({
                    'note': msg.note,
                    'start': abs_time,
                    'end': None,
                    'velocity': msg.velocity
                })
            elif msg.type in ['note_off', 'note_on'] and msg.velocity == 0:
                for note in notes:
                    if note['note'] == msg.note and note['end'] is None:
                        note['end'] = abs_time
                        break
    # Filter out incomplete notes
    notes = [n for n in notes if n['end'] is not None]
    return notes, ticks_per_beat, tempos

# ===================== MARKOV MODEL =====================
def build_markov_model(notes, order=2):
    model = defaultdict(list)
    for i in range(len(notes)-order):
        state = tuple(notes[i+j]['note'] for j in range(order))
        next_note = notes[i+order]['note']
        model[state].append(next_note)
    return model

def generate_continuation(model, last_notes, length=50):
    current_state = tuple(last_notes)
    continuation = []
    for _ in range(length):
        if current_state not in model:
            current_state = current_state[1:] if len(current_state) > 1 else ()
            if not current_state: break
        next_note = np.random.choice(model[current_state])
        continuation.append(next_note)
        current_state = tuple(list(current_state[1:]) + [next_note])
    return continuation

# ===================== MIDI GENERATION =====================
def save_midi(original_notes, new_notes, ticks_per_beat, tempos, output_path):
    """Save MIDI with proper event timing"""
    mid = MidiFile(ticks_per_beat=ticks_per_beat)
    track = MidiTrack()
    mid.tracks.append(track)
    
    # Add tempo events
    for tempo in tempos:
        track.append(tempo)
    
    # Create events list
    events = []
    
    # Add original notes
    for note in original_notes:
        events.append({'type': 'note_on', 'note': note['note'], 
                      'time': note['start'], 'velocity': note['velocity']})
        events.append({'type': 'note_off', 'note': note['note'], 
                      'time': note['end'], 'velocity': 0})
    
    # Add new notes (start after original)
    last_time = max(n['end'] for n in original_notes) if original_notes else 0
    for i, note in enumerate(new_notes):
        start = last_time + (i * ticks_per_beat)
        end = start + ticks_per_beat
        events.append({'type': 'note_on', 'note': note, 'time': start, 'velocity': 64})
        events.append({'type': 'note_off', 'note': note, 'time': end, 'velocity': 0})
    
    # Sort events by time
    events.sort(key=lambda x: x['time'])
    
    # Convert to delta times
    prev_time = 0
    for event in events:
        delta = event['time'] - prev_time
        track.append(Message(event['type'], note=event['note'], 
                    velocity=event['velocity'], time=delta))
        prev_time = event['time']
    
    mid.save(output_path)

# ===================== WAV CONVERSION =====================
def midi_to_wav(midi_path, wav_path, sample_rate=44100):
    """Convert MIDI to WAV using basic synthesis"""
    mid = MidiFile(midi_path)
    audio = np.zeros(int(mid.length * sample_rate * 1.2))  # 20% padding
    
    for track in mid.tracks:
        current_time = 0.0  # Time in seconds
        active_notes = {}
        
        for msg in track:
            # Convert delta time to seconds
            delta_seconds = mido.tick2second(msg.time, mid.ticks_per_beat, 500000)
            current_time += delta_seconds
            
            if msg.type == 'note_on' and msg.velocity > 0:
                freq = 440.0 * (2 ** ((msg.note - 69) / 12))
                start_sample = int(current_time * sample_rate)
                active_notes[msg.note] = (start_sample, freq)
                
            elif msg.type in ['note_off', 'note_on'] and msg.velocity == 0:
                if msg.note in active_notes:
                    start_sample, freq = active_notes.pop(msg.note)
                    duration = current_time - (start_sample / sample_rate)
                    
                    if duration > 0:
                        t = np.linspace(0, duration, int(sample_rate * duration))
                        wave = 0.3 * np.sin(2 * np.pi * freq * t)
                        end_sample = start_sample + len(wave)
                        
                        if end_sample > len(audio):
                            audio = np.pad(audio, (0, end_sample - len(audio)))
                        
                        audio[start_sample:end_sample] += wave

    # Normalize and save
    audio /= np.max(np.abs(audio))
    wavfile.write(wav_path, sample_rate, (audio * 32767).astype(np.int16))

# ===================== MAIN WORKFLOW =====================
def main():
    parser = argparse.ArgumentParser(description='MIDI Melody Continuation')
    parser.add_argument('input', help='Input MIDI file')
    parser.add_argument('output', help='Output base name')
    parser.add_argument('--length', type=int, default=50)
    parser.add_argument('--order', type=int, default=2)
    
    args = parser.parse_args()
    
    notes, ticks, tempos = parse_midi(args.input)
    if not notes:
        print("Error: No notes found")
        exit(1)
    
    model = build_markov_model(notes, args.order)
    new_notes = generate_continuation(model, [n['note'] for n in notes[-args.order:]], args.length)
    
    midi_out = f"{args.output}.mid"
    save_midi(notes, new_notes, ticks, tempos, midi_out)
    
    wav_out = f"{args.output}.wav"
    midi_to_wav(midi_out, wav_out)
    
    print(f"Success! Created {midi_out} and {wav_out}")

if __name__ == "__main__":
    main()