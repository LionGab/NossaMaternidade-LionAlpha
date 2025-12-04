#!/bin/bash

# Deploy Supabase Edge Functions
# Uso: ./deploy.sh [function-name]

set -e

echo "🚀 Deploying Supabase Edge Functions..."

# Se não especificar função, deploy todas
if [ -z "$1" ]; then
  echo "📦 Deploying all functions..."

  # Deploy todas as funções
  for fn in chat-ai audio-ai analyze-diary; do
    echo "Deploying $fn..."
    supabase functions deploy $fn --no-verify-jwt
    if [ $? -eq 0 ]; then
      echo "✅ $fn deployed!"
    else
      echo "❌ Failed to deploy $fn"
      exit 1
    fi
  done

  echo "✅ All functions deployed!"
else
  # Deploy função específica
  echo "📦 Deploying $1..."
  supabase functions deploy "$1" --no-verify-jwt
  echo "✅ $1 deployed!"
fi

echo ""
echo "🔑 Don't forget to set secrets:"
echo "supabase secrets set GEMINI_API_KEY=your_key_here"
