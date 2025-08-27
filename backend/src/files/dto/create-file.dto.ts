import { IsNotEmpty, IsString, IsUUID, IsEnum, IsOptional, IsNumber } from 'class-validator';

export enum FileCategory {
  IMAGE = 'image',
  DOCUMENT = 'document',
  XRAY = 'xray',
  REPORT = 'report'
}

export class CreateFileDto {
  @IsNotEmpty()
  @IsUUID()
  patient_id: string;

  @IsNotEmpty()
  @IsString()
  original_filename: string;

  @IsNotEmpty()
  @IsString()
  mime_type: string;

  @IsNotEmpty()
  @IsNumber()
  file_size: number;

  @IsNotEmpty()
  @IsEnum(FileCategory)
  category: FileCategory;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  uploaded_by?: string;
}
