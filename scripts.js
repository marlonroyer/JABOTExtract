// ============================================
// JABOT Extract - Versão Híbrida Profissional
// Preserva a lógica original 100% funcional
// ============================================

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js';

// Estado Global
const state = {
    pdfDoc: null,
    allBarcodes: [],
    processingStartTime: null,
    processingTimer: null
};

// Elementos DOM
const elements = {
    pdfInput: document.getElementById('pdfInput'),
    dropZone: document.getElementById('dropZone'),
    fileSelected: document.getElementById('fileSelected'),
    fileName: document.getElementById('fileName'),
    uploadCard: document.getElementById('uploadCard'),
    configCard: document.getElementById('configCard'),
    pagesCard: document.getElementById('pagesCard'),
    progressCard: document.getElementById('progressCard'),
    resultsCard: document.getElementById('resultsCard'),
    pageCheckboxes: document.getElementById('pageCheckboxes'),
    pageCount: document.getElementById('pageCount'),
    progressText: document.getElementById('progressText'),
    progressFill: document.getElementById('progressFill'),
    progressDetail: document.getElementById('progressDetail'),
    imageContainer: document.getElementById('imageContainer'),
    emptyResults: document.getElementById('emptyResults'),
    downloadAllBtn: document.getElementById('downloadAll'),
    downloadAllContainer: document.getElementById('downloadAllContainer'),
    processingStats: document.getElementById('processingStats'),
    readCount: document.getElementById('readCount'),
    unreadCount: document.getElementById('unreadCount'),
    elapsedTime: document.getElementById('elapsedTime')
};

// ============================================
// Inicialização
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
});

function setupEventListeners() {
    // Upload de arquivo tradicional
    elements.pdfInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file && file.type === 'application/pdf') {
            handleFileSelect(file);
        } else {
            alert('Por favor, selecione um arquivo PDF válido.');
        }
    });
    
    // Drag and Drop
    if (elements.dropZone) {
        elements.dropZone.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.classList.add('drag-over');
        });
        
        elements.dropZone.addEventListener('dragleave', function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.classList.remove('drag-over');
        });
        
        elements.dropZone.addEventListener('drop', function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.classList.remove('drag-over');
            
            const file = e.dataTransfer.files[0];
            if (file) handleFileSelect(file);
        });
        
        elements.dropZone.addEventListener('click', function() {
            elements.pdfInput.click();
        });
    }
    
    // Download All
    if (elements.downloadAllBtn) {
        elements.downloadAllBtn.addEventListener('click', handleDownloadAll);
    }
}

function handleFileSelect(file) {
    console.log('PDF carregado:', file.name);
    
    // Mostrar arquivo selecionado
    if (elements.dropZone) elements.dropZone.style.display = 'none';
    if (elements.fileSelected) {
        elements.fileSelected.style.display = 'flex';
        elements.fileName.textContent = file.name;
    }
    
    const fileReader = new FileReader();
    fileReader.onload = function() {
        const typedArray = new Uint8Array(this.result);
        loadPDF(typedArray);
    };
    fileReader.onerror = function(error) {
        console.error('Erro ao ler arquivo:', error);
        alert('Erro ao carregar o arquivo PDF');
    };
    fileReader.readAsArrayBuffer(file);
}

// ============================================
// Carregamento do PDF (LÓGICA ORIGINAL)
// ============================================
function loadPDF(data) {
    console.log('Iniciando carregamento do PDF...');
    const loadingTask = pdfjsLib.getDocument({ data });
    
    loadingTask.promise.then(function(pdf) {
        console.log('PDF carregado com sucesso. Total de páginas:', pdf.numPages);
        state.pdfDoc = pdf;
        showPageSelection(pdf.numPages);
    }).catch(function(error) {
        console.error('Erro ao carregar o PDF:', error);
        alert('Erro ao carregar o PDF: ' + error.message);
    });
}

