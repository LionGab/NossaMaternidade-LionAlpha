#!/bin/bash

# Script de Validação - Verifica se o projeto está pronto para build/deploy
# Uso: bash scripts/check-ready.sh

echo "🔍 Verificando prontidão para deploy..."
echo "======================================="
echo ""

REPO_PATH="."
cd "$REPO_PATH" || exit 1

checks=0
total=8
errors=0
warnings=0

# 1. app.json
echo "📱 Verificando app.json..."
if [ -f "app.json" ]; then
    echo "  ✅ app.json encontrado"
    ((checks++))
    
    # Verificar bundle ID
    if grep -q "com.nossamaternidade.app" app.json; then
        echo "  ✅ Bundle ID correto"
    else
        echo "  ⚠️  Bundle ID precisa ser 'com.nossamaternidade.app'"
        ((warnings++))
    fi
else
    echo "  ❌ app.json NÃO encontrado"
    ((errors++))
fi
echo ""

# 2. eas.json
echo "📦 Verificando eas.json..."
if [ -f "eas.json" ]; then
    echo "  ✅ eas.json encontrado"
    ((checks++))
    
    if grep -q '"production"' eas.json; then
        echo "  ✅ Profile production existe"
    else
        echo "  ⚠️  Profile production não encontrado"
        ((warnings++))
    fi
else
    echo "  ❌ eas.json NÃO encontrado"
    ((errors++))
fi
echo ""

# 3. .env.example
echo "📄 Verificando .env.example..."
if [ -f ".env.example" ]; then
    echo "  ✅ .env.example encontrado"
    ((checks++))
else
    echo "  ❌ .env.example NÃO encontrado"
    ((errors++))
fi
echo ""

# 4. .env (deve existir mas não estar no Git)
echo "🔐 Verificando .env..."
if [ -f ".env" ]; then
    echo "  ✅ .env configurado"
    ((checks++))
    
    if git ls-files --error-unmatch .env &> /dev/null; then
        echo "  ⚠️  ATENÇÃO: .env está no Git! Remova com: git rm --cached .env"
        ((warnings++))
    else
        echo "  ✅ .env não está no Git (correto)"
    fi
else
    echo "  ⚠️  .env não encontrado (crie a partir do .env.example)"
    echo "      Comando: cp .env.example .env"
    ((warnings++))
fi
echo ""

# 5. Assets - Ícone
echo "🖼️  Verificando assets/icon.png..."
if [ -f "assets/icon.png" ]; then
    echo "  ✅ Ícone encontrado"
    ((checks++))
    
    # Verificar dimensões (requer ImageMagick ou similar)
    if command -v identify &> /dev/null; then
        size=$(identify -format "%wx%h" assets/icon.png 2>/dev/null)
        if [ "$size" = "1024x1024" ]; then
            echo "  ✅ Dimensões corretas (1024x1024)"
        else
            echo "  ⚠️  Dimensões incorretas: $size (esperado: 1024x1024)"
            ((warnings++))
        fi
    elif command -v file &> /dev/null; then
        # Fallback: apenas verificar se é imagem PNG
        if file assets/icon.png | grep -q "PNG"; then
            echo "  ✅ Arquivo PNG válido (dimensões não verificadas - instale ImageMagick para verificar)"
        fi
    fi
else
    echo "  ❌ assets/icon.png NÃO encontrado"
    ((errors++))
fi
echo ""

# 6. Assets - Splash
echo "🖼️  Verificando assets/splash.png..."
if [ -f "assets/splash.png" ]; then
    echo "  ✅ Splash screen encontrado"
    ((checks++))
else
    echo "  ❌ assets/splash.png NÃO encontrado"
    ((errors++))
fi
echo ""

# 7. Screenshots (para lojas)
echo "📸 Verificando screenshots..."
if [ -d "assets/screenshots" ]; then
    count=$(find assets/screenshots -name "*.png" -o -name "*.jpg" 2>/dev/null | wc -l)
    if [ "$count" -gt 0 ]; then
        echo "  ✅ Screenshots encontrados ($count arquivos)"
        ((checks++))
        
        if [ "$count" -lt 3 ]; then
            echo "  ⚠️  Recomendado: pelo menos 3 screenshots para as lojas"
            ((warnings++))
        fi
    else
        echo "  ⚠️  Pasta screenshots existe mas está vazia"
        echo "      Recomendado: adicione screenshots para as lojas"
        ((warnings++))
    fi
else
    echo "  ⚠️  assets/screenshots/ não existe (criando pasta...)"
    mkdir -p assets/screenshots
    echo "  ✅ Pasta criada (adicione screenshots depois)"
    ((warnings++))
fi
echo ""

# 8. README.md
echo "📚 Verificando README.md..."
if [ -f "README.md" ]; then
    echo "  ✅ README.md encontrado"
    ((checks++))
    
    if grep -qi "oficial\|official" README.md; then
        echo "  ✅ README marca repositório como oficial"
    else
        echo "  ⚠️  README não menciona que é repositório oficial"
        ((warnings++))
    fi
else
    echo "  ❌ README.md NÃO encontrado"
    ((errors++))
fi
echo ""

# Resultado
echo "======================================"
echo "📊 Score: $checks/$total checks aprovados"
echo "======================================"
echo ""

if [ $errors -gt 0 ]; then
    echo "❌ ERROS CRÍTICOS: $errors"
    echo "   Corrija os itens marcados como ❌ antes de fazer build"
    echo ""
fi

if [ $warnings -gt 0 ]; then
    echo "⚠️  AVISOS: $warnings"
    echo "   Revise os itens marcados como ⚠️"
    echo ""
fi

if [ $errors -eq 0 ] && [ $checks -eq $total ]; then
    echo "🎉🎉🎉 PRONTO PARA DEPLOY! 🎉🎉🎉"
    echo ""
    echo "Próximo passo:"
    echo "  eas build --profile preview --platform android"
    echo ""
    exit 0
elif [ $errors -eq 0 ] && [ $checks -ge 6 ]; then
    echo "✅ QUASE PRONTO"
    echo "Corrija os $warnings avisos para melhorar a qualidade do deploy"
    echo ""
    exit 0
else
    echo "❌ NÃO PRONTO PARA DEPLOY"
    echo "Faltam $errors itens críticos e $warnings avisos"
    echo ""
    exit 2
fi

