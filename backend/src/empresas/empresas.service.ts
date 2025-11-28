import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';

@Injectable()
export class EmpresasService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getDadosEmpresa(empresaId: string) {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('empresa')
        .select('*')
        .eq('id', empresaId)
        .single();

      if (error) {
        console.error('[EmpresasService.getDadosEmpresa] Erro ao buscar dados:', error);
        throw new Error('Erro ao buscar dados da empresa');
      }

      return data;
    } catch (error) {
      console.error('[EmpresasService.getDadosEmpresa] Erro genérico:', error);
      throw new Error('Erro ao buscar dados da empresa');
    }
  }

  async updateDadosEmpresa(empresaId: string, updateData: UpdateEmpresaDto) {
    try {
      // Adicionar timestamp de atualização
      const dataToUpdate = {
        ...updateData,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await this.supabaseService
        .getClient()
        .from('empresa')
        .update(dataToUpdate)
        .eq('id', empresaId)
        .select()
        .single();

      if (error) {
        console.error('[EmpresasService.updateDadosEmpresa] Erro ao atualizar:', error);
        throw new Error('Erro ao atualizar dados da empresa');
      }

      return {
        success: true,
        message: 'Dados da empresa atualizados com sucesso',
        data: data,
      };
    } catch (error) {
      console.error('[EmpresasService.updateDadosEmpresa] Erro genérico:', error);
      throw new Error('Erro ao atualizar dados da empresa');
    }
  }

  async uploadLogo(empresaId: string, file: Express.Multer.File) {
    try {
      if (!file) {
        throw new Error('Nenhum arquivo enviado');
      }

      // Validar tipo de arquivo
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.mimetype)) {
        throw new Error('Tipo de arquivo não permitido. Use JPEG, PNG, GIF ou WebP');
      }

      // Validar tamanho (máximo 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('Arquivo muito grande. Tamanho máximo: 5MB');
      }

      // Converter para base64 para armazenamento temporário
      const base64 = file.buffer.toString('base64');
      const dataUrl = `data:${file.mimetype};base64,${base64}`;

      // Atualizar URL da logo na tabela empresa (usando data URL temporário)
      const { data, error: updateError } = await this.supabaseService
        .getClient()
        .from('empresa')
        .update({ 
          logo_url: dataUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', empresaId)
        .select()
        .single();

      if (updateError) {
        console.error('[EmpresasService.uploadLogo] Erro ao atualizar logo_url:', updateError);
        throw new Error('Erro ao salvar URL da logo');
      }

      return {
        success: true,
        message: 'Logo enviada com sucesso',
        logo_url: dataUrl,
        data: data
      };
    } catch (error) {
      console.error('[EmpresasService.uploadLogo] Erro genérico:', error);
      throw new Error(error.message || 'Erro ao fazer upload da logo');
    }
  }
}