import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private supabaseService: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // Verificar se o usuário está autenticado
    if (!request.user) {
      throw new UnauthorizedException('Usuário não autenticado');
    }

    // Verificar se a empresa está definida
    if (!request.empresa) {
      throw new UnauthorizedException('Empresa não definida');
    }

    // Configurar contexto da empresa no Supabase
    try {
      await this.supabaseService
        .getClient()
        .rpc('set_config', {
          setting_name: 'app.current_empresa_id',
          setting_value: request.user.empresa_id.toString(),
          is_local: true
        });
    } catch (error) {
      console.error('Erro ao configurar contexto da empresa:', error);
    }

    return true;
  }
}
