const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, 'proto', 'products.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {});
const productsProto = grpc.loadPackageDefinition(packageDefinition).products;

const helloWorldService = require('./services/helloWorldService');

function main() {
    const server = new grpc.Server();
    server.addService(productsProto.HelloWorld.service, helloWorldService);
    const port = process.env.PORT || '50051';
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