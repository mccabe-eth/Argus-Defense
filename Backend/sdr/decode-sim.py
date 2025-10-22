#!/usr/bin/env python3
import numpy as np
import matplotlib.pyplot as plt
import sys

# Read IQ samples from stdin or file
if len(sys.argv) > 1:
    with open(sys.argv[1], 'rb') as f:
        iq_bytes = f.read()
else:
    iq_bytes = sys.stdin.buffer.read()

# Convert bytes back to complex samples
iq = np.frombuffer(iq_bytes, dtype=np.complex64)
sample_rate = 2e6  # Must match the generator

print(f"Loaded {len(iq)} samples ({len(iq)/sample_rate:.2f} seconds)")

# Analysis
print(f"\nSignal Statistics:")
print(f"  Mean amplitude: {np.mean(np.abs(iq)):.4f}")
print(f"  Max amplitude: {np.max(np.abs(iq)):.4f}")
print(f"  Power: {np.mean(np.abs(iq)**2):.4f}")

# FFT to find the tone frequency
fft_size = 8192
fft_result = np.fft.fft(iq[:fft_size])
fft_freq = np.fft.fftfreq(fft_size, 1/sample_rate)
fft_mag = np.abs(fft_result)

# Find peak frequency
peak_idx = np.argmax(fft_mag)
detected_freq = fft_freq[peak_idx]
print(f"\nDetected tone frequency: {detected_freq/1e3:.2f} kHz")

# Plot
fig, axes = plt.subplots(3, 1, figsize=(12, 10))

# Time domain
samples_to_plot = min(1000, len(iq))
axes[0].plot(np.real(iq[:samples_to_plot]), label='I (Real)', alpha=0.7)
axes[0].plot(np.imag(iq[:samples_to_plot]), label='Q (Imaginary)', alpha=0.7)
axes[0].set_xlabel('Sample')
axes[0].set_ylabel('Amplitude')
axes[0].set_title('Time Domain - I/Q Components')
axes[0].legend()
axes[0].grid(True)

# Constellation diagram
axes[1].scatter(np.real(iq[::100]), np.imag(iq[::100]), alpha=0.1, s=1)
axes[1].set_xlabel('I (In-phase)')
axes[1].set_ylabel('Q (Quadrature)')
axes[1].set_title('Constellation Diagram')
axes[1].axis('equal')
axes[1].grid(True)

# Frequency domain (spectrum)
axes[2].plot(fft_freq[:fft_size//2]/1e3, 20*np.log10(fft_mag[:fft_size//2]))
axes[2].set_xlabel('Frequency (kHz)')
axes[2].set_ylabel('Magnitude (dB)')
axes[2].set_title('Frequency Spectrum')
axes[2].grid(True)
axes[2].axvline(detected_freq/1e3, color='r', linestyle='--', label=f'Peak: {detected_freq/1e3:.2f} kHz')
axes[2].legend()

plt.tight_layout()
plt.savefig('decoded_signal.png', dpi=150)
print("\nPlot saved to decoded_signal.png")
# plt.show()  # Comment out to avoid GUI popup
