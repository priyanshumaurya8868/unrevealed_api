const http = require('http')
const port = process.env.port
const app = require('./app')

const server = http.createServer(app)

server.listen(port,()=>{
    console.log(`listening portNo. ${port}`)
})
