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


function saveTimer() {
	const date = new Date();
	const endTimer = date.getTime() + 1000*60*4;

	if (localStorage.getItem('end-timer')  === "") {
		localStorage.setItem('end-timer', endTimer);
	}
}
function formatTimer() {
	const endTimer = localStorage.getItem('end-timer');
	const date = new Date();
	const now  = date.getTime();
	const remainingTime = endTimer - now;
	const remainingMinutes = Math.floor(remainingTime / 60000);
	const remainingSeconds = Math.floor(remainingTime / 1000 % 60);

	return {
		remainingMinutes,
		remainingSeconds,
		remainingTime
	}
}
function renderTimer(intervalId) {
	const msgHtml = document.querySelector("#message");
	const formatedTimer = formatTimer();

	if (formatedTimer.remainingMinutes !== 0) {
		msgHtml.textContent = `Espere ${formatedTimer.remainingMinutes}:${formatedTimer.remainingSeconds} minutos`;
	} else {
		msgHtml.textContent = `Espere ${formatedTimer.remainingSeconds} segundos`;
	}


	if (formatedTimer.remainingTime <= 1000) {
		localStorage.setItem("end-timer", "");
		resetGame();
		hideMessage();
		toggleKeyupListener();
		clearInterval(intervalId);
	}
}