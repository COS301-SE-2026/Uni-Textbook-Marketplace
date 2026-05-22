export class CreateModuleDto {
  code: string;
  name: string;
  faculty?: string;
  semester?: number;
  university_id: string;
}
