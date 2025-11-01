import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SupabaseService } from './supabase/supabase.service';

@ApiTags('Database Test')
@Controller('test-db')
export class TestDbController {
  constructor(private readonly supabaseService: SupabaseService) {}

  @Get('tables')
  @ApiOperation({ summary: 'Listar todas as tabelas do banco de dados' })
  async listTables() {
    try {
      const client = this.supabaseService.getClient();
      
      // Listar todas as tabelas
      const tables = [
        'clientelA',
        'usuarios',
        'empresa',
        'consultas',
        'retornos',
        'procedimentos',
        'orcamentos',
        'itens_orcamento',
        'plano_tratamento',
        'itens_plano_tratamento',
        'treatment_sessions',
        'anamnese',
        'notas_cliente',
        'timeline_eventos',
        'annotations'
      ];

      const results: any = {};

      for (const table of tables) {
        try {
          const { data, error, count } = await client
            .from(table)
            .select('*', { count: 'exact', head: true });

          if (error) {
            results[table] = { exists: false, error: error.message };
          } else {
            results[table] = { exists: true, count: count || 0 };
          }
        } catch (err) {
          results[table] = { exists: false, error: err.message };
        }
      }

      return {
        success: true,
        tables: results,
        summary: {
          total: tables.length,
          existing: Object.values(results).filter((r: any) => r.exists).length,
          missing: Object.values(results).filter((r: any) => !r.exists).length
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  @Get('procedimentos')
  @ApiOperation({ summary: 'Testar tabela de procedimentos' })
  async testProcedimentos() {
    try {
      const client = this.supabaseService.getClient();
      
      // Tentar buscar procedimentos
      const { data, error } = await client
        .from('procedimentos')
        .select('*')
        .limit(10);

      if (error) {
        return {
          success: false,
          error: error.message,
          hint: 'Tabela pode não existir ou não ter permissões corretas'
        };
      }

      return {
        success: true,
        data: data || [],
        count: data?.length || 0
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  @Get('stats')
  @ApiOperation({ summary: 'Estatísticas do banco de dados' })
  async getDatabaseStats() {
    try {
      const client = this.supabaseService.getClient();

      const [
        pacientes,
        consultas,
        procedimentos,
        orcamentos,
        retornos
      ] = await Promise.all([
        client.from('clientelA').select('*', { count: 'exact', head: true }),
        client.from('consultas').select('*', { count: 'exact', head: true }),
        client.from('procedimentos').select('*', { count: 'exact', head: true }),
        client.from('orcamentos').select('*', { count: 'exact', head: true }),
        client.from('retornos').select('*', { count: 'exact', head: true })
      ]);

      return {
        success: true,
        stats: {
          pacientes: pacientes.count || 0,
          consultas: consultas.count || 0,
          procedimentos: procedimentos.count || 0,
          orcamentos: orcamentos.count || 0,
          retornos: retornos.count || 0
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

