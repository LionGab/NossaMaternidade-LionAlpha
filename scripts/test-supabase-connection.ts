/**
 * Script para testar conexão com Supabase
 *
 * Execute com: npx ts-node scripts/test-supabase-connection.ts
 * Ou: node scripts/test-supabase-connection.js
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

console.log('\n🔍 Testando Conexão com Supabase...\n');
console.log('📍 URL:', supabaseUrl);
console.log(
  '🔑 Key:',
  supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'NÃO CONFIGURADA'
);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('\n❌ Erro: Variáveis de ambiente não configuradas!');
  console.error(
    '   Configure EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY no arquivo .env'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('\n1️⃣ Testando conexão básica...');

    // Testar listagem de hábitos
    const { data: habits, error: habitsError } = await supabase.from('habits').select('*').limit(5);

    if (habitsError) {
      console.error('❌ Erro ao buscar hábitos:', habitsError.message);
      return false;
    }

    console.log(`✅ Conexão estabelecida! Encontrados ${habits?.length || 0} hábitos.`);

    if (habits && habits.length > 0) {
      console.log('\n📋 Hábitos de exemplo:');
      habits.forEach((habit: any, index: number) => {
        console.log(`   ${index + 1}. ${habit.name} (${habit.category})`);
      });
    } else {
      console.log('\n⚠️  Nenhum hábito encontrado. Execute o seed.sql para popular o banco.');
    }

    // Testar storage buckets
    console.log('\n2️⃣ Testando storage buckets...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

    if (bucketsError) {
      console.error('❌ Erro ao listar buckets:', bucketsError.message);
      return false;
    }

    console.log(`✅ Encontrados ${buckets?.length || 0} storage buckets.`);

    if (buckets && buckets.length > 0) {
      console.log('\n🗂️  Buckets disponíveis:');
      buckets.forEach((bucket: any, index: number) => {
        console.log(`   ${index + 1}. ${bucket.name} (${bucket.public ? 'público' : 'privado'})`);
      });
    }

    console.log('\n✅ Todos os testes passaram com sucesso!\n');
    return true;
  } catch (error) {
    console.error('\n❌ Erro inesperado:', error);
    return false;
  }
}

// Executar testes
testConnection()
  .then((success) => {
    if (success) {
      console.log('🎉 Supabase está configurado corretamente!\n');
      process.exit(0);
    } else {
      console.log('\n❌ Alguns testes falharam. Verifique a configuração.\n');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
