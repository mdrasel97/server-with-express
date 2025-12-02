import express, { Request, Response } from 'express';
import {Pool} from "pg"
import dotenv from 'dotenv'

dotenv.config({path: path.join(process.cwd(), ".env")})



const app = express();
const port = 5000;

// middleware parser 
app.use(express.json());
// app.use(express.urlencoded())

// DB 
const pool = new Pool({
  connectionString: `${process.env.CONNECTION_STR}`
})

const initDB = async()=>{
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users(
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    age INT,
    phone VARCHAR(15),
    address TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
    )
    `)

    await pool.query(`
      CREATE TABLE IF NOT EXISTS todos(
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(200) NOT NULL,
      description TEXT,
      complete BOOLEAN DEFAULT FALSE,
      due_date DATE,
       created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
      )
      `)
}

initDB()



// GET route
app.get('/', (req: Request, res: Response) => {
  res.send("Hello Next level developer");
});

// POST route
app.post('/', (req: Request, res: Response) => {
  // console.log(req.body);
  res.status(201).json({
    success: true,
    message: 'API is working'
  });
});

// Server
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
