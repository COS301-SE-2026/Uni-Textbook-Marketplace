"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const dotenv = __importStar(require("dotenv"));
const users_entity_1 = require("./database/entities/users.entity");
const listing_entity_1 = require("./database/entities/listing.entity");
const book_entity_1 = require("./database/entities/book.entity");
const module_entity_1 = require("./database/entities/module.entity");
const university_entity_1 = require("./database/entities/university.entity");
const otps_entity_1 = require("./database/entities/otps.entity");
const audit_log_entity_1 = require("./database/entities/audit_log.entity");
dotenv.config();
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    url: 'postgres://nexusdev:nexusdev_local@localhost:5432/textbook_marketplace',
    synchronize: false,
    logging: true,
    entities: [users_entity_1.User, listing_entity_1.Listing, book_entity_1.Book, module_entity_1.Module, university_entity_1.University, otps_entity_1.OTP, audit_log_entity_1.AuditLog],
    migrations: ['src/database/migrations/*.ts'],
});
//# sourceMappingURL=data-source.js.map