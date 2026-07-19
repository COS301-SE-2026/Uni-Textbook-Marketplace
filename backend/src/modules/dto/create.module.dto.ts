export class CreateModuleDto {
  code: string;
  name: string;
  faculty?: string;
  faculty_id?: string;
  semester?: number;
  university_id: string;
  university?: string;
}
