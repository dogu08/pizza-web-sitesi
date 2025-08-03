// Thermal Printer Entegrasyonu (ESC/POS)
function setupPrinterIntegration() {
    // Yazıcı ayarları
    const printerConfig = {
        ipAddress: '192.168.1.100', // Yazıcı IP adresi
        port: 9100, // Standart ESC/POS port
        charset: 'ISO-8859-9', // Türkçe karakter desteği
        timeout: 5000 // 5 saniye timeout
    };

    // Yazıcıya bağlan ve veri gönder
    async function sendToPrinter(data) {
        try {
            // WebSocket veya TCP üzerinden bağlantı
            const socket = new WebSocket(`ws://${printerConfig.ipAddress}:${printerConfig.port}`);
            
            // Bağlantı açıldığında
            socket.onopen = function() {
                // ESC/POS komutları
                const initCommands = [
                    '\x1B\x40', // Initialize printer
                    '\x1B\x52\x08', // Character set Turkey
                    '\x1B\x74\x08' // Code page Turkey
                ].join('');
                
                // Veriyi gönder
                socket.send(initCommands + data);
                
                // Bağlantıyı kapat
                setTimeout(() => socket.close(), 1000);
            };
            
            // Hata durumunda
            socket.onerror = function(error) {
                console.error('Yazıcı hatası:', error);
                // Fallback: Sunucu üzerinden yazdırma
                fallbackPrint(data);
            };
            
        } catch (error) {
            console.error('Yazıcı bağlantı hatası:', error);
            fallbackPrint(data);
        }
    }

    // Sunucu üzerinden yazdırma fallback'i
    function fallbackPrint(data) {
        fetch('/api/print', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                printerData: data,
                printerConfig: printerConfig 
            })
        })
        .then(response => {
            if (!response.ok) throw new Error('Yazdırma başarısız');
            console.log('Sunucu üzerinden yazdırma başarılı');
        })
        .catch(error => {
            console.error('Fallback yazdırma hatası:', error);
            alert('Yazıcıya bağlanılamadı! Lütfen personeli bilgilendirin.');
        });
    }

    return { sendToPrinter };
}

// Kullanım örneği:
// const printer = setupPrinterIntegration();
// printer.sendToPrinter(printerData);