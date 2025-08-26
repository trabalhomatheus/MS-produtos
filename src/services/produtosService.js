const Produto = require('../models/produto');

const toProto = (doc) => ({
  id: doc._id.toString(),
  nomeProduto: doc.nomeProduto,
  descricao: doc.descricao,
  qtdEstoque: doc.qtdEstoque,
  preco: doc.preco,
  categoria: doc.categoria,
  dataCriacao: doc.dataCriacao.toISOString(),
  dataAtualizacao: doc.dataAtualizacao.toISOString()
});

module.exports = {
  async CreateProduto(call, callback) {
    try {
      const now = new Date();
      const produto = new Produto({
        ...call.request,
        dataCriacao: now,
        dataAtualizacao: now
      });
      await produto.save();
      callback(null, { produto: toProto(produto) });
    } catch (err) {
      callback(err);
    }
  },

  async GetProduto(call, callback) {
    try {
      const produto = await Produto.findById(call.request.id);
      if (!produto) return callback(null, {});
      callback(null, { produto: toProto(produto) });
    } catch (err) {
      callback(err);
    }
  },

  async UpdateProduto(call, callback) {
    try {
      const update = { ...call.request, dataAtualizacao: new Date() };
      delete update.id;
      const produto = await Produto.findByIdAndUpdate(call.request.id, update, { new: true });
      if (!produto) return callback(null, {});
      callback(null, { produto: toProto(produto) });
    } catch (err) {
      callback(err);
    }
  },

  async DeleteProduto(call, callback) {
    try {
      const res = await Produto.deleteOne({ _id: call.request.id });
      callback(null, { success: res.deletedCount > 0 });
    } catch (err) {
      callback(err);
    }
  },

  async ListProdutos(call, callback) {
    try {
      const produtos = await Produto.find();
      callback(null, { produtos: produtos.map(toProto) });
    } catch (err) {
      callback(err);
    }
  }
};