function showPageSelection(totalPages) {
    const pageCheckboxes = elements.pageCheckboxes;
    pageCheckboxes.innerHTML = '';
    
    for (let i = 1; i <= totalPages; i++) {
        const label = document.createElement('label');
        label.innerHTML = `<input type="checkbox" name="page" value="${i}" checked> Página ${i}`;
        pageCheckboxes.appendChild(label);
    }
    
    // Mostrar cards
    if (elements.configCard) elements.configCard.style.display = 'block';
    if (elements.pagesCard) elements.pagesCard.style.display = 'block';
    if (elements.pageCount) elements.pageCount.textContent = `${totalPages} páginas`;
    
    // Configurar botão de processamento
    const processBtn = document.getElementById('processPages');
    if (processBtn) {
        const newBtn = processBtn.cloneNode(true);
        processBtn.parentNode.replaceChild(newBtn, processBtn);
        
        newBtn.addEventListener('click', function() {
            const selectedPages = [];
            document.querySelectorAll('input[name="page"]:checked').forEach(function(checkbox) {
                selectedPages.push(parseInt(checkbox.value));
            });
            
            if (selectedPages.length === 0) {
                alert('Por favor, selecione pelo menos uma página.');
                return;
            }
            
            console.log('Páginas selecionadas:', selectedPages);
            processSelectedPages(selectedPages);
        });
    }
}

