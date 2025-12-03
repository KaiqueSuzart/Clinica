import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';

class LoginDto {
  email: string;
  password: string;
}

class RegisterDto {
  email: string;
  password: string;
  nome: string;
  empresa_id?: number;
  cargo?: string;
  role?: string;
  permissoes?: any; // Permissões customizadas (opcional, será gerado automaticamente se não fornecido)
}

class RegisterEmpresaDto {
  // Dados do usuário
  email: string;
  password: string;
  nome: string;
  cargo?: string;
  role?: string;
  
  // Dados da empresa
  nome_empresa: string;
  email_empresa: string;
  cnpj?: string;
  telefone_empresa?: string;
  endereco?: string;
}

class SwitchEmpresaDto {
  empresa_id: number;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Realizar login' })
  @ApiResponse({ status: 200, description: 'Login realizado com sucesso' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  async login(@Body() loginDto: LoginDto): Promise<any> {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Registrar novo usuário em empresa existente' })
  @ApiResponse({ status: 201, description: 'Usuário registrado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async register(@Body() registerDto: RegisterDto): Promise<any> {
    const userData = {
      nome: registerDto.nome,
      empresa_id: registerDto.empresa_id,
      cargo: registerDto.cargo || 'funcionario',
      role: registerDto.role || 'user',
      permissoes: registerDto.permissoes, // Se fornecido, será usado; senão será gerado automaticamente
    };
    return this.authService.register(registerDto.email, registerDto.password, userData);
  }

  @Public()
  @Post('register-empresa')
  @ApiOperation({ summary: 'Registrar nova empresa e usuário administrador' })
  @ApiResponse({ status: 201, description: 'Empresa e usuário registrados com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async registerEmpresa(@Body() registerEmpresaDto: RegisterEmpresaDto): Promise<any> {
    const empresaData = {
      nome: registerEmpresaDto.nome_empresa,
      email_empresa: registerEmpresaDto.email_empresa,
      cnpj: registerEmpresaDto.cnpj,
      telefone_empresa: registerEmpresaDto.telefone_empresa,
      endereco: registerEmpresaDto.endereco,
    };

    const userData = {
      nome: registerEmpresaDto.nome,
      cargo: registerEmpresaDto.cargo || 'admin',
      role: registerEmpresaDto.role || 'admin',
    };

    return this.authService.registerEmpresa(
      registerEmpresaDto.email,
      registerEmpresaDto.password,
      empresaData,
      userData
    );
  }

  @Post('switch-empresa')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Alterar empresa do usuário logado' })
  @ApiResponse({ status: 200, description: 'Empresa alterada com sucesso' })
  @ApiResponse({ status: 401, description: 'Usuário não autorizado' })
  async switchEmpresa(@Body() switchEmpresaDto: SwitchEmpresaDto, @Request() req): Promise<any> {
    // Aqui você precisaria implementar um guard para extrair o authUserId do token
    // Por enquanto, vou assumir que está no header ou body
    const authUserId = req.user?.id || req.body.auth_user_id;
    
    if (!authUserId) {
      throw new Error('Usuário não autenticado');
    }

    return this.authService.switchEmpresa(authUserId, switchEmpresaDto.empresa_id);
  }

  @Get('me')
  @ApiOperation({ summary: 'Obter dados do usuário atual' })
  @ApiResponse({ status: 200, description: 'Dados do usuário' })
  @ApiResponse({ status: 401, description: 'Usuário não autenticado' })
  @ApiBearerAuth()
  async getCurrentUser(@Request() req): Promise<any> {
    try {
      // O middleware já adiciona req.user e req.empresa
      const user = req.user;
      const empresa = req.empresa;

      if (!user) {
        throw new UnauthorizedException('Usuário não autenticado');
      }

      // Retornar dados do usuário com empresa
      return {
        id: user.id,
        email: user.email,
        nome: user.nome,
        cargo: user.cargo,
        role: user.cargo?.toLowerCase() || 'funcionario',
        empresa_id: user.empresa_id,
        empresa: empresa || null,
        permissoes: user.permissoes || {},
        ativo: user.ativo !== false
      };
    } catch (error) {
      console.error('[AuthController.getCurrentUser] Erro:', error);
      if (error instanceof UnauthorizedException) {
        throw error;
    }
      throw new UnauthorizedException('Erro ao obter dados do usuário');
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Realizar logout' })
  @ApiResponse({ status: 200, description: 'Logout realizado com sucesso' })
  async logout(): Promise<any> {
    return this.authService.logout();
  }
}

















