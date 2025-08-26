require('dotenv').config();
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const mongoose = require('mongoose');

const PROTO_PATH = path.join(__dirname, 'proto', 'products.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {});
const productsProto = grpc.loadPackageDefinition(packageDefinition).products;

const helloWorldService = require('./services/helloWorldService');
const produtosService = require('./services/produtosService');

console.log("Conectando ao MongoDB...")
console.log(process.env.MONGO_URI);

async function main() {
    await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        readPreference: 'secondaryPreferred'
    });

    const server = new grpc.Server();
    server.addService(productsProto.HelloWorld.service, helloWorldService);
    server.addService(productsProto.ProdutosService.service, produtosService);

    const port = 50051;
    server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), (error, port) => {
        if (error) {
            console.error(error);
            return;
        }
        console.log(`Server running at http://0.0.0.0:${port}`);
        server.start();
    });
}

main();