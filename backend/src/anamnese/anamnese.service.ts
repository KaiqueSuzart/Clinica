import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateAnamneseDto } from './dto/create-anamnese.dto';
import { UpdateAnamneseDto } from './dto/update-anamnese.dto';

@Injectable()
export class AnamneseService {
  constructor(private supabaseService: SupabaseService) {}

  async create(createAnamneseDto: CreateAnamneseDto, empresaId: string) {
    if (!empresaId) {
      throw new BadRequestException('Empresa ID é obrigatório');
    }

    console.log('🚀 [AnamneseService.create] Criando anamnese:', { createAnamneseDto, empresaId });
    
    try {
      // Verificar se o paciente pertence à empresa antes de criar
      const patientId = Number(createAnamneseDto.cliente_id);
      console.log('🔍 [AnamneseService.create] Verificando paciente:', { patientId, empresaId });
      
      const { data: paciente, error: pacienteError } = await this.supabaseService
        .getAdminClient()
        .from('clientelA')
        .select('id, empresa')
        .eq('id', patientId)
        .maybeSingle();

      if (pacienteError) {
        console.error('❌ [AnamneseService.create] Erro ao buscar paciente:', pacienteError);
        throw new NotFoundException('Erro ao buscar paciente');
      }

      if (!paciente) {
        console.error('❌ [AnamneseService.create] Paciente não encontrado:', patientId);
        throw new NotFoundException('Paciente não encontrado');
      }

      console.log('🔍 [AnamneseService.create] Paciente encontrado:', {
        pacienteId: paciente.id,
        pacienteEmpresa: paciente.empresa,
        empresaId,
        tipos: {
          pacienteEmpresa: typeof paciente.empresa,
          empresaId: typeof empresaId
        }
      });

      // Comparação robusta de empresa_id
      const pacienteEmpresaStr = paciente.empresa?.toString();
      const empresaIdStr = empresaId?.toString();
      const pacienteEmpresaNum = Number(paciente.empresa);
      const empresaIdNum = Number(empresaId);

      let isSameEmpresa = false;
      if (pacienteEmpresaStr === empresaIdStr) {
        isSameEmpresa = true;
        console.log('✅ [AnamneseService.create] Comparação string passou');
      } else if (pacienteEmpresaNum === empresaIdNum && !isNaN(pacienteEmpresaNum) && !isNaN(empresaIdNum)) {
        isSameEmpresa = true;
        console.log('✅ [AnamneseService.create] Comparação número passou');
      } else if (paciente.empresa === empresaId) {
        isSameEmpresa = true;
        console.log('✅ [AnamneseService.create] Comparação direta passou');
      }

      if (!isSameEmpresa) {
        console.error('❌ [AnamneseService.create] Paciente não pertence à empresa:', {
          pacienteEmpresa: pacienteEmpresaStr,
          empresaId: empresaIdStr
        });
        throw new BadRequestException('Paciente não pertence à empresa');
      }

      console.log('✅ [AnamneseService.create] Validação passou, criando anamnese');

      // A tabela anamnese não tem empresa_id diretamente, o filtro é feito via cliente_id -> empresa
      // Então apenas inserimos os dados do DTO (já validamos que o paciente pertence à empresa)
      console.log('📝 [AnamneseService.create] Inserindo anamnese (filtro por empresa via cliente_id):', {
        cliente_id: createAnamneseDto.cliente_id,
        empresaId
      });

      const { data, error } = await this.supabaseService
        .getAdminClient()
        .from('anamnese')
        .insert(createAnamneseDto)
        .select()
        .single();

      if (error) {
        console.error('❌ [AnamneseService.create] Erro do Supabase:', error);
        throw error;
      }
      
      console.log('✅ [AnamneseService.create] Anamnese criada com sucesso:', data);
      return data;
    } catch (err) {
      console.error('❌ [AnamneseService.create] Erro geral:', err);
      throw err;
    }
  }

  async findAll(empresaId: string) {
    if (!empresaId) {
      throw new BadRequestException('Empresa ID é obrigatório');
    }

    // Buscar IDs dos pacientes da empresa primeiro
    const { data: pacientes, error: pacientesError } = await this.supabaseService
      .getClient()
      .from('clientelA')
      .select('id')
      .eq('empresa', empresaId);

    if (pacientesError) throw pacientesError;

    const pacienteIds = pacientes?.map(p => p.id) || [];
    
    if (pacienteIds.length === 0) {
      return [];
    }

    const { data, error } = await this.supabaseService
      .getClient()
      .from('anamnese')
      .select('*')
      .in('cliente_id', pacienteIds)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async findOne(id: string, empresaId: string) {
    if (!empresaId) {
      throw new BadRequestException('Empresa ID é obrigatório');
    }

    // Buscar anamnese e verificar se o paciente pertence à empresa
    const { data, error } = await this.supabaseService
      .getClient()
      .from('anamnese')
      .select(`
        *,
        clientelA!anamnese_cliente_id_fkey (
          empresa
        )
      `)
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException('Anamnese não encontrada');
    }

    // Verificar se o paciente pertence à empresa
    if (data.clientelA?.empresa !== empresaId) {
      throw new NotFoundException('Anamnese não encontrada');
    }

    // Remover dados do cliente do retorno
    const { clientelA, ...anamneseData } = data;
    return anamneseData;
  }

