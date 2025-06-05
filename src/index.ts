import express from 'express';
import cors from 'cors';
import newsRoutes from './routes/news.routes';

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/news', newsRoutes);

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
}); 