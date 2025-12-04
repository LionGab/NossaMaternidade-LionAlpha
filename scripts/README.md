# Scripts de Automação

Scripts utilitários para desenvolvimento e deploy.

## 📋 Scripts Disponíveis

### `validate-android.js`

Valida configuração Android antes do build.

**Uso:**

```bash
npm run validate:android
```

**O que valida:**

- ✅ Variáveis de ambiente obrigatórias
- ✅ Configuração Android em `app.config.js`
- ✅ Assets necessários (ícones, splash screens)
- ✅ Configuração EAS (`eas.json`)
- ✅ Service account key (se configurado)

### `prepare-assets.js`

Prepara estrutura de diretórios para assets Android.

**Uso:**

```bash
npm run prepare:assets
```

**O que faz:**

- Cria estrutura de diretórios para screenshots
- Cria README com requisitos de assets
- Valida assets existentes

### `apply-schema.ts`

Aplica schema SQL no Supabase.

**Uso:**

```bash
npm run apply-schema
```

### `test-supabase-connection.ts`

Testa conexão com Supabase.

**Uso:**

```bash
npm run test-supabase
```
