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
exports.University = void 0;
const typeorm_1 = require("typeorm");
const users_entity_1 = require("./users.entity");
const module_entity_1 = require("./module.entity");
let University = class University {
    id;
    name;
    email_domain;
    users;
    modules;
};
exports.University = University;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], University.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], University.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        unique: true,
    }),
    __metadata("design:type", String)
], University.prototype, "email_domain", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => users_entity_1.User, (user) => user.university),
    __metadata("design:type", Array)
], University.prototype, "users", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => module_entity_1.Module, (module) => module.university),
    __metadata("design:type", Array)
], University.prototype, "modules", void 0);
exports.University = University = __decorate([
    (0, typeorm_1.Entity)('universities')
], University);
//# sourceMappingURL=university.entity.js.map