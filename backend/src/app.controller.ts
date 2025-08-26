import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SupabaseService } from './supabase/supabase.service';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Verificar status da API' })
  @ApiResponse({ status: 200, description: 'API funcionando' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @ApiOperation({ summary: 'Verificar saúde da aplicação' })
  @ApiResponse({ status: 200, description: 'Aplicação saudável' })
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get('test-supabase')
  @ApiOperation({ summary: 'Testar conexão com Supabase' })
  @ApiResponse({ status: 200, description: 'Conexão testada' })
  async testSupabase() {
    return this.supabaseService.testConnection();
  }

  @Get('test-simple')
  @ApiOperation({ summary: 'Teste simples' })
  @ApiResponse({ status: 200, description: 'Teste funcionando' })
  testSimple() {
    return { message: 'App controller funcionando!', timestamp: new Date().toISOString() };
  }

  @Post('setup-database')
  @ApiOperation({ summary: 'Configurar tabelas do banco de dados' })
  @ApiResponse({ status: 200, description: 'Tabelas configuradas' })
  async setupDatabase() {
    try {
      const client = this.supabaseService.getClient();
      
      // Verificar se as tabelas já existem
      const { data: existingTables, error: tablesError } = await client
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .in('table_name', ['treatment_plans', 'treatment_plan_items']);

      if (tablesError) {
        console.error('Erro ao verificar tabelas:', tablesError);
      }

      console.log('Tabelas existentes:', existingTables);

      // Tentar criar as tabelas usando SQL direto
      const { error: createError } = await client
        .from('treatment_plans')
        .select('*')
        .limit(1);

      if (createError) {
        console.error('Erro ao acessar tabela treatment_plans:', createError);
        return {
          success: false,
          message: 'Tabelas não existem. Execute o script SQL no Supabase:',
          script: 'backend/supabase-treatment-plans-SIMPLES.sql',
          error: createError.message
        };
      }

      return {
        success: true,
        message: 'Tabelas já existem',
        existingTables: existingTables?.map(t => t.table_name) || []
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao verificar tabelas',
        error: error.message
      };
    }
  }
}
