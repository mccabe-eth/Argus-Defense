git clone https://github.com/pothosware/SoapySDR.git
cd SoapySDR
brew install soapysdr
brew install soapyrtlsdr
brew install cmake swig python3 pkg-config
mkdir build && cd build
cmake .. -DPYTHON_EXECUTABLE=$(which python3)
make
sudo make install