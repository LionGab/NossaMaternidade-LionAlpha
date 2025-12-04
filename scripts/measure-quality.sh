#!/bin/bash
# Script de Medição de Métricas de Qualidade
# Rastreia progresso da refatoração

echo "📊 =========================================="
echo "📊  MÉTRICAS DE QUALIDADE DO CÓDIGO"
echo "📊 =========================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Diretório do projeto
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR" || exit 1

echo "${BLUE}🔍 Analisando código em: ${NC}$PROJECT_DIR"
echo ""

# 1. Contar ocorrências de 'any'
echo "${YELLOW}1. Tipos 'any' (Meta: <10)${NC}"
ANY_COUNT=$(grep -r ":\s*any" src/ --include="*.ts" --include="*.tsx" | grep -v "node_modules" | grep -v "__tests__" | wc -l)
echo "   Total: $ANY_COUNT ocorrências"
if [ "$ANY_COUNT" -lt 10 ]; then
  echo "   ${GREEN}✅ META ATINGIDA!${NC}"
else
  echo "   ${RED}❌ Acima da meta (target: <10)${NC}"
fi
echo ""

# 2. Contar console.log
echo "${YELLOW}2. console.log (Meta: 0)${NC}"
CONSOLE_LOG=$(grep -r "console\.log" src/ --include="*.ts" --include="*.tsx" | grep -v "node_modules" | grep -v "__tests__" | grep -v "eslint-disable-next-line" | wc -l)
echo "   Total: $CONSOLE_LOG ocorrências"
if [ "$CONSOLE_LOG" -eq 0 ]; then
  echo "   ${GREEN}✅ META ATINGIDA!${NC}"
else
  echo "   ${RED}❌ Ainda existem console.log${NC}"
fi
echo ""

# 3. Contar console.error
echo "${YELLOW}3. console.error (Meta: 0)${NC}"
CONSOLE_ERROR=$(grep -r "console\.error" src/ --include="*.ts" --include="*.tsx" | grep -v "node_modules" | grep -v "__tests__" | grep -v "eslint-disable-next-line" | wc -l)
echo "   Total: $CONSOLE_ERROR ocorrências"
if [ "$CONSOLE_ERROR" -eq 0 ]; then
  echo "   ${GREEN}✅ META ATINGIDA!${NC}"
else
  echo "   ${RED}❌ Ainda existem console.error${NC}"
fi
echo ""

# 4. Contar console.warn
echo "${YELLOW}4. console.warn (Meta: 0)${NC}"
CONSOLE_WARN=$(grep -r "console\.warn" src/ --include="*.ts" --include="*.tsx" | grep -v "node_modules" | grep -v "__tests__" | grep -v "eslint-disable-next-line" | wc -l)
echo "   Total: $CONSOLE_WARN ocorrências"
if [ "$CONSOLE_WARN" -eq 0 ]; then
  echo "   ${GREEN}✅ META ATINGIDA!${NC}"
else
  echo "   ${RED}❌ Ainda existem console.warn${NC}"
fi
echo ""

# 5. Total de console.*
TOTAL_CONSOLE=$((CONSOLE_LOG + CONSOLE_ERROR + CONSOLE_WARN))
echo "${YELLOW}5. Total console.* (Meta: 0)${NC}"
echo "   Total: $TOTAL_CONSOLE ocorrências"
if [ "$TOTAL_CONSOLE" -eq 0 ]; then
  echo "   ${GREEN}✅ META ATINGIDA!${NC}"
else
  echo "   ${RED}❌ Total: $TOTAL_CONSOLE${NC}"
fi
echo ""

# 6. Contar 'let' desnecessários (aproximação - precisa revisão manual)
echo "${YELLOW}6. 'let' declarações (Meta: converter para const onde possível)${NC}"
LET_COUNT=$(grep -r "\blet\b" src/ --include="*.ts" --include="*.tsx" | grep -v "node_modules" | grep -v "__tests__" | wc -l)
echo "   Total: $LET_COUNT ocorrências"
echo "   ${BLUE}ℹ️  Revisar manualmente se podem ser const${NC}"
echo ""

# 7. Verificar existência de Error Boundary
echo "${YELLOW}7. Error Boundary${NC}"
if [ -f "src/components/ErrorBoundary.tsx" ] || [ -f "src/components/common/ErrorBoundary.tsx" ] || [ -f "src/components/AppErrorBoundary.tsx" ]; then
  echo "   ${GREEN}✅ Error Boundary existe${NC}"
else
  echo "   ${RED}❌ Error Boundary não encontrado${NC}"
fi
echo ""

# 8. Cobertura de testes (se Jest estiver configurado)
echo "${YELLOW}8. Cobertura de Testes (Meta: >70%)${NC}"
if command -v jest &> /dev/null; then
  if [ -f "jest.config.js" ] || [ -f "jest.config.ts" ]; then
    echo "   ${BLUE}ℹ️  Execute: npm run test:coverage${NC}"
  else
    echo "   ${YELLOW}⚠️  Jest não configurado${NC}"
  fi
else
  echo "   ${YELLOW}⚠️  Jest não instalado${NC}"
fi
echo ""

# 9. Resumo final
echo "📊 =========================================="
echo "📊  RESUMO"
echo "📊 =========================================="
echo ""
echo "Tipo                  | Atual | Meta  | Status"
echo "----------------------|-------|-------|--------"
printf "any types             | %5d | <10   | " "$ANY_COUNT"
if [ "$ANY_COUNT" -lt 10 ]; then echo "${GREEN}✅${NC}"; else echo "${RED}❌${NC}"; fi

printf "console.log           | %5d | 0     | " "$CONSOLE_LOG"
if [ "$CONSOLE_LOG" -eq 0 ]; then echo "${GREEN}✅${NC}"; else echo "${RED}❌${NC}"; fi

printf "console.error         | %5d | 0     | " "$CONSOLE_ERROR"
if [ "$CONSOLE_ERROR" -eq 0 ]; then echo "${GREEN}✅${NC}"; else echo "${RED}❌${NC}"; fi

printf "console.warn          | %5d | 0     | " "$CONSOLE_WARN"
if [ "$CONSOLE_WARN" -eq 0 ]; then echo "${GREEN}✅${NC}"; else echo "${RED}❌${NC}"; fi

printf "Total console.*       | %5d | 0     | " "$TOTAL_CONSOLE"
if [ "$TOTAL_CONSOLE" -eq 0 ]; then echo "${GREEN}✅${NC}"; else echo "${RED}❌${NC}"; fi

echo ""
echo "${BLUE}Data: $(date '+%Y-%m-%d %H:%M:%S')${NC}"
echo ""