// ============================================
// Processamento (LÓGICA ORIGINAL - 100% FUNCIONAL)
// ============================================
async function processSelectedPages(pages) {
    console.log('Iniciando processamento das páginas:', pages);
    
    // Resetar estado
    state.allBarcodes = [];
    state.processingStartTime = Date.now();
    
    // Mostrar cards de progresso e resultados
    if (elements.progressCard) elements.progressCard.style.display = 'block';
    if (elements.resultsCard) elements.resultsCard.style.display = 'block';
    if (elements.processingStats) elements.processingStats.style.display = 'none';
    
    const imageContainer = elements.imageContainer;
    imageContainer.innerHTML = '';
    if (elements.emptyResults) elements.emptyResults.style.display = 'none';
    
    const progressBar = document.getElementById('progressBar');
    const progressText = elements.progressText;
    const progressFill = elements.progressFill;
    
    if (progressBar) progressBar.value = 0;
    if (progressText) progressText.textContent = '0%';
    
    let imageCounter = 1;
    let totalRead = 0;
    let totalUnread = 0;
    
    // Iniciar timer
    if (elements.processingTimer) clearInterval(elements.processingTimer);
    elements.processingTimer = setInterval(updateElapsedTime, 1000);
    
    try {
        for (let i = 0; i < pages.length; i++) {
            const pageNumber = pages[i];
            console.log(`Processando página ${pageNumber}...`);
            
            try {
                const page = await state.pdfDoc.getPage(pageNumber);
                const viewport = page.getViewport({ scale: 9.0 });
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                
                console.log(`Renderizando página ${pageNumber}...`);
                await page.render({
                    canvasContext: context,
                    viewport: viewport
                }).promise;
                
                console.log(`Extraindo códigos de barras da página ${pageNumber}...`);
                const barcodes = extractBarcodes(canvas, 44);
                console.log(`Encontrados ${barcodes.length} códigos de barras`);
                
                // Processa cada código de barras (LÓGICA ORIGINAL)
                for (let j = 0; j < barcodes.length; j++) {
                    const barcode = barcodes[j];
                    
                    // Cria container imediatamente (sem esperar pela leitura)
                    const container = document.createElement('div');
                    container.className = 'result-item';
                    
                    const barcodeWrapper = document.createElement('div');
                    barcodeWrapper.className = 'barcode-wrapper barcode-unread';
                    barcodeWrapper.appendChild(barcode);
                    container.appendChild(barcodeWrapper);
                    
                    const infoText = document.createElement('div');
                    infoText.className = 'barcode-info';
                    infoText.innerHTML = 'Lendo código...';
                    container.appendChild(infoText);
                    
                    const downloadButton = document.createElement('button');
                    downloadButton.className = 'btn btn-sm download-btn';
                    downloadButton.innerText = 'Baixar';
                    downloadButton.style.display = 'none';
                    container.appendChild(downloadButton);
                    
                    imageContainer.appendChild(container);
                    
                    // Tenta ler o código de barras
                    try {
                        // Primeiro tenta o Quagga (rápido)
                        const barcodeText = await readBarcodeFromImage(barcode);
                        console.log(`Código ${j + 1} (Quagga):`, barcodeText || 'Não lido');
                        
                        let fileName;
                        let finalText = barcodeText;
                        
                        // Se o Quagga não leu, tenta o Tesseract (OCR)
                        if (!finalText) {
                            infoText.innerHTML = 'Lendo com OCR...';
                            const ocrText = await readTextWithOCR(barcode);
                            console.log(`Código ${j + 1} (OCR):`, ocrText || 'Não lido');
                            finalText = ocrText;
                        }
                        
                        // Aplica correções básicas pós-OCR
                        if (finalText) {
                            finalText = applyBasicCorrections(finalText);
                            console.log(`Código ${j + 1} (Corrigido):`, finalText);
                        }
                        
                        // Verifica se o código é válido
                        if (finalText && isValidCode(finalText)) {
                            fileName = generateSafeFilename(finalText);
                            let counter = 1;
                            let finalFileName = fileName;
                            while (state.allBarcodes.some(b => b.name === finalFileName)) {
                                const ext = fileName.substring(fileName.lastIndexOf('.'));
                                const base = fileName.substring(0, fileName.lastIndexOf('.'));
                                finalFileName = `${base}_${counter}${ext}`;
                                counter++;
                            }
                            fileName = finalFileName;
                            barcodeWrapper.className = 'barcode-wrapper barcode-read';
                            infoText.innerHTML = `✅ ${finalText}`;
                            totalRead++;
                        } else {
                            const prefix = document.getElementById('prefixInput')?.value || 'EVB';
                            fileName = `${prefix}${String(imageCounter).padStart(4, '0')}.png`;
                            imageCounter++;
                            infoText.innerHTML = '<span class="barcode-error">❌ Código não lido</span>';
                            totalUnread++;
                        }
                        
                        downloadButton.style.display = 'inline-flex';
                        downloadButton.onclick = function() {
                            downloadImage(barcode.src, fileName);
                        };
                        
                        state.allBarcodes.push({
                            src: barcode.src,
                            name: fileName,
                            text: finalText || `sequencial_${imageCounter}`
                        });
                        
                    } catch (readError) {
                        console.error('Erro na leitura do código:', readError);
                        const prefix = document.getElementById('prefixInput')?.value || 'EVB';
                        const fileName = `${prefix}${String(imageCounter).padStart(4, '0')}.png`;
                        imageCounter++;
                        
                        infoText.innerHTML = '<span class="barcode-error">Erro na leitura</span>';
                        downloadButton.style.display = 'inline-flex';
                        downloadButton.onclick = function() {
                            downloadImage(barcode.src, fileName);
                        };
                        
                        state.allBarcodes.push({
                            src: barcode.src,
                            name: fileName,
                            text: `erro_${imageCounter}`
                        });
                        totalUnread++;
                    }
                }
                
                // Atualiza progresso
                const progress = ((i + 1) / pages.length) * 100;
                if (progressBar) progressBar.value = progress;
                if (progressText) progressText.textContent = `${Math.round(progress)}%`;
                if (progressFill) progressFill.style.width = `${progress}%`;
                
            } catch (pageError) {
                console.error(`Erro ao processar página ${pageNumber}:`, pageError);
            }
        }
        
        // Finalizar
        if (progressText) progressText.textContent = 'Concluído!';
        if (elements.downloadAllContainer) elements.downloadAllContainer.style.display = 'block';
        
        // Atualizar stats
        if (elements.processingStats) elements.processingStats.style.display = 'grid';
        if (elements.readCount) elements.readCount.textContent = totalRead;
        if (elements.unreadCount) elements.unreadCount.textContent = totalUnread;
        
        console.log('Processamento concluído. Total de códigos:', state.allBarcodes.length);
        console.log(`Lidos: ${totalRead}, Não lidos: ${totalUnread}`);
        
    } catch (error) {
        console.error('Erro no processamento:', error);
        if (progressText) progressText.textContent = 'Erro!';
        alert('Ocorreu um erro durante o processamento: ' + error.message);
    } finally {
        clearInterval(elements.processingTimer);
    }
}

