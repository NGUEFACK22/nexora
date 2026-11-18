import { ThirdPartyAbstract } from '@gitroom/nestjs-libraries/3rdparties/thirdparty.interface';
export declare class HubspotProvider extends ThirdPartyAbstract {
    checkConnection(): Promise<false>;
    sendData(): Promise<string>;
}
