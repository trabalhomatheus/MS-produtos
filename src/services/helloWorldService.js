const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const packageDefinition = protoLoader.loadSync('src/proto/products.proto', {});
const productsProto = grpc.loadPackageDefinition(packageDefinition).products;

const sayHello = (call, callback) => {
    const name = call.request.name || 'World';
    callback(null, { message: `Hello ${name}!` });
};

const helloWorldService = {
    SayHello: sayHello,
};

module.exports = helloWorldService;