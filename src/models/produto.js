const mongoose = require('mongoose');

const produtoSchema = new mongoose.Schema({
  nomeProduto: { type: String, required: true },
  descricao: { type: String, required: true },
  qtdEstoque: { type: Number, required: true },
  preco: { type: Number, required: true },
  categoria: { type: String, required: true },
  dataCriacao: { type: Date, default: Date.now },
  dataAtualizacao: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Produtos', produtoSchema);
