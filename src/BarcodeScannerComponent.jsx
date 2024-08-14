import React, { useEffect, useRef, useState } from 'react';
import Quagga from 'quagga';

const BarcodeScannerComponent = () => {
    const [scanning, setScanning] = useState(false);
    const videoRef = useRef(null);
    const [permissionGranted, setPermissionGranted] = useState(false);

    useEffect(() => {
        if (scanning && permissionGranted) {
            Quagga.init(
                {
                    inputStream: {
                        type: 'LiveStream',
                        target: videoRef.current,
                        constraints: {
                            facingMode: 'environment',
                        },
                    },
                    decoder: {
                        readers: [
                            'code_128_reader',
                            'ean_reader',
                            'ean_8_reader',
                            'code_39_reader',
                            'code_39_vin_reader',
                            'codabar_reader',
                            'upc_reader',
                            'upc_e_reader',
                            'i2of5_reader',
                            '2of5_reader',
                            'code_93_reader',
                        ],
                    },
                },
                (err) => {
                    if (err) {
                        console.error('Error al inicializar Quagga:', err);
                        return;
                    }
                    Quagga.start();
                }
            );

            Quagga.onDetected(handleDetected);
        }

        // Cleanup function to stop Quagga and remove event listeners
        return () => {
            if (scanning) {
                Quagga.stop();
                Quagga.offDetected(handleDetected);
            }
        };
    }, [scanning, permissionGranted]);

    const handleDetected = (result) => {
        alert(`Código de barras detectado: ${result.codeResult.code}`);
        setScanning(false);
    };

    const requestPermission = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
            });
            setPermissionGranted(true);
            // Detener el stream una vez que se han otorgado los permisos
            stream.getTracks().forEach((track) => track.stop());
        } catch (error) {
            console.error('Permiso de cámara denegado:', error);
        }
    };

    const handleStartScanning = async () => {
        if (!permissionGranted) {
            await requestPermission();
        }
        setScanning(true);
    };

    return (
        <div>
            <button onClick={() => setScanning(false)}>Detener Escaneo</button>
            <button onClick={handleStartScanning}>Iniciar Escaneo</button>
            <div ref={videoRef} style={{ width: '100%', height: '400px' }}></div>
        </div>
    );
};

export default BarcodeScannerComponent;
