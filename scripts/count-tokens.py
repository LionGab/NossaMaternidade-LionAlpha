#!/usr/bin/env python3
"""
Conta tokens de texto usando tiktoken (compatível com Claude/GPT)
Uso:
  python scripts/count-tokens.py "texto aqui"
  python scripts/count-tokens.py < arquivo.txt
  cat arquivo.txt | python scripts/count-tokens.py
  python scripts/count-tokens.py -f CLAUDE.md
"""
import sys
import tiktoken

def count_tokens(text: str) -> int:
    """Conta tokens usando encoding cl100k_base (Claude/GPT-4)"""
    encoding = tiktoken.get_encoding("cl100k_base")
    return len(encoding.encode(text))

def format_number(n: int) -> str:
    """Formata número com separador de milhares"""
    return f"{n:,}".replace(",", ".")

def main():
    # Lê de arquivo se -f especificado
    if len(sys.argv) > 2 and sys.argv[1] == "-f":
        try:
            with open(sys.argv[2], "r", encoding="utf-8") as f:
                text = f.read()
                filename = sys.argv[2]
        except Exception as e:
            print(f"Erro ao ler arquivo: {e}", file=sys.stderr)
            sys.exit(1)
    # Lê de argumento
    elif len(sys.argv) > 1:
        text = " ".join(sys.argv[1:])
        filename = None
    # Lê de stdin
    else:
        text = sys.stdin.read()
        filename = None

    if not text.strip():
        print("Erro: Nenhum texto fornecido", file=sys.stderr)
        sys.exit(1)

    # Conta tokens
    token_count = count_tokens(text)
    char_count = len(text)
    word_count = len(text.split())
    ratio = char_count / token_count if token_count > 0 else 0

    # Output formatado
    print(f"{'='*50}")
    if filename:
        print(f"Arquivo: {filename}")
    print(f"{'='*50}")
    print(f"Tokens:     {format_number(token_count)}")
    print(f"Caracteres: {format_number(char_count)}")
    print(f"Palavras:   {format_number(word_count)}")
    print(f"Ratio:      {ratio:.2f} chars/token")
    print(f"{'='*50}")

    # Avisos sobre limites
    if token_count > 150000:
        print("⚠️  AVISO: Contexto muito grande (>150k tokens)")
        print("   Considere usar /compact")
    elif token_count > 100000:
        print("⚠️  AVISO: Contexto grande (>100k tokens)")
        print("   Compactação automática pode acontecer")
    elif token_count > 50000:
        print("ℹ️  INFO: Contexto médio (>50k tokens)")

if __name__ == "__main__":
    main()
