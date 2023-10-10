import express from 'express'
import handlebars from 'express-handlebars'
import { Server } from 'socket.io'
import Sockets from './sockets.js'
import mongoose from 'mongoose'
import session from 'express-session'
import MongoStore from "connect-mongo";
import productsRouter from './routers/product.router.js'
import cartsRouter from './routers/cart.router.js'
import viewsRouter from './routers/views.router.js'
import chatRouter from './routers/chat.router.js'
import sessionViewsRouter from './routers/session.views.router.js'
import sessionRouter from './routers/session.router.js';

const MONGO_URI = 'mongodb+srv://coder:coder@cluster0.tzksvyu.mongodb.net/'
const MONGO_DB_NAME = 'ecommerce'
export const PORT = 8080

const app = express()
app.use(express.json())
app.use(express.static('./src/public'))
app.engine('handlebars', handlebars.engine())
app.set('views', './src/views')
app.set('view engine', 'handlebars')
app.use(express.urlencoded({ extended: true }));


app.use(session ({
  store: MongoStore.create({
    mongoUrl: "mongodb+srv://coder:coder@cluster0.9dp3egu.mongodb.net/",
    dbName: "ecommerce"
  }),
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}))




try {
    await mongoose.connect(MONGO_URI, { 
        dbName: MONGO_DB_NAME,
        useUnifiedTopology: true
    })
    console.log('DB connected!')
    const server = app.listen(PORT, () => console.log('Server Up'))
    const io = new Server(server)
    app.use((req, res, next) => {
        req.io = io
        next()
    })

    
    app.use('/', sessionViewsRouter)
    app.use('/api/sessions', sessionRouter)
    app.use('/api/products', productsRouter)
    app.use('/api/carts', cartsRouter)
    app.use('/products', viewsRouter)
    app.use('/carts', viewsRouter)
    app.use("/chat", chatRouter)
    

    Sockets(io)
} catch(err) {
    console.log('Cannot connect to DB :(  ==> ', err.message)
    process.exit(-1)
}

