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

    // Não é necessário configurar contexto via RPC - o empresa_id já está no request
    return true;
  }
}
