import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private supabaseService: SupabaseService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      // Extrair token do header Authorization
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException('Token de autorização não fornecido');
      }

      const token = authHeader.substring(7);

      // SOLUÇÃO TEMPORÁRIA: Aceitar token fake
      if (token.startsWith('fake-token-')) {
        // Para tokens fake, buscar usuário diretamente
        const { data: userData, error: userError } = await this.supabaseService
          .getClient()
          .from('usuarios')
          .select(`
            *,
            empresa:empresa_id(*)
          `)
          .eq('email', 'admin@clinica.com')
          .single();

        if (userError || !userData) {
          throw new UnauthorizedException('Usuário não encontrado');
        }

        if (!userData.ativo) {
          throw new UnauthorizedException('Usuário inativo');
        }

        // Adicionar dados do usuário e empresa ao request
        req['user'] = {
          id: userData.id,
          email: userData.email,
          ...userData,
        };

        req['empresa'] = userData.empresa;

        // Configurar contexto da empresa no Supabase
        await this.supabaseService
          .getClient()
          .rpc('set_config', {
            setting_name: 'app.current_empresa_id',
            setting_value: userData.empresa_id.toString(),
            is_local: true
          });

        next();
        return;
      }

      // Verificar token com Supabase (para tokens reais)
      const { data: { user }, error } = await this.supabaseService
        .getClient()
        .auth.getUser(token);

      if (error || !user) {
        throw new UnauthorizedException('Token inválido');
      }

      // Buscar dados do usuário e empresa
      const { data: userData, error: userError } = await this.supabaseService
        .getClient()
        .from('usuarios')
        .select(`
          *,
          empresa:empresa_id(*)
        `)
        .eq('auth_user_id', user.id)
        .single();

      if (userError || !userData) {
        throw new UnauthorizedException('Usuário não encontrado');
      }

      if (!userData.ativo) {
        throw new UnauthorizedException('Usuário inativo');
      }

      // Adicionar dados do usuário e empresa ao request
      req['user'] = {
        id: user.id,
        email: user.email,
        ...userData,
      };

      req['empresa'] = userData.empresa;

      // Configurar contexto da empresa no Supabase
      await this.supabaseService
        .getClient()
        .rpc('set_config', {
          setting_name: 'app.current_empresa_id',
          setting_value: userData.empresa_id.toString(),
          is_local: true
        });

      next();
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Erro na autenticação: ' + error.message);
    }
  }
}
