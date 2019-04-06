import express from 'express'
import bodyParser = require('body-parser');
import { getBlockchain, Block, generateNextBlock } from '.';
import { getSockets, initPeerServer } from './peerConnection';

const httpPort: number = parseInt(process.env.HTTP_PORT) || 3001
const peersPort: number = parseInt(process.env.PEERS_PORT) || 6001

const initHttpServer = (myHttpPort: number) => {
    const app = express();
    app.use(bodyParser.json());

    app.get('/blocks', (req, res) => {
        res.send(getBlockchain())
    })

    app.post('/blocks', (req, res) => {
        let newBlock: Block = generateNextBlock(req.body.data);
        res.send(newBlock)
    })

    app.get('/peers', (req, res) => {
        res.send(getSockets().map((s: any): string => s.url))
    })

    app.post('/peers', (req, res) => {
        res.status(201)
        res.send('null')
    })

    app.listen(myHttpPort, () => {
        console.log("Listening HTTP on port: " + myHttpPort);

    })
}

initHttpServer(httpPort);
initPeerServer(peersPort);