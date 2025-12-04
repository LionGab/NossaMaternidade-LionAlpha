/**
 * Tests for JSON utilities
 */

import { safeJsonParse, safeJsonStringify } from '@/utils/json';

describe('safeJsonParse', () => {
  it('deve_retornar_valor_padrao_quando_json_for_null_ou_undefined', () => {
    const fallback = { name: 'default' };
    
    expect(safeJsonParse(null, fallback)).toEqual(fallback);
    expect(safeJsonParse(undefined, fallback)).toEqual(fallback);
  });

  it('deve_fazer_parse_valido_quando_json_for_bem_formado', () => {
    const data = { name: 'Maria', age: 30 };
    const json = JSON.stringify(data);
    
    const result = safeJsonParse(json, {});
    
    expect(result).toEqual(data);
  });

  it('deve_retornar_fallback_e_logar_erro_quando_json_for_invalido', () => {
    const fallback = { name: 'default' };
    const invalidJson = '{ invalid json }';
    
    const result = safeJsonParse(invalidJson, fallback, 'TestData');
    
    expect(result).toEqual(fallback);
  });

  it('deve_retornar_fallback_quando_json_parseado_nao_for_do_tipo_esperado_array', () => {
    const fallback: string[] = [];
    const json = '{"name": "not an array"}';
    
    const result = safeJsonParse(json, fallback, 'ArrayData');
    
    expect(result).toEqual(fallback);
    expect(Array.isArray(result)).toBe(true);
  });

  it('deve_fazer_parse_de_arrays_corretamente', () => {
    const data = ['item1', 'item2', 'item3'];
    const json = JSON.stringify(data);
    
    const result = safeJsonParse(json, [], 'ArrayData');
    
    expect(result).toEqual(data);
    expect(Array.isArray(result)).toBe(true);
  });

  it('deve_fazer_parse_de_objetos_complexos', () => {
    const data = {
      user: { name: 'Maria', age: 30 },
      preferences: ['music', 'reading'],
      metadata: { created: '2024-01-01' },
    };
    const json = JSON.stringify(data);
    
    const result = safeJsonParse(json, {}, 'ComplexData');
    
    expect(result).toEqual(data);
  });

  it('deve_retornar_string_vazia_como_fallback_para_strings', () => {
    const result = safeJsonParse(null, '', 'StringData');
    
    expect(result).toBe('');
  });

  it('deve_retornar_numero_zero_como_fallback_para_numeros', () => {
    const result = safeJsonParse(null, 0, 'NumberData');
    
    expect(result).toBe(0);
  });
});

describe('safeJsonStringify', () => {
  it('deve_converter_objeto_para_json_string', () => {
    const data = { name: 'Maria', age: 30 };
    
    const result = safeJsonStringify(data);
    
    expect(result).toBe(JSON.stringify(data));
  });

  it('deve_converter_array_para_json_string', () => {
    const data = ['item1', 'item2'];
    
    const result = safeJsonStringify(data);
    
    expect(result).toBe(JSON.stringify(data));
  });

  it('deve_retornar_string_vazia_quando_stringify_falhar', () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular; // Cria referência circular
    
    const result = safeJsonStringify(circular, 'CircularData');
    
    expect(result).toBe('');
  });

  it('deve_formatar_json_com_indentacao_quando_pretty_for_true', () => {
    const data = { name: 'Maria', age: 30 };
    
    const result = safeJsonStringify(data, 'TestData', true);
    
    expect(result).toContain('\n');
    expect(result).toContain('  '); // Espaços de indentação
  });

  it('deve_converter_valores_primitivos', () => {
    expect(safeJsonStringify('text')).toBe('"text"');
    expect(safeJsonStringify(42)).toBe('42');
    expect(safeJsonStringify(true)).toBe('true');
    expect(safeJsonStringify(null)).toBe('null');
  });
});

