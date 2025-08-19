import { IsString, IsOptional, IsBoolean, IsDateString, IsNumber } from 'class-validator';

export class CreateAnamneseDto {
  @IsNumber()
  cliente_id: number;

  @IsString()
  @IsOptional()
  alergias?: string;

  @IsString()
  @IsOptional()
  medicamentos_uso?: string;

  @IsString()
  @IsOptional()
  historico_medico?: string;

  @IsString()
  @IsOptional()
  historico_odontologico?: string;

  @IsString()
  @IsOptional()
  habitos?: string;

  @IsString()
  @IsOptional()
  queixa_principal?: string;

  @IsBoolean()
  @IsOptional()
  consentimento?: boolean;

  @IsDateString()
  @IsOptional()
  data_consentimento?: string;

  @IsBoolean()
  @IsOptional()
  diabetes?: boolean;

  @IsString()
  @IsOptional()
  diabetes_notes?: string;

  @IsBoolean()
  @IsOptional()
  hypertension?: boolean;

  @IsString()
  @IsOptional()
  hypertension_notes?: string;

  @IsBoolean()
  @IsOptional()
  heart_problems?: boolean;

  @IsString()
  @IsOptional()
  heart_problems_notes?: string;

  @IsBoolean()
  @IsOptional()
  pregnant?: boolean;

  @IsString()
  @IsOptional()
  pregnant_notes?: string;

  @IsBoolean()
  @IsOptional()
  smoking?: boolean;

  @IsString()
  @IsOptional()
  smoking_notes?: string;

  @IsBoolean()
  @IsOptional()
  alcohol?: boolean;

  @IsString()
  @IsOptional()
  alcohol_notes?: string;

  @IsBoolean()
  @IsOptional()
  toothache?: boolean;

  @IsString()
  @IsOptional()
  toothache_notes?: string;

  @IsBoolean()
  @IsOptional()
  gum_bleeding?: boolean;

  @IsString()
  @IsOptional()
  gum_bleeding_notes?: string;

  @IsBoolean()
  @IsOptional()
  sensitivity?: boolean;

  @IsString()
  @IsOptional()
  sensitivity_notes?: string;

  @IsBoolean()
  @IsOptional()
  bad_breath?: boolean;

  @IsString()
  @IsOptional()
  bad_breath_notes?: string;

  @IsBoolean()
  @IsOptional()
  jaw_pain?: boolean;

  @IsString()
  @IsOptional()
  jaw_pain_notes?: string;

  @IsBoolean()
  @IsOptional()
  previous_treatments?: boolean;

  @IsString()
  @IsOptional()
  previous_treatments_notes?: string;

  @IsBoolean()
  @IsOptional()
  orthodontics?: boolean;

  @IsString()
  @IsOptional()
  orthodontics_notes?: string;

  @IsBoolean()
  @IsOptional()
  surgeries?: boolean;

  @IsString()
  @IsOptional()
  surgeries_notes?: string;

  @IsBoolean()
  @IsOptional()
  anesthesia_reaction?: boolean;

  @IsString()
  @IsOptional()
  anesthesia_reaction_notes?: string;
}