// ============================================
// Extração de Códigos de Barras (ORIGINAL)
// ============================================
function extractBarcodes(canvas, barcodesPerPage) {
    const barcodes = [];
    const pageWidth = canvas.width;
    const pageHeight = canvas.height;
    
    const barcodeWidth = (pageWidth / 4) * 0.8;
    const barcodeHeight = (pageHeight / 11) * 0.8;
    
    const offsets = [
        [
            { offsetX: 240, offsetY: 210 }, { offsetX: 240, offsetY: 200 }, { offsetX: 240, offsetY: 190 },
            { offsetX: 240, offsetY: 180 }, { offsetX: 240, offsetY: 170 }, { offsetX: 240, offsetY: 160 },
            { offsetX: 240, offsetY: 150 }, { offsetX: 240, offsetY: 140 }, { offsetX: 240, offsetY: 130 },
            { offsetX: 240, offsetY: 120 }, { offsetX: 240, offsetY: 110 }
        ],
        [
            { offsetX: 140, offsetY: 215 }, { offsetX: 140, offsetY: 205 }, { offsetX: 140, offsetY: 195 },
            { offsetX: 140, offsetY: 185 }, { offsetX: 140, offsetY: 175 }, { offsetX: 140, offsetY: 165 },
            { offsetX: 140, offsetY: 155 }, { offsetX: 140, offsetY: 145 }, { offsetX: 140, offsetY: 135 },
            { offsetX: 140, offsetY: 125 }, { offsetX: 140, offsetY: 115 }
        ],
        [
            { offsetX: 30, offsetY: 205 }, { offsetX: 30, offsetY: 195 }, { offsetX: 30, offsetY: 185 },
            { offsetX: 30, offsetY: 175 }, { offsetX: 30, offsetY: 165 }, { offsetX: 30, offsetY: 155 },
            { offsetX: 30, offsetY: 145 }, { offsetX: 30, offsetY: 135 }, { offsetX: 30, offsetY: 125 },
            { offsetX: 30, offsetY: 115 }, { offsetX: 30, offsetY: 105 }
        ],
        [
            { offsetX: -80, offsetY: 210 }, { offsetX: -80, offsetY: 200 }, { offsetX: -80, offsetY: 190 },
            { offsetX: -80, offsetY: 180 }, { offsetX: -80, offsetY: 170 }, { offsetX: -80, offsetY: 160 },
            { offsetX: -80, offsetY: 150 }, { offsetX: -80, offsetY: 140 }, { offsetX: -80, offsetY: 130 },
            { offsetX: -80, offsetY: 120 }, { offsetX: -80, offsetY: 110 }
        ]
    ];
    
    for (let row = 0; row < 11; row++) {
        for (let col = 0; col < 4; col++) {
            const { offsetX, offsetY } = offsets[col][row];
            const x = col * (pageWidth / 4) + offsetX;
            const y = row * (pageHeight / 11) + offsetY;
            
            const barcodeCanvas = document.createElement('canvas');
            barcodeCanvas.width = barcodeWidth;
            barcodeCanvas.height = barcodeHeight;
            const barcodeContext = barcodeCanvas.getContext('2d');
            
            barcodeContext.drawImage(
                canvas,
                x, y, barcodeWidth, barcodeHeight,
                0, 0, barcodeWidth, barcodeHeight
            );
            
            const barcodeImage = new Image();
            barcodeImage.src = barcodeCanvas.toDataURL();
            barcodes.push(barcodeImage);
        }
    }
    
    return barcodes;
}

