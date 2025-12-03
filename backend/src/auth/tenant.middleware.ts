import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private supabaseService: SupabaseService) {}

  // Lista de rotas públicas que não precisam de autenticação
  private readonly publicRoutes = [
    '/auth/login',
    '/api/auth/login',
    '/auth/register',
    '/api/auth/register',
    '/auth/register-empresa',
    '/api/auth/register-empresa',
    '/auth/logout',
    '/api/auth/logout',
  ];

  private isPublicRoute(path: string): boolean {
    // Verificar se o path está na lista de rotas públicas
    return this.publicRoutes.some(route => path === route || path.endsWith(route));
  }

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      // Se for uma rota pública, pular autenticação
      if (this.isPublicRoute(req.path)) {
        console.log(`[TenantMiddleware] Rota pública detectada: ${req.path}, pulando autenticação`);
        return next();
      }

      // Extrair token do header Authorization
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException('Token de autorização não fornecido');
      }

      const token = authHeader.substring(7);

      // SOLUÇÃO TEMPORÁRIA: Aceitar token fake
      if (token.startsWith('fake-token-')) {
        // Para tokens fake, buscar usuário diretamente usando admin client
        const { data: userData, error: userError } = await this.supabaseService
          .getAdminClient()
          .from('usuarios')
          .select(`
            *,
            empresa:empresa_id(*)
          `)
          .eq('email', 'admin@clinica.com')
          .maybeSingle();

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
          empresa_id: userData.empresa_id || userData.empresa?.id, // Garantir que empresa_id está presente
        };

        req['empresa'] = userData.empresa;

        console.log('[TenantMiddleware] Usuário autenticado (fake token):', {
          userId: userData.id,
          email: userData.email,
          empresa_id: userData.empresa_id,
          empresa: userData.empresa,
          cargo: userData.cargo
        });

        // Não é necessário configurar contexto via RPC - o empresa_id já está no request
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

      // Buscar dados do usuário e empresa usando admin client para evitar RLS
      const { data: userData, error: userError } = await this.supabaseService
        .getAdminClient()
        .from('usuarios')
        .select(`
          *,
          empresa:empresa_id(*)
        `)
        .eq('auth_user_id', user.id)
        .maybeSingle();

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
        empresa_id: userData.empresa_id || userData.empresa?.id, // Garantir que empresa_id está presente
      };

      req['empresa'] = userData.empresa;

      console.log('[TenantMiddleware] Usuário autenticado:', {
        userId: user.id,
        email: user.email,
        empresa_id: userData.empresa_id,
        empresa: userData.empresa,
        cargo: userData.cargo
      });

      // Não é necessário configurar contexto via RPC - o empresa_id já está no request
      next();
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Erro na autenticação: ' + error.message);
    }
  }
}