  async findByPatient(patientId: number, empresaId: string) {
    if (!empresaId) {
      throw new BadRequestException('Empresa ID é obrigatório');
    }

    console.log('🔍 [AnamneseService.findByPatient] Buscando anamneses:', { patientId, empresaId, tipos: { patientId: typeof patientId, empresaId: typeof empresaId } });

    // Converter empresaId para número se necessário (o campo empresa no BD é numérico)
    const empresaIdNumFind = Number(empresaId);
    const empresaIdStrFind = empresaId?.toString();

    // Verificar se o paciente pertence à empresa usando filtro direto
    // Tentar primeiro como número, depois como string se necessário
    let { data: paciente, error: pacienteError } = await this.supabaseService
      .getAdminClient()
      .from('clientelA')
      .select('id, empresa')
      .eq('id', patientId)
      .eq('empresa', empresaIdNumFind) // Tentar como número primeiro
      .maybeSingle();

    // Se não encontrou e empresaId é string, tentar como string
    if ((pacienteError || !paciente) && !isNaN(empresaIdNumFind) && empresaIdNumFind.toString() !== empresaIdStrFind) {
      console.log('🔄 [AnamneseService.findByPatient] Tentando buscar como string:', empresaIdStrFind);
      const result = await this.supabaseService
        .getAdminClient()
        .from('clientelA')
        .select('id, empresa')
        .eq('id', patientId)
        .eq('empresa', empresaIdStrFind) // Tentar como string
        .maybeSingle();
      paciente = result.data;
      pacienteError = result.error;
    }

    if (pacienteError) {
      console.error('❌ [AnamneseService.findByPatient] Erro ao buscar paciente:', pacienteError);
      // Tentar buscar sem filtro de empresa para debug
      const { data: pacienteDebug, error: debugError } = await this.supabaseService
        .getAdminClient()
        .from('clientelA')
        .select('id, empresa')
        .eq('id', patientId)
        .maybeSingle();
      
      if (debugError || !pacienteDebug) {
        console.error('❌ [AnamneseService.findByPatient] Paciente não existe no banco:', patientId);
        throw new NotFoundException('Paciente não encontrado');
      }
      
      // Se encontrou o paciente mas não passou no filtro de empresa, significa que não pertence
      console.error('❌ [AnamneseService.findByPatient] Paciente existe mas não pertence à empresa:', {
        pacienteId: pacienteDebug.id,
        pacienteEmpresa: pacienteDebug.empresa,
        empresaId,
        tipos: {
          pacienteEmpresa: typeof pacienteDebug.empresa,
          empresaId: typeof empresaId
        }
      });
      throw new NotFoundException('Paciente não encontrado');
    }

    if (!paciente) {
      console.error('❌ [AnamneseService.findByPatient] Paciente não encontrado ou não pertence à empresa:', { patientId, empresaId });
      throw new NotFoundException('Paciente não encontrado');
    }

    console.log('✅ [AnamneseService.findByPatient] Paciente encontrado e validado:', {
      pacienteId: paciente.id,
      pacienteEmpresa: paciente.empresa,
      empresaId
    });

    try {
      const { data, error } = await this.supabaseService
        .getAdminClient()
        .from('anamnese')
        .select('*')
        .eq('cliente_id', patientId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ [AnamneseService.findByPatient] Erro ao buscar anamneses:', error);
        // Retornar array vazio em vez de lançar erro se não houver anamneses
        if (error.code === 'PGRST116' || error.message?.includes('not found')) {
          console.log('⚠️ [AnamneseService.findByPatient] Nenhuma anamnese encontrada, retornando array vazio');
          return [];
        }
        throw error;
      }

      console.log(`✅ [AnamneseService.findByPatient] Encontradas ${data?.length || 0} anamneses`);
      return data || [];
    } catch (err) {
      console.error('❌ [AnamneseService.findByPatient] Erro completo:', err);
      // Retornar array vazio em caso de erro para não quebrar o frontend
      return [];
    }
  }

  async update(id: string, updateAnamneseDto: UpdateAnamneseDto, empresaId: string) {
    if (!empresaId) {
      throw new BadRequestException('Empresa ID é obrigatório');
    }

    // Verificar se a anamnese pertence à empresa antes de atualizar
    const { data: anamnese, error: anamneseError } = await this.supabaseService
      .getClient()
      .from('anamnese')
      .select(`
        *,
        clientelA!anamnese_cliente_id_fkey (
          empresa
        )
      `)
      .eq('id', id)
      .single();

    if (anamneseError || !anamnese) {
      throw new NotFoundException('Anamnese não encontrada');
    }

    if (anamnese.clientelA?.empresa !== empresaId) {
      throw new NotFoundException('Anamnese não encontrada');
    }

    const { data, error } = await this.supabaseService
      .getClient()
      .from('anamnese')
      .update(updateAnamneseDto)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async remove(id: string, empresaId: string) {
    if (!empresaId) {
      throw new BadRequestException('Empresa ID é obrigatório');
    }

    // Verificar se a anamnese pertence à empresa antes de deletar
    const { data: anamnese, error: anamneseError } = await this.supabaseService
      .getClient()
      .from('anamnese')
      .select(`
        *,
        clientelA!anamnese_cliente_id_fkey (
          empresa
        )
      `)
      .eq('id', id)
      .single();

    if (anamneseError || !anamnese) {
      throw new NotFoundException('Anamnese não encontrada');
    }

    if (anamnese.clientelA?.empresa !== empresaId) {
      throw new NotFoundException('Anamnese não encontrada');
    }

    const { error } = await this.supabaseService
      .getClient()
      .from('anamnese')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { message: 'Anamnese removida com sucesso' };
  }
}
