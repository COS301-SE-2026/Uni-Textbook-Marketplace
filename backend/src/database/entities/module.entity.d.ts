import { University } from './university.entity';
export declare class Module {
    id: string;
    code: string;
    name: string;
    faculty: string;
    semester: number;
    university: University;
}
