git clone https://github.com/pothosware/SoapySDR.git ./SoapySDR && cd SoapySDR
brew install soapyrtlsdr cmake swig pkg-config
mkdir build && cd build
cmake .. \              
  -DPYTHON_EXECUTABLE=$(pyenv which python) \
  -DPython3_EXECUTABLE=$(pyenv which python) \
  -DPython3_FIND_STRATEGY=LOCATION \
  -DPython3_FIND_IMPLEMENTATIONS=CPython \
  -DPython3_FIND_VIRTUALENV=FIRST
make
make install
echo "/usr/local/lib/python3.11/site-packages" > venv/lib/python3.11/site-packages/_soapy_link.pth
sudo mkdir -p /usr/local/lib/SoapySDR/modules0.8-3
sudo ln -s /usr/local/Cellar/soapyrtlsdr/0.3.3_2/lib/SoapySDR/modules0.8/librtlsdrSupport.so /usr/local/lib/SoapySDR/modules0.8-3/librtlsdrSupport.so
