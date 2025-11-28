import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';

export const EmpresaId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    // O middleware já adiciona empresa_id ao request.user
    const empresaId = request.user?.empresa_id || request.empresa?.id || request.user?.empresa?.id;
    
    console.log('[EmpresaId Decorator] Extraindo empresa_id:', {
      'request.user?.empresa_id': request.user?.empresa_id,
      'request.empresa?.id': request.empresa?.id,
      'request.user?.empresa?.id': request.user?.empresa?.id,
      'resultado': empresaId,
      'tipo': typeof empresaId,
      'user_id': request.user?.id,
      'user_email': request.user?.email
    });
    
    if (!empresaId) {
      console.error('[EmpresaId Decorator] Empresa ID não encontrado no request:', {
        user: request.user,
        empresa: request.empresa
      });
      throw new BadRequestException('Empresa ID não encontrado. Verifique se o usuário está autenticado corretamente.');
    }
    
    return empresaId.toString();
  },
);

export const Empresa = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.empresa || null;
  },
);

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user || null;
  },
);

