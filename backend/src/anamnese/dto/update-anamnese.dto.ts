import { PartialType } from '@nestjs/swagger';
import { CreateAnamneseDto } from './create-anamnese.dto';

export class UpdateAnamneseDto extends PartialType(CreateAnamneseDto) {}
