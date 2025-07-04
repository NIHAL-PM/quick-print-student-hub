
import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import multer from 'multer';

export interface FileProcessingResult {
  fileName: string;
  pages: number;
  cost: number;
  fileType: 'pdf' | 'image';
  fileSize: number;
  fileUrl: string;
}

export class FileService {
  private uploadDir: string;
  private maxFileSize: number;
  private multerUpload: multer.Multer;

  constructor() {
    this.uploadDir = process.env.UPLOADS_PATH || './uploads';
    this.maxFileSize = parseInt(process.env.MAX_FILE_SIZE || '10485760'); // 10MB default
    
    // Ensure uploads directory exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }

    // Configure multer for file uploads
    this.multerUpload = multer({
      dest: this.uploadDir,
      limits: {
        fileSize: this.maxFileSize
      },
      fileFilter: (req, file, cb) => {
        const allowedTypes = [
          'application/pdf',
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/webp'
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Invalid file type. Only PDF and images are allowed.'));
        }
      }
    });
  }

  getMulterUpload() {
    return this.multerUpload;
  }

  async processFile(filePath: string, originalName: string): Promise<FileProcessingResult> {
    const fileExtension = path.extname(originalName).toLowerCase();
    const fileStats = fs.statSync(filePath);
    const pricePerPage = parseFloat(process.env.PRICE_PER_PAGE || '5');

    let result: FileProcessingResult;

    try {
      if (fileExtension === '.pdf') {
        result = await this.processPDF(filePath, originalName, fileStats.size, pricePerPage);
      } else {
        result = await this.processImage(filePath, originalName, fileStats.size, pricePerPage);
      }

      console.log(`✅ File processed: ${originalName}, Pages: ${result.pages}, Cost: ₹${result.cost}`);
      return result;
    } catch (error) {
      console.error('❌ File processing error:', error);
      throw new Error(`Failed to process file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async processPDF(filePath: string, originalName: string, fileSize: number, pricePerPage: number): Promise<FileProcessingResult> {
    try {
      // Read PDF file
      const pdfBytes = fs.readFileSync(filePath);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pageCount = pdfDoc.getPageCount();

      // Calculate cost
      const cost = pageCount * pricePerPage;

      // Generate new filename with timestamp
      const timestamp = Date.now();
      const sanitizedName = this.sanitizeFileName(originalName);
      const newFileName = `${timestamp}_${sanitizedName}`;
      const newFilePath = path.join(this.uploadDir, newFileName);

      // Move and rename file
      fs.renameSync(filePath, newFilePath);

      return {
        fileName: sanitizedName,
        pages: pageCount,
        cost,
        fileType: 'pdf',
        fileSize,
        fileUrl: `/uploads/${newFileName}`
      };
    } catch (error) {
      throw new Error(`PDF processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async processImage(filePath: string, originalName: string, fileSize: number, pricePerPage: number): Promise<FileProcessingResult> {
    try {
      // Process image with sharp for optimization
      const timestamp = Date.now();
      const sanitizedName = this.sanitizeFileName(originalName);
      const newFileName = `${timestamp}_${sanitizedName}`;
      const newFilePath = path.join(this.uploadDir, newFileName);

      // Optimize image (convert to high-quality PDF-ready format)
      await sharp(filePath)
        .png({ quality: 100 })
        .toFile(newFilePath);

      // Remove original file
      fs.unlinkSync(filePath);

      // Images are always 1 page
      const cost = 1 * pricePerPage;

      return {
        fileName: sanitizedName,
        pages: 1,
        cost,
        fileType: 'image',
        fileSize,
        fileUrl: `/uploads/${newFileName}`
      };
    } catch (error) {
      throw new Error(`Image processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private sanitizeFileName(fileName: string): string {
    // Remove or replace unsafe characters
    return fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  }

  async deleteFile(fileUrl: string): Promise<void> {
    try {
      const fileName = path.basename(fileUrl);
      const filePath = path.join(this.uploadDir, fileName);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`✅ File deleted: ${fileName}`);
      }
    } catch (error) {
      console.error('❌ Error deleting file:', error);
    }
  }

  // Clean up old files (run periodically)
  async cleanupOldFiles(olderThanHours: number = 24): Promise<void> {
    try {
      const files = fs.readdirSync(this.uploadDir);
      const cutoffTime = Date.now() - (olderThanHours * 60 * 60 * 1000);

      let deletedCount = 0;
      for (const file of files) {
        const filePath = path.join(this.uploadDir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtimeMs < cutoffTime) {
          fs.unlinkSync(filePath);
          deletedCount++;
        }
      }

      if (deletedCount > 0) {
        console.log(`🧹 Cleaned up ${deletedCount} old file(s)`);
      }
    } catch (error) {
      console.error('❌ Error during file cleanup:', error);
    }
  }

  // Convert image to PDF for printing
  async convertImageToPDF(imagePath: string): Promise<string> {
    try {
      const pdfDoc = await PDFDocument.create();
      const imageBytes = fs.readFileSync(imagePath);
      
      let image;
      const ext = path.extname(imagePath).toLowerCase();
      
      if (ext === '.png') {
        image = await pdfDoc.embedPng(imageBytes);
      } else {
        image = await pdfDoc.embedJpg(imageBytes);
      }

      const page = pdfDoc.addPage([image.width, image.height]);
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: image.width,
        height: image.height,
      });

      const pdfBytes = await pdfDoc.save();
      const pdfPath = imagePath.replace(/\.(jpg|jpeg|png|webp)$/i, '.pdf');
      
      fs.writeFileSync(pdfPath, pdfBytes);
      
      return pdfPath;
    } catch (error) {
      throw new Error(`Image to PDF conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
