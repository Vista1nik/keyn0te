const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'

// Create Next Instance
const nextjs = require('next')
const next = nextjs({ dev })
const handle = next.getRequestHandler()

// Import internal node libs
const fs = require('fs/promises')
const crypto = require('crypto')

// Some external libs
const _ = require('lodash')
const pdf = require('pdf-parse')
const useragent = require('useragent')

// Thumbnails
const thumbnail = require('./lib/thumbnails')

// Create Express instance
const express = require('express')
const cors = require('cors')
const app = express()
const server = require('http').createServer(app)

// Create WebSocket instance
const WebSocket = require('ws')
const wss = new WebSocket.Server({ server })

next.prepare().then(() => {
    // Keep Alive system --------------------------------
    function noop() {}
    
    function heartbeat() {
        this.isAlive = true;
    }

    const interval = setInterval(function ping() {
        wss.clients.forEach(ws => {
        if (ws.isAlive === false) {
            return ws.terminate()
        };
    
        ws.isAlive = false;
        ws.ping(noop);
        });
    }, 1000);

    // --------------------------------------------------

    // In-memory keynote sessions
    let sessions = []

    let controlSessions = []

    app.use(cors())

    app.use('/storage', express.static(`${__dirname}/storage`))

    app.all('*', (req, res) => {
        handle(req, res)
    })

    wss.on('connection', (ws, req) => {
        let client = useragent.parse(req.headers['user-agent']).toJSON()

        ws.isAlive = true;

        console.log(`<keyn0te> Connection from ${req.socket.remoteAddress} ${client.device} ${client.family}`)

        ws.on('message', string => {
            const data = JSON.parse(string)

            switch(data.type) {
                case "keynotes": {
                    fs.readdir(`${__dirname}/storage`)
                    .then(dir => {
                        let keynotes = dir.map(file => {
                            return new Promise((resolve, reject) => {
                                thumbnail.create(`${__dirname}/storage/${file}`)
                                .then(imageBase64 => {
                                    resolve({
                                        name: file,
                                        thumbnail: imageBase64
                                    })
                                })
                            })
                        })

                        Promise.all(keynotes)
                        .then(keynotes => {
                            ws.send(JSON.stringify({
                                type: 'keynotes',
                                keynotes: keynotes
                            }))
                        })
                    })
                    break;
                }

                case "keynoteInit": {
                    fs.access(`${__dirname}/storage/${data.keynote}`)
                    .then(() => {
                        // Check sessions of this socket and return existing session
                        if (_.isEmpty(sessions.filter(session => session.socket == ws))) {
                            const getPDFinfo = async (path) => {
                                const pdfBuffer = await fs.readFile(path)
                                const pdfData = await pdf(pdfBuffer)
        
                                return pdfData
                            }
        
                            getPDFinfo(`${__dirname}/storage/${data.keynote}`)
                            .then(pdfData => {
                                let keynoteSession = {
                                    id: `${crypto.randomInt(100, 999)}-${crypto.randomInt(100, 999)}`,
                                    file: data.keynote,
                                    totalSlides: pdfData.numpages,
                                    socket: ws,
                                    req: req
                                }
                                console.log(`<keyn0te> Keynote ${data.keynote} session opened by ${req.socket.remoteAddress} ${client.device} ${client.family}`)
                                sessions.push(keynoteSession)
                
                                ws.send(JSON.stringify({
                                    type: 'keynoteInit',
                                    id: keynoteSession.id,
                                    file: `${req.headers.host.includes('localhost') ? 'http://' : 'https://'}${req.headers.host}/storage/${keynoteSession.file}`,
                                    slide: 1,
                                    totalSlides: keynoteSession.totalSlides
                                }))
                            })
                        } else {
                            let keynoteSession = sessions.filter(session => session.socket == ws)[0]
        
                            ws.send(JSON.stringify({
                                type: 'keynoteInit',
                                id: keynoteSession.id,
                                file: `${req.headers.host.includes('localhost') ? 'http://' : 'https://'}${req.headers.host}/storage/${keynoteSession.file}`,
                                slide: 1,
                                totalSlides: keynoteSession.totalSlides
                            }))
                        }
                    })    
                    break;
                }

                case "keynoteControl": {
                    // Check for same socket
                    if (_.isEmpty(controlSessions.filter(session => session.socket == ws))) {
                        // Check for existing controller
                        if (_.isEmpty(controlSessions.filter(session => session.keynoteId == data.id))) {
                            // Check for keynote session
                            if (!_.isEmpty(sessions.filter(session => session.id == data.id))) {
                                console.log(`<keyn0te> Remote control assigned to keynote ${data.id} by ${req.socket.remoteAddress} ${client.device} ${client.family}`)
                                controlSessions.push({
                                    keynoteId: data.id,
                                    socket: ws
                                })
                            } else {
                                ws.send(JSON.stringify({
                                    type: 'notfound'
                                }))
                            }
                        }
                    }

                    // Prevent hijacking keynotes
                    if (_.isEmpty(controlSessions.filter(session => session.keynoteId == data.id && session.socket != ws))) {
                        // Check for keynote session
                        if (!_.isEmpty(sessions.filter(session => session.id == data.id))) {
                            let keynoteSession = sessions.filter(session => session.id == data.id)[0]

                            // Redirect to viewer
                            console.log(`<keyn0te> A signal from remote was sent to keynote ${data.id} ${req.socket.remoteAddress} ${client.device} ${client.family}`)
                            keynoteSession.socket.send(JSON.stringify(data), () => {
                                ws.send(JSON.stringify({
                                    type: "success"
                                }))
                            })
                        }
                    }
                }

                case 'keynoteRenew': {
                    // Check sessions of this socket and return existing session
                    if (_.isEmpty(sessions.filter(session => session.socket == ws))) {
                        const getPDFinfo = async (path) => {
                            const pdfBuffer = await fs.readFile(path)
                            const pdfData = await pdf(pdfBuffer)
    
                            return pdfData
                        }
    
                        getPDFinfo(`${__dirname}/storage/${data.keynote}`)
                        .then(pdfData => {
                            let keynoteSession = {
                                id: data.id,
                                file: data.keynote,
                                totalSlides: pdfData.numpages,
                                socket: ws,
                                req: req
                            }
                            console.log(`<keyn0te> Keynote ${data.keynote} session opened by ${req.socket.remoteAddress} ${client.device} ${client.family}`)
                            sessions.push(keynoteSession)
            
                            ws.send(JSON.stringify({
                                type: 'keynoteRenew',
                                id: keynoteSession.id,
                                file: `${req.headers.host.includes('localhost') ? 'http://' : 'https://'}${req.headers.host}/storage/${keynoteSession.file}`,
                                totalSlides: keynoteSession.totalSlides
                            }))
                        })
                    } else {
                        let keynoteSession = sessions.filter(session => session.socket == ws)[0]
    
                        ws.send(JSON.stringify({
                            type: 'keynoteInit',
                            id: keynoteSession.id,
                            file: `${req.headers.host.includes('localhost') ? 'http://' : 'https://'}${req.headers.host}/storage/${keynoteSession.file}`,
                            slide: 1,
                            totalSlides: keynoteSession.totalSlides
                        }))
                    }
                    break
                }
            }
        })
        
        ws.on('close', () => {
            // Terminate all
            sessions = sessions.filter(session => session.socket != ws)
            controlSessions = controlSessions.filter(session => session.socket != ws)
        })

        ws.on('pong', heartbeat);
    })
    
    wss.on('close', function close() {
        clearInterval(interval);
    });

    server.listen(port, () => {
        console.log(`<keyn0te> Ready and listen on ${port}`)
    })
})