import numpy as np
import sys
import time

sample_rate = 2e6
freq = 99.9e6
amplitude = 0.5
tone_freq = 1e3
duration = 10

num_samples = int(sample_rate * duration)
t = np.arange(num_samples) / sample_rate
iq = amplitude * np.exp(2j * np.pi * tone_freq * t)

iq_bytes = iq.astype(np.complex64).tobytes()
sys.stdout.buffer.write(iq_bytes)
sys.stdout.flush()
