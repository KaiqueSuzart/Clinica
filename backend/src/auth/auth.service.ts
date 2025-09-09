import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class AuthService {
  constructor(private supabaseService: SupabaseService) {}

  async login(email: string, password: string) {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .auth.signInWithPassword({
          email,
          password,
        });

      if (error) throw error;

      return {
        user: data.user,
        session: data.session,
        message: 'Login realizado com sucesso',
      };
    } catch (error) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
  }

  async register(email: string, password: string, userData: any) {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .auth.signUp({
          email,
          password,
          options: {
            data: userData,
          },
        });

      if (error) throw error;

      return {
        user: data.user,
        message: 'Usuário registrado com sucesso',
      };
    } catch (error) {
      throw new UnauthorizedException('Erro no registro: ' + error.message);
    }
  }

  async logout() {
    try {
      const { error } = await this.supabaseService.getClient().auth.signOut();
      if (error) throw error;

      return { message: 'Logout realizado com sucesso' };
    } catch (error) {
      throw new UnauthorizedException('Erro no logout: ' + error.message);
    }
  }
}














