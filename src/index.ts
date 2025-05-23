import  express from 'express';
import dotnev from 'dotenv';
import { sequelize } from './db/db';
import homeRouters from './routes/home.router';
dotnev.config();
const app = express();
const port = process.env.PORT || '5000';

// Middleware to parse JSON
app.use(express.json());

//connect to main router
app.use('/api',homeRouters);

// Test DB Connection and Start Server
sequelize.authenticate().then(()=>{console.log('Database Connected✅');
    return sequelize.sync();
}).then(()=>{
    app.listen(port,()=>{
        console.log(`🚀 Server is running at http://localhost:${port}`);
    })
}).catch((err)=>{
    console.error('❌ Unable to connect to the database:', err);
});