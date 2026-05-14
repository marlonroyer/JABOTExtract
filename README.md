# 🏷️ JABOT Extract

![Version](https://img.shields.io/badge/version-1.0.0-gold)
![License](https://img.shields.io/badge/license-MIT-red)

**Ferramenta para extração de códigos de barras de PDFs gerados pelo sistema JABOT de uso interno para o Herbário Evaldo Buttura**

## Funcionalidades

- Upload de PDF (arraste e solte ou selecione)
- Leitura inteligente com QuaggaJS + Tesseract OCR
- Processamento em lote de múltiplas páginas
- Extração precisa otimizada para planilhas A4 do JABOT
- Download individual ou em massa (ZIP)

## Demo Online

Acesse: [https://seu-usuario.github.io/jabot-extract](https://seu-usuario.github.io/jabot-extract)

## Como Usar

1. Acesse a ferramenta online
2. Carregue o PDF gerado pelo sistema JABOT
3. Selecione as páginas desejadas
4. Configure o prefixo (padrão: EVB)
5. Clique em "Processar"
6. Baixe os códigos individualmente ou em ZIP

## Tecnologias

- **PDF.js** - Renderização de PDF
- **QuaggaJS** - Leitura de códigos de barras
- **Tesseract.js** - OCR para fallback
- **JSZip** - Compactação para download
- **Font Awesome** - Ícones
- **GitHub Pages** - Hospedagem