// ============================================
// Leitura Quagga (ORIGINAL)
// ============================================
function readBarcodeFromImage(image) {
    return new Promise((resolve) => {
        const timeout = setTimeout(() => {
            console.log('Timeout na leitura do código de barras');
            resolve(null);
        }, 3000);
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = image.width;
        canvas.height = image.height;
        ctx.drawImage(image, 0, 0, image.width, image.height);
        
        try {
            Quagga.decodeSingle({
                decoder: {
                    readers: ['code_128_reader', 'ean_reader', 'code_39_reader', 'codabar_reader']
                },
                locate: true,
                src: canvas.toDataURL(),
                numOfWorkers: 0,
                inputStream: {
                    size: 800
                }
            }, function(result) {
                clearTimeout(timeout);
                if (result && result.codeResult) {
                    resolve(result.codeResult.code);
                } else {
                    resolve(null);
                }
            });
        } catch (error) {
            clearTimeout(timeout);
            console.error('Erro no Quagga:', error);
            resolve(null);
        }
    });
}

// ============================================
// OCR Tesseract (ORIGINAL)
// ============================================
function readTextWithOCR(image) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = image.width;
        canvas.height = image.height;
        ctx.drawImage(image, 0, 0, image.width, image.height);
        
        Tesseract.recognize(
            canvas,
            'eng',
            {
                logger: progress => {
                    if (progress.status === 'recognizing text') {
                        console.log(`Progresso OCR: ${Math.round(progress.progress * 100)}%`);
                    }
                }
            }
        ).then(({ data: { text } }) => {
            console.log('Texto detectado pelo OCR:', text);
            const cleanedText = cleanOCRText(text);
            console.log('Texto limpo:', cleanedText);
            resolve(cleanedText);
        }).catch(error => {
            console.error('Erro no Tesseract OCR:', error);
            resolve(null);
        });
    });
}

// ============================================
// Limpeza OCR (ORIGINAL)
// ============================================
function cleanOCRText(text) {
    if (!text) return null;
    
    let cleaned = text.replace(/\s+/g, ' ').trim();
    
    const evbPatterns = [
        /EVB\s*\d+/i,
        /EVB\d+/i,
        /[Ee]VB\s*\d+/i,
    ];
    
    for (const pattern of evbPatterns) {
        const match = cleaned.match(pattern);
        if (match) {
            let result = match[0];
            result = result.replace(/\s/g, '');
            result = result.replace(/^eVB/i, 'EVB');
            return result.toUpperCase();
        }
    }
    
    const generalPatterns = [
        /[A-Z]{3}\s*\d+/i,
        /\b[A-Z0-9]{6,10}\b/i,
        /[A-Z]{2,3}\d{4,7}/i,
    ];
    
    for (const pattern of generalPatterns) {
        const matches = cleaned.match(pattern);
        if (matches) {
            let result = matches[0];
            result = result.replace(/\s/g, '');
            
            if (!result.startsWith('EVB') && result.length >= 6) {
                if (/^[A-Z]{2,3}\d+$/.test(result)) {
                    return result.toUpperCase();
                }
            }
            return result.toUpperCase();
        }
    }
    
    const finalResult = cleaned.replace(/\s/g, '').substring(0, 20);
    return finalResult || null;
}

