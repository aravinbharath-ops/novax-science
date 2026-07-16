CREATE TABLE IF NOT EXISTS certificates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  serial_number TEXT NOT NULL UNIQUE,
  product_name TEXT NOT NULL,
  strength TEXT NOT NULL,
  task_number TEXT,
  batch_number TEXT,
  analysis_date TEXT,
  measured_result TEXT,
  purity TEXT,
  certificate_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_certificates_serial
ON certificates(serial_number);
