import SoapySDR
from SoapySDR import * # SOAPY_SDR_ constants
import numpy as np
import sys, time

# Device setup (example: LimeSDR or RTL-SDR)
args = dict(driver="rtlsdr")
sdr = SoapySDR.Device(args)
sdr.setSampleRate(SOAPY_SDR_RX, 0, 2e6)
sdr.setFrequency(SOAPY_SDR_RX, 0, 99.9e6)
sdr.setGain(SOAPY_SDR_RX, 0, 30)

rxStream = sdr.setupStream(SOAPY_SDR_RX, SOAPY_SDR_CF32)
sdr.activateStream(rxStream)

buff = np.array([0]*1024, np.complex64)

while True:
    sr = sdr.readStream(rxStream, [buff], len(buff))
    iq = buff.tobytes()  # Convert to bytes
    sys.stdout.buffer.write(iq)
    sys.stdout.flush()
