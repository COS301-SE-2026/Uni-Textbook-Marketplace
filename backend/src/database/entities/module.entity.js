"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Module = void 0;
const typeorm_1 = require("typeorm");
const university_entity_1 = require("./university.entity");
let Module = class Module {
    id;
    code;
    name;
    faculty;
    semester;
    university;
};
exports.Module = Module;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Module.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        unique: true,
        length: 20,
    }),
    __metadata("design:type", String)
], Module.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Module.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], Module.prototype, "faculty", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", Number)
], Module.prototype, "semester", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => university_entity_1.University, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'university_id' }),
    __metadata("design:type", university_entity_1.University)
], Module.prototype, "university", void 0);
exports.Module = Module = __decorate([
    (0, typeorm_1.Entity)('modules')
], Module);
//# sourceMappingURL=module.entity.js.map