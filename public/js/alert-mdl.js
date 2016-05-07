var Alerty = function(){
	$('body').append('<div id="demo-snackbar-example" class="mdl-js-snackbar mdl-snackbar"> <div class="mdl-snackbar__text"></div><button class="mdl-snackbar__action" type="button"></button></div>')
}

Alerty.prototype.show = function(msg,timeout,handler){
	var snackbarContainer = document.querySelector('#demo-snackbar-example');
	var data = {
		message: msg,
		timeout: timeout,
		actionHandler: handler,
		actionText: 'Fechar'
	};
	snackbarContainer.MaterialSnackbar.showSnackbar(data);
}
