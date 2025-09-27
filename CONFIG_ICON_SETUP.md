# 🎨 CONFIGURAÇÃO DO ÍCONE DO APP

## 📂 ONDE COLOCAR SUA IMAGEM:

### **Pasta pública:**
```
public/
├── icon.svg      ← Seu ícone principal
├── icon-192.png  ← 192x192 pixel
├── icon-512.png  ← 512x512 pixel  
├── favicon.ico   ← Icon tradicional
└── manifest.json ← Configuração PWA
```

## 🔧 PASSOS PARA TROCAR SEU ÍCONE:

### **1️⃣ Colocar arquivos:**
- Substitua `public/icon.svg` com sua imagem SVG
- Ou converter sua imagem para:
  - SVG: Para layouts responsivos  
  - PNG: Para dispositivos (192x192 e 512x512)

### **2️⃣ Formatos suportado:**
```typescript
✅ CENAS MAIS COMUNS:
• icon.svg    - SVG high quality  
• icon.png    - PNG versatile 
• favicon.ico - Browser standard 

TODOS DEVEM ir em public/ folder
```

### **3️⃣ Imagens precisa specs:**
```
SVG icon:     Multicolor optimizable
PNG 192x192:  Para aplicação standard   
PNG 512x512:  Para splash maior quality 
ICO favicon:  Para browser toolbar display
```

### **4️⃣ Uma vez arquivo posto:**
Seu app vai pick the default icons​ from manifest.json
Página reload para refresh
Mobile app installation → Icons appear correctly

VÃO APARECER EM:
• Browser tab (favicon)
• PWA home screen icons
• App install prompts  
• Splash screen loading
• Marching capabilities logo

## ⚡ OPÇÃO FAST REFRESH:

### **Quickest alternative:**
Replace essas files with your custom:
```
public/icon.svg → SUA_IMAGE.svg   
public/icon-192.png → SUA_192.png   
public/icon-512.png → SUA_512.png
```

Once replaced:
Deploy production+cache refresh 
Browser bookmark icons update  

Seu app ícone is CUSTOMIZED ✅

