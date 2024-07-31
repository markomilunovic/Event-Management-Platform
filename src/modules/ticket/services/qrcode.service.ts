import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class QRCodeService {
    async generateQRCodeAndSaveFile(data: string): Promise<string> {
        const filename = `${uuidv4()}.png`;
        const directory = 'qr_codes';
        const filePath = path.join(directory, filename);
        
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, { recursive: true });
        }

        await QRCode.toFile(filePath, data);

        return filePath;
    }
}
