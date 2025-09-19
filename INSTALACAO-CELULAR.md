# 📱 Guia de Instalação no Celular

## Para Android (Chrome/Samsung Internet)

1. **Abra o site no Chrome**
2. **Toque no menu (3 pontos)** no canto superior direito
3. **Selecione "Instalar app"** ou "Adicionar à tela inicial"
4. **Confirme a instalação**
5. O app aparecerá na sua tela inicial!

## Para iPhone/iPad (Safari)

1. **Abra o site no Safari**
2. **Toque no botão de compartilhar (📤)** na barra inferior
3. **Role para baixo e toque em "Adicionar à Tela Inicial"**
4. **Toque em "Adicionar"** no canto superior direito
5. O app aparecerá na sua tela inicial!

## Verificações Importantes

### ✅ O que foi melhorado:

1. **Popup mais discreto**: Agora aparece como um card pequeno na parte inferior
2. **Menos intrusivo**: Só aparece uma vez se você dispensar
3. **Instruções claras**: Guias específicos para Android e iOS
4. **Manifest otimizado**: Configurações melhoradas para instalação
5. **Detecção inteligente**: Não aparece se o app já estiver instalado

### 🔧 Se não funcionar:

1. **Limpe o cache do browser**
2. **Tente em modo incógnito**
3. **Verifique se o HTTPS está funcionando**
4. **Teste em outro browser**

### 📋 Checklist de Instalação:

- [ ] Site carrega corretamente
- [ ] Manifest.json está acessível
- [ ] Ícones estão carregando
- [ ] Service Worker está ativo
- [ ] Popup aparece (se não instalado)
- [ ] Instalação funciona pelo menu do browser

## Testando a Instalação

1. Acesse o site no seu celular
2. Se aparecer o popup, teste o botão "Instalar"
3. Se não aparecer, use o menu do browser
4. Verifique se o app aparece na tela inicial
5. Abra o app instalado e teste as funcionalidades

## Troubleshooting

### Popup não aparece:
- Verifique se o browser suporta PWA
- Limpe o localStorage: `localStorage.clear()`
- Teste em modo incógnito

### Instalação não funciona:
- Verifique se está em HTTPS
- Teste em outro browser
- Verifique se o manifest.json está acessível

### App não abre corretamente:
- Verifique se o service worker está ativo
- Teste a URL base do site
- Verifique as configurações de cache
