import { MigrationInterface, QueryRunner } from "typeorm";
export declare class AddOtpAttempts1778578863729 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
