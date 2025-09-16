import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';

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

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Realizar login' })
  @ApiResponse({ status: 200, description: 'Login realizado com sucesso' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  async login(@Body() loginDto: LoginDto): Promise<any> {
    return this.authService.login(loginDto.email, loginDto.password);
  }

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
    };
    return this.authService.register(registerDto.email, registerDto.password, userData);
  }

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
  async getCurrentUser(@Request() req): Promise<any> {
    // Para tokens fake, retornar dados do usuário atual
    const token = req.headers.authorization?.substring(7);
    if (token?.startsWith('fake-token-')) {
      return {
        id: req.user?.id || 'fake-user-id',
        email: 'admin@clinica.com',
        nome: 'Admin',
        cargo: 'admin',
        role: 'admin',
        empresa: {
          id: 1,
          nome: 'Clínica Exemplo'
        }
      };
    }

    const authUserId = req.user?.id || req.body.auth_user_id;
    
    if (!authUserId) {
      throw new Error('Usuário não autenticado');
    }

    return this.authService.getCurrentUser(authUserId);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Realizar logout' })
  @ApiResponse({ status: 200, description: 'Logout realizado com sucesso' })
  async logout(): Promise<any> {
    return this.authService.logout();
  }
}

















