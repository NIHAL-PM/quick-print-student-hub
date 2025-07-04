
import sqlite3 from 'sqlite3';
import { Database } from 'sqlite3';
import path from 'path';

export interface PrintJob {
  id: string;
  studentName: string;
  phoneNumber: string;
  fileName: string;
  fileUrl: string;
  pages: number;
  cost: number;
  status: 'pending' | 'printing' | 'completed' | 'failed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  transactionId?: string;
  estimatedTime: number;
  progress?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  jobId: string;
  amount: number;
  currency: string;
  paymentId?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  gateway: 'razorpay' | 'upi';
  createdAt: Date;
  updatedAt: Date;
}

export class DatabaseService {
  private db: Database;
  private dbPath: string;
  private connected: boolean = false;

  constructor() {
    this.dbPath = process.env.DATABASE_PATH || './data/autoprint.db';
  }

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('❌ Database connection failed:', err);
          reject(err);
          return;
        }
        
        console.log('✅ Connected to SQLite database');
        this.connected = true;
        this.createTables().then(resolve).catch(reject);
      });
    });
  }

  private async createTables(): Promise<void> {
    const createPrintJobsTable = `
      CREATE TABLE IF NOT EXISTS print_jobs (
        id TEXT PRIMARY KEY,
        studentName TEXT NOT NULL,
        phoneNumber TEXT NOT NULL,
        fileName TEXT NOT NULL,
        fileUrl TEXT NOT NULL,
        pages INTEGER NOT NULL,
        cost REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        paymentStatus TEXT DEFAULT 'pending',
        transactionId TEXT,
        estimatedTime INTEGER DEFAULT 0,
        progress INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createPaymentsTable = `
      CREATE TABLE IF NOT EXISTS payments (
        id TEXT PRIMARY KEY,
        jobId TEXT NOT NULL,
        amount REAL NOT NULL,
        currency TEXT DEFAULT 'INR',
        paymentId TEXT,
        status TEXT DEFAULT 'pending',
        gateway TEXT DEFAULT 'razorpay',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (jobId) REFERENCES print_jobs (id)
      )
    `;

    const createIndexes = `
      CREATE INDEX IF NOT EXISTS idx_print_jobs_phone ON print_jobs(phoneNumber);
      CREATE INDEX IF NOT EXISTS idx_print_jobs_status ON print_jobs(status);
      CREATE INDEX IF NOT EXISTS idx_payments_job ON payments(jobId);
    `;

    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run(createPrintJobsTable);
        this.db.run(createPaymentsTable);
        this.db.run(createIndexes, (err) => {
          if (err) {
            reject(err);
          } else {
            console.log('✅ Database tables created/verified');
            resolve();
          }
        });
      });
    });
  }

  // Print Jobs CRUD operations
  async createPrintJob(job: Omit<PrintJob, 'createdAt' | 'updatedAt'>): Promise<string> {
    const sql = `
      INSERT INTO print_jobs (
        id, studentName, phoneNumber, fileName, fileUrl, pages, cost,
        status, paymentStatus, transactionId, estimatedTime, progress
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      job.id, job.studentName, job.phoneNumber, job.fileName, job.fileUrl,
      job.pages, job.cost, job.status, job.paymentStatus, job.transactionId,
      job.estimatedTime, job.progress || 0
    ];

    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(job.id);
        }
      });
    });
  }

  async getPrintJob(id: string): Promise<PrintJob | null> {
    const sql = 'SELECT * FROM print_jobs WHERE id = ?';
    
    return new Promise((resolve, reject) => {
      this.db.get(sql, [id], (err, row: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(row ? this.mapRowToPrintJob(row) : null);
        }
      });
    });
  }

  async updatePrintJob(id: string, updates: Partial<PrintJob>): Promise<void> {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    const sql = `UPDATE print_jobs SET ${fields}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`;
    
    return new Promise((resolve, reject) => {
      this.db.run(sql, [...values, id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async getPrintJobsByPhone(phoneNumber: string): Promise<PrintJob[]> {
    const sql = 'SELECT * FROM print_jobs WHERE phoneNumber = ? ORDER BY createdAt DESC';
    
    return new Promise((resolve, reject) => {
      this.db.all(sql, [phoneNumber], (err, rows: any[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => this.mapRowToPrintJob(row)));
        }
      });
    });
  }

  async getPrintJobsByStatus(status: string): Promise<PrintJob[]> {
    const sql = 'SELECT * FROM print_jobs WHERE status = ? ORDER BY createdAt ASC';
    
    return new Promise((resolve, reject) => {
      this.db.all(sql, [status], (err, rows: any[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => this.mapRowToPrintJob(row)));
        }
      });
    });
  }

  async getAllPrintJobs(): Promise<PrintJob[]> {
    const sql = 'SELECT * FROM print_jobs ORDER BY createdAt DESC LIMIT 100';
    
    return new Promise((resolve, reject) => {
      this.db.all(sql, [], (err, rows: any[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => this.mapRowToPrintJob(row)));
        }
      });
    });
  }

  // Payment CRUD operations
  async createPayment(payment: Omit<Payment, 'createdAt' | 'updatedAt'>): Promise<string> {
    const sql = `
      INSERT INTO payments (id, jobId, amount, currency, paymentId, status, gateway)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      payment.id, payment.jobId, payment.amount, payment.currency,
      payment.paymentId, payment.status, payment.gateway
    ];

    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(payment.id);
        }
      });
    });
  }

  async updatePayment(id: string, updates: Partial<Payment>): Promise<void> {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    const sql = `UPDATE payments SET ${fields}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`;
    
    return new Promise((resolve, reject) => {
      this.db.run(sql, [...values, id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  private mapRowToPrintJob(row: any): PrintJob {
    return {
      id: row.id,
      studentName: row.studentName,
      phoneNumber: row.phoneNumber,
      fileName: row.fileName,
      fileUrl: row.fileUrl,
      pages: row.pages,
      cost: row.cost,
      status: row.status,
      paymentStatus: row.paymentStatus,
      transactionId: row.transactionId,
      estimatedTime: row.estimatedTime,
      progress: row.progress,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt)
    };
  }

  isConnected(): boolean {
    return this.connected;
  }

  async close(): Promise<void> {
    return new Promise((resolve) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            console.error('Error closing database:', err);
          } else {
            console.log('✅ Database connection closed');
          }
          this.connected = false;
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}
