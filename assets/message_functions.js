function showMessage(typeMessage) {
	const lock_layout = document.querySelector('#lock-layout');
	const message_body = document.querySelector('#message-body');
	const title = document.querySelector('#title');
	const message = document.querySelector('#message');

	lock_layout.className = "lock-layout locked";


	if (typeMessage == "level-fail") {
		title.textContent = "No tiene mas vidas restantes";
		message_body.className = "message level-fail";
		message.textContent = "Espere 4 minutos";
	} else if(typeMessage == "level-success") {
		title.textContent = "Bien hecho";
		message_body.className = "message level-success";
		message.textContent = "Nivel superado";

	} else if(typeMessage == "end-game") {
		title.textContent = "Fin del juego";
		message_body.className = "message end-game";
		message.textContent = "Todos los niveles han sido superados";
	}

}
function hideMessage() {
	const lock_layout = document.querySelector('#lock-layout');
	lock_layout.className = "lock-layout no-locked";
}
