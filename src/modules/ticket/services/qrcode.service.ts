import * as fs from 'fs';
import * as path from 'path';

import { Injectable } from '@nestjs/common';

import * as QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class QRCodeService {
  /**
   * Generates a QR code from the provided data and saves it as a file.
   * @param {string} data - The data to encode in the QR code.
   * @returns {Promise<string>} The file path where the QR code is saved.
   */
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
