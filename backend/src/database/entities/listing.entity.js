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
exports.Listing = exports.ListingStatus = void 0;
const typeorm_1 = require("typeorm");
const users_entity_1 = require("./users.entity");
const book_entity_1 = require("./book.entity");
const module_entity_1 = require("./module.entity");
var ListingStatus;
(function (ListingStatus) {
    ListingStatus["PENDING"] = "PENDING";
    ListingStatus["APPROVED"] = "APPROVED";
    ListingStatus["REJECTED"] = "REJECTED";
    ListingStatus["SOFT_DELETED"] = "SOFT_DELETED";
})(ListingStatus || (exports.ListingStatus = ListingStatus = {}));
let Listing = class Listing {
    id;
    title;
    seller;
    book;
    module;
    condition;
    annotation_level;
    price;
    reviewer;
    reviewed_at;
    photo_urls;
    status;
    has_notes;
    created_at;
    updated_at;
    deleted_at;
};
exports.Listing = Listing;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Listing.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200, nullable: true }),
    __metadata("design:type", String)
], Listing.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => users_entity_1.User, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'seller_id' }),
    __metadata("design:type", users_entity_1.User)
], Listing.prototype, "seller", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => book_entity_1.Book, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'book_id' }),
    __metadata("design:type", book_entity_1.Book)
], Listing.prototype, "book", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => module_entity_1.Module, {
        nullable: true,
        onDelete: 'SET NULL',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'module_id' }),
    __metadata("design:type", module_entity_1.Module)
], Listing.prototype, "module", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['new', 'good', 'fair', 'poor'],
    }),
    __metadata("design:type", String)
], Listing.prototype, "condition", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['none', 'light', 'heavy'],
    }),
    __metadata("design:type", String)
], Listing.prototype, "annotation_level", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 10,
        scale: 2,
    }),
    __metadata("design:type", Number)
], Listing.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => users_entity_1.User, {
        nullable: true,
        onDelete: 'SET NULL',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'reviewed_by' }),
    __metadata("design:type", users_entity_1.User)
], Listing.prototype, "reviewer", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'timestamptz',
        nullable: true,
    }),
    __metadata("design:type", Date)
], Listing.prototype, "reviewed_at", void 0);
__decorate([
    (0, typeorm_1.Column)('text', {
        array: true,
        default: [],
    }),
    __metadata("design:type", Array)
], Listing.prototype, "photo_urls", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ListingStatus,
        default: ListingStatus.PENDING,
    }),
    __metadata("design:type", String)
], Listing.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        default: false,
    }),
    __metadata("design:type", Boolean)
], Listing.prototype, "has_notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: 'timestamptz',
    }),
    __metadata("design:type", Date)
], Listing.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: 'timestamptz',
        nullable: true,
    }),
    __metadata("design:type", Date)
], Listing.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({
        type: 'timestamptz',
        nullable: true,
    }),
    __metadata("design:type", Date)
], Listing.prototype, "deleted_at", void 0);
exports.Listing = Listing = __decorate([
    (0, typeorm_1.Entity)('listings')
], Listing);
//# sourceMappingURL=listing.entity.js.map