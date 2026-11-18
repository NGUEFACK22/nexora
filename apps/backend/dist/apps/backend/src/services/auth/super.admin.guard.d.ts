import { CanActivate, ExecutionContext } from '@nestjs/common';
import { OrganizationService } from '@gitroom/nestjs-libraries/database/prisma/organizations/organization.service';
export declare class SuperAdminGuard implements CanActivate {
    private _organizationService;
    constructor(_organizationService: OrganizationService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
