"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminAddTeamMemberDto = void 0;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
class AdminAddTeamMemberDto {
}
exports.AdminAddTeamMemberDto = AdminAddTeamMemberDto;
tslib_1.__decorate([
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsEmail)(),
    tslib_1.__metadata("design:type", String)
], AdminAddTeamMemberDto.prototype, "email", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['USER', 'ADMIN']),
    tslib_1.__metadata("design:type", String)
], AdminAddTeamMemberDto.prototype, "role", void 0);
//# sourceMappingURL=admin.add.team.member.dto.js.map