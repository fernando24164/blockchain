import WebSocket from 'ws'
import { Server } from 'ws'
import { Block, getLatestBlock, getBlockchain, isValidBlockStructure, addBlockToChain, replaceChain } from '.';

const sockets: WebSocket[] = [];

export const getSockets = () => sockets;

enum MessageType {
    QUERY_LATEST = 0,
    QUERY_ALL = 1,
    RESPONSE_BLOCKCHAIN = 2
}

class Message {
    public type: MessageType
    public data: any

    constructor(type: MessageType, data: any) {
        this.type = type;
        this.data = data;
    }
}

export const initPeerServer = (port: number) => {
    const server: Server = new WebSocket.Server({ port: port });
    server.on('connection', (ws: WebSocket) => {
        initConnection(ws);
    })
    console.log('Listening peers connections on ', port);
}

const initConnection = (ws: WebSocket) => {
    sockets.push(ws);
    initMessageHandler(ws);
    initErrorHandler(ws);
    write(ws, queryChainLengthMsg())
}

const JSONToObject = <T>(data: string): T | null => {
    try {
        return JSON.parse(data)
    } catch (e) {
        console.log(e);
        return null;
    }
}

const write = (ws: WebSocket, message: Message): void => ws.send(JSON.stringify(message));
const broadcast = (data: Message): void => sockets.forEach((socket) => write(socket, data));
const queryChainLengthMsg = (): Message => ({ 'type': MessageType.QUERY_LATEST, 'data': null })

const initMessageHandler = (ws: WebSocket) => {
    ws.on('message', (data: string) => {
        const message: Message | null = JSONToObject<Message>(data)
        if (message === null) {
            console.log('Could not parse respond message' + data);
            return;
        }
        console.log('Received message' + JSON.stringify(message));
        switch (message.type) {
            case MessageType.QUERY_LATEST:
                write(ws, responseLatestMsg())
                break;
            case MessageType.QUERY_ALL:
                write(ws, responseChainMsg())
                break;
            case MessageType.RESPONSE_BLOCKCHAIN:
                const receivedBlocks: Block[] | null = JSONToObject<Block[]>(message.data);
                if (receivedBlocks === null) {
                    console.log('Invalid block received!');
                    console.log(message.data);
                    break;
                }
                handleBlockchainResponse(receivedBlocks)
                break;
        }
    })
}

const initErrorHandler = (ws: WebSocket) => {
    const closeConnection = (ws: WebSocket) => {
        sockets.splice(sockets.indexOf(ws), 1);
    }
    ws.on('close', () => closeConnection(ws));
    ws.on('error', () => closeConnection(ws));
}

const responseLatestMsg = (): Message => ({
    'type': MessageType.RESPONSE_BLOCKCHAIN,
    'data': JSON.stringify([getLatestBlock()])
})

const responseChainMsg = (): Message => ({
    'type': MessageType.RESPONSE_BLOCKCHAIN,
    'data': JSON.stringify(getBlockchain())
})

const queryAllMsg = (): Message => ({ 'type': MessageType.QUERY_ALL, 'data': null })

const handleBlockchainResponse = (blocks: Block[]): void => {
    if (blocks.length === 0) {
        console.log("Size of received blocks was 0");
    }
    const latestBlock = blocks[blocks.length - 1];
    if (!isValidBlockStructure(latestBlock)) {
        console.log("Block structure is not valid!");
    }
    const latestBlockHeld: Block = getLatestBlock();
    if (latestBlock.index > latestBlockHeld.index) {
        if (latestBlockHeld.hash === latestBlock.previousHash) {
            if (addBlockToChain(latestBlock)) {
                broadcast(responseLatestMsg())
            }
        } else if (blocks.length === 1) {
            broadcast(queryAllMsg())
        } else {
            replaceChain(blocks)
        }
    }
}

export const broadcastLatest = (): void => {
    broadcast(responseLatestMsg());
}

export const connectToPeers = (newPeer: string): void => {
    const ws: WebSocket = new WebSocket(newPeer);
    ws.on('open', () => {
        initConnection(ws);
    });
    ws.on('error', () => {
        console.log('Connection failed!');

    })
}
