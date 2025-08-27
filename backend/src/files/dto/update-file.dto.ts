import { PartialType } from '@nestjs/mapped-types';
import { CreateFileDto } from './create-file.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateFileDto extends PartialType(CreateFileDto) {
  @IsOptional()
  @IsString()
  description?: string;
}
