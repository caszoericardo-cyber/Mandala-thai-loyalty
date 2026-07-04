let html5QrCode = null;
let isScanning = false;
let currentAction = 'view';
let lastScannedData = null;

// Opciones del escáner
const qrConfig = {
    fps: 10,
    qrbox: { width: 250, height: 250 },
    aspectRatio: 1.0,
    formatsToSupport: [
        window.html5QrCode?.Html5QrcodeSupportedFormats?.QR_CODE,
        window.html5QrCode?.Html5QrcodeSupportedFormats?.AZTEC,
        window.html5QrCode?.Html5QrcodeSupportedFormats?.CODABAR,
        window.html5QrCode?.Html5QrcodeSupportedFormats?.CODE_39,
        window.html5QrCode?.Html5QrcodeSupportedFormats?.CODE_93,
        window.html5QrCode?.Html5QrcodeSupportedFormats?.CODE_128,
        window.html5QrCode?.Html5QrcodeSupportedFormats?.DATA_MATRIX,
        window.html5QrCode?.Html5QrcodeSupportedFormats?.MAXICODE,
        window.html5QrCode?.Html5QrcodeSupportedFormats?.ITF,
        window.html5QrCode?.Html5QrcodeSupportedFormats?.EAN_13,
        window.html5QrCode?.Html5QrcodeSupportedFormats?.EAN_8,
        window.html5QrCode?.Html5QrcodeSupportedFormats?.PDF417,
        window.html5QrCode?.Html5QrcodeSupportedFormats?.RSS_14,
        window.html5QrCode?.Html5QrcodeSupportedFormats?.RSS_EXPANDED,
        window.html5QrCode?.Html5QrcodeSupportedFormats?.UPC_A,
        window.html5QrCode?.Html5QrcodeSupportedFormats?.UPC_E
    ]
};

function startScanner() {
    if (isScanning) {
        showFlash('El escáner ya está activo', 'info');
        return;
    }

    // Verificar soporte de cámara
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showError('❌ Tu navegador no soporta acceso a la cámara');
        return;
    }

    const readerElement = document.getElementById('qr-reader');
    readerElement.style.display = 'block';
    document.getElementById('qrContainer').style.display = 'block';

    const lloader = document.getElementById("qr-loader");
    if (lloader) {
        lloader.classList.add("qr-loader-active");
    }


    try {
        html5QrCode = new Html5Qrcode("qr-reader");

        html5QrCode.start(
            { facingMode: "environment" }, // Usar cámara trasera
            qrConfig,
            onScanSuccess,
            onScanError
        ).then(() => {
            isScanning = true;
            const lloader = document.getElementById("qr-loader");
            if (lloader) {
                lloader.classList.remove("qr-loader-active");
            }
            showFlash('✅ Escáner iniciado. Apunta a un código QR.');
        }).catch(err => {
            console.error('Error al iniciar el escáner:', err);
            showError('❌ Error al acceder a la cámara: ' + err.message);
            readerElement.style.display = 'none';
            document.getElementById('qrContainer').style.display = 'none';
        });

    } catch (error) {
        console.error('Error:', error);
        showError('❌ Error al iniciar el escáner: ' + error.message);
    }
}

function stopScanner() {
    if (html5QrCode && isScanning) {
        html5QrCode.stop()
            .then(() => {
                isScanning = false;
                document.getElementById('qr-reader').style.display = 'none';
                document.getElementById('qrContainer').style.display = 'none';
                showFlash('⏹️ Escáner detenido');
            })
            .catch(err => {
                console.error('Error al detener:', err);
            });
    } else {
        showFlash('El escáner no está activo');
    }
}

function onScanSuccess(decodedText, decodedResult) {
    // Evitar múltiples escaneos del mismo código
    if (lastScannedData === decodedText) {
        return;
    }
    lastScannedData = decodedText;

    // Vibrar si es posible
    if (navigator.vibrate) {
        navigator.vibrate(200);
    }

    // Reproducir sonido (opcional)
    playBeep();

    // Procesar el código QR
    processQRData(decodedText);
}

function onScanError(errorMessage) {
    // No mostrar errores de escaneo (son normales)
    console.debug('Error de escaneo:', errorMessage);
}

function processQRData(data) {
    // Mostrar resultado
    const resultDiv = document.getElementById('result');

    // Intentar parsear como JSON
    let parsedData = null;
    try {
        parsedData = JSON.parse(data);
        handleViewClient(parsedData);
    } catch (e) {
        // Si no es JSON, tratar como texto plano
        parsedData = { data: data };
        handleViewClient(parsedData);
    }

    resultDiv.className = 'result-box success';
    resultDiv.innerHTML = `
                <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                    <div style="flex:1;">
                        <div style="font-size:12px;color:#7a6a55;font-weight:700;">📌 DATO ESCANEADO</div>
                        <div style="font-size:16px;font-weight:700;color:#0d5c52;word-break:break-all;margin:8px 0;">${data}</div>
                        <div style="font-size:12px;color:#7a6a55;">
                            ⏱️ ${new Date().toLocaleTimeString()}
                        </div>
                    </div>
                    <button class="btn btn-primary btn-small" onclick="copyToClipboard('${data}')">📋 Copiar</button>
                </div>
                <div id="actionResult" style="margin-top:12px;padding-top:12px;border-top:1px solid rgba(13,92,82,0.1);">
                    <div class="flash-info">👤 Buscando cliente...</div>
                </div>
            `;

    setTimeout(() => {
        lastScannedData = null;
    }, 1000);

    stopScanner();
}

async function handleViewClient(data) {

    console.log("Scanned DATA", data);

    try {
        const clientId = data.clientId || data.id || data;
        if (!clientId) {
            showError('❌ No se encontró ID de cliente en el QR');
            return;
        }

        goToClientFromScan(clientId);
    } catch (error) {
        showError('❌ Error buscando cliente: ' + error.message);
    }
}

function playBeep() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        gainNode.gain.value = 0.1;

        oscillator.start();
        setTimeout(() => {
            oscillator.stop();
            audioContext.close();
        }, 200);
    } catch (e) {
        // Silenciar error si no soporta audio
    }
}

function generateQR(clientId) {
    if (!clientId) {
        alert('Error: No se pudo generar el Código QR para el cliente.');
        return;
    }

    // Datos que se codificarán en el QR
    const qrData = JSON.stringify({
        clientId: clientId,
        timestamp: new Date().toISOString()
    });

    // Usar API de Google Charts para generar QR
    //const qrUrl = `https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=${encodeURIComponent(qrData)}&choe=UTF-8`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrData)}&amp;size=300x300`;

    const container = document.getElementById('qrCodeContainer');
    container.innerHTML = `<img src="${qrUrl}" alt="QR Code para ${clientId}" id="qrImage">`;

    //showError('✅ QR generado para ' + clientId);
}

function downloadQR() {
    const img = document.getElementById('qrImage');
    if (!img) return;

    const link = document.createElement('a');
    link.download = `qr-${document.getElementById('clientIdInput').value.trim()}.png`;
    link.href = img.src;
    link.click();
}