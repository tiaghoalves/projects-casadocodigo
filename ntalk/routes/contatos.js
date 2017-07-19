module.exports = function (app) {
	var autenticar = require('./../middleware/autenticador');
	var contato = app.controllers.contatos;
	
	app.get('/contatos', autenticar, contato.index);
	app.post('/contato', autenticar, contato.create);
	app.get('/contato/:id/editar', autenticar, contato.edit);
	app.get('/contato/:id', autenticar, contato.show)
	app.put('/contato/:id', autenticar, contato.update)
	app.delete('/contato/:id', autenticar, contato.destroy);
};