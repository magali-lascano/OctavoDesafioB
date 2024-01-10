import express from 'express'
import mongoose from 'mongoose'
import handlebars from 'express-handlebars'
import {Server} from "socket.io"
import cookieParser from 'cookie-parser'
import session from 'express-session'
import FileStore from 'session-file-store'
import MongoStore from 'connect-mongo'
import passport from 'passport'

import { __dirname} from './utils.js';
import viewRouter from "./routes/view.routes.js";
import productsRouter from './routes/products.routes.js';
import cartsRouter from './routes/cart.routes.js';
import loginRouter from './routes/login.routes.js';
import cookieRouter from './routes/cookies.routes.js';
import usersRouter from './routes/users.routes.js';
import sessionsRouter from './routes/sessions.routes.js';
import ProductManager from "./dao/controllers/product.controller.mdb.js";
import MessagesManager from "./dao/controllers/message.controller.mdb.js";
import UserMongo from './dao/controllers/user.controller.mdb.js';
import "./dao/dbconf.js";

const app = express();
const PORT = 8080;
const MONGOOSE_URL= 'mongodb://127.0.0.1:27017/mlascano';

try {
    await mongoose.connect(MONGOOSE_URL)
    
    const app = express()
    const httpServer = app.listen(PORT, () => {
        console.log(`Backend activo puerto ${PORT}`)
    })
    
    const socketServer = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["PUT", "GET", "POST", "DELETE", "OPTIONS"],
            credentials: false
        } 
    })
    
    socketServer.on('connection', socket => {
        socket.on('new_message', data => {
            socketServer.emit('message_added', data)
        })
    })

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser('secretKeyAbc123'));

const fileStorage = FileStore(session)
app.use(session({
    store: MongoStore.create({ mongoUrl: MONGOOSE_URL, mongoOptions: {}, ttl: 60, clearInterval: 5000 }), // MONGODB
    secret: 'secretKeyAbc123',
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())

// handlebars
app.engine('handlebars', handlebars.engine());
app.set("views", __dirname + "/views");
app.set("view engine", "handlebars");

app.use('/', viewRouter)
app.use('/api/products', productsRouter)
app.use('/api/users', usersRouter)
app.use('/api/carts', cartsRouter)
app.use('/api/cookies', cookieRouter)
app.use('/api/login', loginRouter)
app.use('/api/sessions/current', sessionsRouter)

const pmanagersocket = new ProductManager();
const messagesManager = new MessagesManager();
const userMongo = new UserMongo (); 

app.use('/static', express.static(`${__dirname}/public`))
} catch(err) {
    console.log(`Backend: error al inicializar (${err.message})`)
}