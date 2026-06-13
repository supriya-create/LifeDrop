const fs = require('fs');
const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorMiddleware');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const contactRoutes = require('./routes/contactRoutes');
const enquiryRoutes = require('./routes/enquiryRoutes');
const newsletterRoutes = require('./routes/newsletterRoutes');
const hospitalRoutes = require('./routes/hospitalRoutes');
const requestRoutes = require('./routes/requestRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const userRoutes = require('./routes/userRoutes');
const seedDatabase = require('./data/seed');

dotenv.config();
connectDB()
  .then(() => seedDatabase())
  .catch((error) => {
    console.error('Database initialization failed:', error);
    process.exit(1);
  });

const app = express();

fs.mkdirSync(path.join(__dirname, 'uploads'), { recursive: true });

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('trust proxy', 1);
app.use(morgan('combined'));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
}));


app.use((req, res, next) => {
  res.set('Content-Security-Policy', "default-src 'self' data: https://fonts.googleapis.com https://fonts.gstatic.com https://unpkg.com https://maps.google.com https://www.google.com; script-src 'self' 'unsafe-inline' https://unpkg.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com; img-src 'self' data: https://*; font-src https://fonts.googleapis.com https://fonts.gstatic.com; frame-src https://www.google.com https://maps.google.com; connect-src 'self' https://*; object-src 'none'; base-uri 'self';");
  next();
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/inventory', inventoryRoutes);
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: Date.now() });
});
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(express.static(path.join(__dirname, 'index.html')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html', 'home.html'));
});

app.use(errorHandler);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
