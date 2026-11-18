import { Request, Response } from 'express';
export default function handleR2Upload(endpoint: string, req: Request, res: Response): Promise<any>;
export declare function simpleUpload(data: Buffer, originalFilename: string, _contentType: string): Promise<string>;
export declare function createMultipartUpload(req: Request, res: Response): Promise<any>;
export declare function prepareUploadParts(req: Request, res: Response): Promise<any>;
export declare function listParts(req: Request, res: Response): Promise<any>;
export declare function completeMultipartUpload(req: Request, res: Response): Promise<any>;
export declare function abortMultipartUpload(req: Request, res: Response): Promise<any>;
export declare function signPart(req: Request, res: Response): Promise<any>;
