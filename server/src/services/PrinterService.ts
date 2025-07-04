
import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

export interface PrinterInfo {
  name: string;
  isDefault: boolean;
  status: 'ready' | 'busy' | 'offline' | 'error';
}

export interface PrintOptions {
  copies: number;
  color: boolean;
  duplex: boolean;
  paperSize: 'A4' | 'Letter';
}

export class PrinterService {
  private availablePrinters: PrinterInfo[] = [];
  private defaultPrinter: string;
  private ready: boolean = false;

  constructor() {
    this.defaultPrinter = process.env.DEFAULT_PRINTER_NAME || '';
    this.initializePrinters();
  }

  private async initializePrinters() {
    try {
      await this.detectPrinters();
      this.ready = true;
      console.log('✅ Printer service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize printer service:', error);
      this.ready = false;
    }
  }

  private async detectPrinters(): Promise<void> {
    try {
      // For Windows, use wmic command to get printer list
      const command = 'wmic printer get name,default,printerstatus /format:csv';
      const output = execSync(command, { encoding: 'utf8' });
      
      const lines = output.split('\n').filter(line => line.trim() && !line.startsWith('Node'));
      const printers: PrinterInfo[] = [];

      for (const line of lines) {
        const parts = line.split(',');
        if (parts.length >= 4) {
          const name = parts[2]?.trim();
          const isDefault = parts[1]?.trim().toLowerCase() === 'true';
          const status = this.mapPrinterStatus(parts[3]?.trim());

          if (name && name !== 'Name') {
            printers.push({ name, isDefault, status });
            
            if (isDefault && !this.defaultPrinter) {
              this.defaultPrinter = name;
            }
          }
        }
      }

      this.availablePrinters = printers;
      console.log(`✅ Found ${printers.length} printer(s):`, printers.map(p => p.name).join(', '));
      
      if (this.defaultPrinter) {
        console.log(`🖨️  Default printer: ${this.defaultPrinter}`);
      }
    } catch (error) {
      console.error('❌ Error detecting printers:', error);
      // Fallback - add a generic printer if none detected
      this.availablePrinters = [{
        name: 'Default Printer',
        isDefault: true,
        status: 'ready'
      }];
    }
  }

  private mapPrinterStatus(status: string): 'ready' | 'busy' | 'offline' | 'error' {
    if (!status) return 'ready';
    
    const statusLower = status.toLowerCase();
    if (statusLower.includes('3') || statusLower.includes('ready')) return 'ready';
    if (statusLower.includes('busy') || statusLower.includes('printing')) return 'busy';
    if (statusLower.includes('offline') || statusLower.includes('off')) return 'offline';
    return 'error';
  }

  async printFile(filePath: string, options: Partial<PrintOptions> = {}): Promise<{ success: boolean; jobId?: string; error?: string }> {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error('File not found');
      }

      const printer = this.defaultPrinter || this.availablePrinters[0]?.name;
      if (!printer) {
        throw new Error('No printer available');
      }

      const printOptions = {
        copies: options.copies || 1,
        color: options.color || false,
        duplex: options.duplex || false,
        paperSize: options.paperSize || 'A4'
      };

      console.log(`🖨️  Printing file: ${filePath} on printer: ${printer}`);

      // Use PowerShell to print on Windows
      const printCommand = this.buildPrintCommand(filePath, printer, printOptions);
      
      return new Promise((resolve) => {
        const process = spawn('powershell', ['-Command', printCommand], {
          stdio: ['pipe', 'pipe', 'pipe']
        });

        let output = '';
        let error = '';

        process.stdout.on('data', (data) => {
          output += data.toString();
        });

        process.stderr.on('data', (data) => {
          error += data.toString();
        });

        process.on('close', (code) => {
          if (code === 0) {
            const jobId = `job_${Date.now()}`;
            console.log(`✅ Print job submitted: ${jobId}`);
            resolve({ success: true, jobId });
          } else {
            console.error(`❌ Print failed with code ${code}:`, error);
            resolve({ success: false, error: error || `Print process exited with code ${code}` });
          }
        });

        process.on('error', (err) => {
          console.error('❌ Print process error:', err);
          resolve({ success: false, error: err.message });
        });
      });
    } catch (error) {
      console.error('❌ Print error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown print error' 
      };
    }
  }

  private buildPrintCommand(filePath: string, printer: string, options: PrintOptions): string {
    // PowerShell command to print PDF files
    const escapedPath = filePath.replace(/'/g, "''");
    const escapedPrinter = printer.replace(/'/g, "''");
    
    return `
      try {
        $file = Get-Item '${escapedPath}'
        $printer = Get-Printer -Name '${escapedPrinter}'
        
        if ($file.Extension -eq '.pdf') {
          # For PDF files, use Adobe Reader or SumatraPDF if available
          $acrobat = Get-Command "AcroRd32.exe" -ErrorAction SilentlyContinue
          $sumatra = Get-Command "SumatraPDF.exe" -ErrorAction SilentlyContinue
          
          if ($acrobat) {
            Start-Process -FilePath $acrobat.Source -ArgumentList "/t", "'${escapedPath}'", "'${escapedPrinter}'" -Wait
          } elseif ($sumatra) {
            Start-Process -FilePath $sumatra.Source -ArgumentList "-print-to", "'${escapedPrinter}'", "'${escapedPath}'" -Wait
          } else {
            # Fallback: Use default Windows print handler
            Start-Process -FilePath "'${escapedPath}'" -Verb Print -Wait
          }
        } else {
          # For image files, use default Windows print handler
          Start-Process -FilePath "'${escapedPath}'" -Verb Print -Wait
        }
        
        Write-Output "Print job submitted successfully"
      } catch {
        Write-Error $_.Exception.Message
        exit 1
      }
    `;
  }

  async getPrinters(): Promise<PrinterInfo[]> {
    return this.availablePrinters;
  }

  async getDefaultPrinter(): Promise<string | null> {
    return this.defaultPrinter || null;
  }

  async setDefaultPrinter(printerName: string): Promise<boolean> {
    try {
      execSync(`powershell -Command "Set-Printer -Name '${printerName}' -SetAsDefault"`, { encoding: 'utf8' });
      this.defaultPrinter = printerName;
      console.log(`✅ Default printer set to: ${printerName}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to set default printer:', error);
      return false;
    }
  }

  async testPrint(printerName?: string): Promise<boolean> {
    try {
      const printer = printerName || this.defaultPrinter;
      if (!printer) {
        throw new Error('No printer specified');
      }

      // Create a simple test page
      const testContent = `
        AutoPrint Test Page
        ==================
        
        Printer: ${printer}
        Date: ${new Date().toLocaleString()}
        Status: Test Print Successful
        
        This is a test print from AutoPrint College system.
      `;

      const testFilePath = path.join('./uploads', 'test_print.txt');
      fs.writeFileSync(testFilePath, testContent);

      const result = await this.printFile(testFilePath);
      
      // Clean up test file
      setTimeout(() => {
        if (fs.existsSync(testFilePath)) {
          fs.unlinkSync(testFilePath);
        }
      }, 5000);

      return result.success;
    } catch (error) {
      console.error('❌ Test print failed:', error);
      return false;
    }
  }

  isReady(): boolean {
    return this.ready && this.availablePrinters.length > 0;
  }

  async refreshPrinters(): Promise<void> {
    await this.detectPrinters();
  }
}