// ============================================
// Correções (ORIGINAL)
// ============================================
function applyBasicCorrections(text) {
    if (!text) return null;
    
    let corrected = text.toUpperCase();
    
    const rejectedPatterns = [
        'IIIIIIM', 'IIIIIII', 'IIIIII', 'IIIII', 'IIII', 'III',
        'EVB00', 'EVB0', 'EVB'
    ];
    
    if (rejectedPatterns.includes(corrected)) {
        return null;
    }
    
    // CORREÇÃO: Remover letras entre EVB e números
    if (corrected.startsWith('EVB') && corrected.length > 3) {
        const afterEVB = corrected.substring(3);
        let numbersStartIndex = 0;
        
        for (let i = 0; i < afterEVB.length; i++) {
            if (!isNaN(afterEVB[i]) && afterEVB[i] !== ' ') {
                numbersStartIndex = i;
                break;
            }
        }
        
        if (numbersStartIndex > 0) {
            const numbers = afterEVB.substring(numbersStartIndex);
            corrected = 'EVB' + numbers;
        }
    }
    
    const evbWithLettersPattern = /^EVB([A-Z]+)(\d+)$/;
    const match = corrected.match(evbWithLettersPattern);
    if (match) {
        corrected = 'EVB' + match[2];
    }
    
    if (corrected.startsWith('EVB') && corrected.length > 3) {
        const prefix = corrected.substring(0, 3);
        const numbers = corrected.substring(3).replace(/O/g, '0');
        corrected = prefix + numbers;
    }
    
    if (corrected.startsWith('VB') && corrected.length >= 6) {
        corrected = 'E' + corrected;
    }
    
    if (corrected.startsWith('EVB') && corrected.length >= 9) {
        const numbersPart = corrected.substring(3);
        if (/[A-Z]/.test(numbersPart)) {
            const numbersOnly = numbersPart.replace(/[A-Z]/g, '');
            if (numbersOnly.length >= 6) {
                corrected = 'EVB' + numbersOnly;
            }
        }
    }
    
    return corrected;
}

function isValidCode(code) {
    if (!code || code.length < 6) return false;
    
    const invalidPatterns = [
        /^IIIIIIM/i,
        /^EVB00$/,
        /^[A-Z]*$/,
        /^\d*$/,
    ];
    
    for (const pattern of invalidPatterns) {
        if (pattern.test(code)) return false;
    }
    
    if (code.startsWith('EVB') && code.length > 3) return true;
    if (code.length >= 6 && code.length <= 20) return true;
    
    return false;
}

function generateSafeFilename(barcodeText) {
    if (!barcodeText) return null;
    
    const safeName = barcodeText
        .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚâêîôÂÊÎÔãõÃÕçÇ_-]/g, '_')
        .substring(0, 100);
    
    return safeName + '.png';
}

function downloadImage(imageSrc, fileName) {
    const link = document.createElement('a');
    link.href = imageSrc;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ============================================
// Download All e Utilitários
// ============================================
function handleDownloadAll() {
    if (state.allBarcodes.length === 0) {
        alert('Nenhum código de barras para baixar.');
        return;
    }
    
    const zip = new JSZip();
    const folder = zip.folder("codigos_de_barras");
    
    const totalBarcodes = state.allBarcodes.length;
    const readBarcodes = state.allBarcodes.filter(b => b.text && !b.text.startsWith('sequencial_') && !b.text.startsWith('erro_')).length;
    
    state.allBarcodes.forEach((barcode) => {
        const base64Data = barcode.src.split(',')[1];
        folder.file(barcode.name, base64Data, { base64: true });
    });
    
    zip.generateAsync({ type: "blob" }).then(function(content) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = `codigos_de_barras_${readBarcodes}_lidos_de_${totalBarcodes}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        alert(`Download concluído!\nCódigos lidos: ${readBarcodes}/${totalBarcodes} (${Math.round((readBarcodes/totalBarcodes)*100)}%)`);
    });
}

function updateElapsedTime() {
    if (state.processingStartTime && elements.elapsedTime) {
        const elapsed = Math.floor((Date.now() - state.processingStartTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        elements.elapsedTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}

// Funções auxiliares para UI
function selectAllPages() {
    document.querySelectorAll('input[name="page"]').forEach(cb => cb.checked = true);
}

function deselectAllPages() {
    document.querySelectorAll('input[name="page"]').forEach(cb => cb.checked = false);
}

function invertSelection() {
    document.querySelectorAll('input[name="page"]').forEach(cb => cb.checked = !cb.checked);
}

function clearResults() {
    elements.imageContainer.innerHTML = '';
    if (elements.emptyResults) elements.emptyResults.style.display = 'block';
    if (elements.downloadAllContainer) elements.downloadAllContainer.style.display = 'none';
    if (elements.processingStats) elements.processingStats.style.display = 'none';
    state.allBarcodes = [];
}