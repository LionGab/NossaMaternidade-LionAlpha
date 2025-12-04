#!/bin/bash

# Script para configurar Git Hooks de proteção
# Uso: bash scripts/setup-git-hooks.sh

echo "🔧 Configurando Git Hooks..."
echo "=============================="
echo ""

REPO_PATH="."
cd "$REPO_PATH" || exit 1

# Criar pasta .git/hooks se não existir
mkdir -p .git/hooks

# Criar hook pre-push
cat > .git/hooks/pre-push << 'HOOK_EOF'
#!/bin/bash

# Git Hook: pre-push
# Bloqueia push direto na branch main
# Permite apenas push via PR (feature → dev → main)

branch=$(git symbolic-ref HEAD | sed -e 's,.*/\(.*\),\1,')

if [ "$branch" = "main" ]; then
    echo ""
    echo "❌❌❌ PUSH BLOQUEADO ❌❌❌"
    echo ""
    echo "Você está tentando fazer push direto na branch 'main'!"
    echo ""
    echo "📋 Fluxo correto:"
    echo "  1. Trabalhe em feature branch"
    echo "  2. Faça PR para 'dev'"
    echo "  3. Merge dev → main (quando estável)"
    echo ""
    echo "🔧 Comando correto:"
    echo "  git checkout -b feature/minha-feature"
    echo "  # ... desenvolva aqui ..."
    echo "  git push -u origin feature/minha-feature"
    echo "  # Depois abra PR no GitHub"
    echo ""
    exit 1
fi

echo "✅ Push autorizado em branch: $branch"
HOOK_EOF

# Tornar executável
chmod +x .git/hooks/pre-push

echo "✅ Hook pre-push instalado com sucesso!"
echo ""
echo "📋 O que foi configurado:"
echo "  - Push direto em 'main' será bloqueado"
echo "  - Feature branches podem fazer push normalmente"
echo ""
echo "🧪 Teste:"
echo "  git checkout main"
echo "  git push origin main  # Deve ser bloqueado"
echo ""

