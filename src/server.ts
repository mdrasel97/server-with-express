
import express, { NextFunction, Request, Response } from 'express';
import {Pool} from "pg"
import dotenv from 'dotenv'
import path from "path";


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

const logger = (req:Request, res:Response, next:NextFunction)=>{
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}\n`)
next()
}



// GET route
app.get('/',logger, (req: Request, res: Response) => {
  res.send("Hello Next level developer");
});

// POST route
app.post('/users', async (req: Request, res: Response) => {
  const { name, email } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO users(name, email) VALUES($1, $2) RETURNING *`,
      [name, email]
    );

    console.log(result.rows[0]);

    return res.status(201).json({
      success: true,
      message: "Data inserted",
      data: result.rows[0],
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// users get route
app.get("/users", async(req: Request, res:Response)=>{
  try{
    const result = await pool.query(`
      SELECT * FROM users
      `)
      res.status(200).json({
        success: true,
        message: 'users received successfully ',
        data: result.rows
      })

  }catch(err:any){
    res.status(500).json({
      success: false,
      message: err.message,
      details: err
    })
  }
})


// single user 
app.get('/users/:id', async(req: Request, res: Response)=>{
  // console.log(req.params.id)
  // res.send({message: 'api is cool'})
  try{
const result = await pool.query(`SELECT * FROM users WHERE id = $1`, [req.params.id])
if(result.rows.length == 0){
  res.status(404).json({
    success: false,
      message: "user not found",
  })
}else{
    res.status(200).json({
      success: true,
      message: 'user fetched successfully',
      data: result.rows[0]
    })
  }                    
  }catch(err:any){
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
})

app.put('/users/:id', async (req: Request, res: Response) => {
  const { name, email } = req.body;
  const { id } = req.params;

  try {
    const result = await pool.query(
      `UPDATE users 
       SET name=$1, email=$2 
       WHERE id=$3 
       RETURNING *`,
      [name, email, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: result.rows[0],
    });

  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

app.delete('/users/:id', async(req: Request, res: Response)=>{
  // console.log(req.params.id)
  // res.send({message: 'api is cool'})
  try{
const result = await pool.query(`DELETE FROM users WHERE id = $1`, [req.params.id])
if(result.rowCount === 0){
  res.status(404).json({
    success: false,
      message: "user not found",
  })
}else{
    res.status(200).json({
      success: true,
      message: 'user deleted successfully',
      data: result.rows
    })
  }                    
  }catch(err:any){
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
})


// Todos CRUD
app.post('/todos', async (req: Request, res: Response) => {
  const { user_id, title } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO todos(user_id, title) 
       VALUES($1, $2) 
       RETURNING *`,
      [user_id, title]
    );

    return res.status(201).json({
      success: true,
      message: 'Todo created',
      data: result.rows[0],
    });

  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
});


app.use((req, res)=>{
  res.status(404).json({
    success: false,
    message: "route not found",
    path: req.path
  })
})


// Server
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
