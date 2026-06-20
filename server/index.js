import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import fs from 'fs';
import path from 'url';
import { saveToPersistence as saveToPersistenceLib } from './persistence.js';
import { fetchWallbitRate } from './dolar.js';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';

// Wait, the import path for path above is 'url'? Ah, let me double check line 5 of index.js.
// Line 5 in index.js: "import path from 'path';" - let me make sure we do not introduce a bug or typo!
// Let me write the exact code from index.js.
