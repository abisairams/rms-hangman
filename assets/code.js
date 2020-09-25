const idb = new Idb();
(async function () {

	const req = idb.open('rms-hangman', 1, function (e) {
		idb.createTable('packs', { keyPath: 'name', autoIncrement: false, unique: true });
		idb.createTable('store', { keyPath: 'name', autoIncrement: false, unique: true });
		idb.createTable('bank', { keyPath: 'id', autoIncrement: true, unique: true });
	})

	req.onsuccess = async function (e) {
		idb.db = e.target.result;

		const hasDataPacksTable = await hasData('packs');
		if (!hasDataPacksTable) {
			initPacks();
		}

		const hasDataStoreTable = await hasData('store');
		if (!hasDataStoreTable) {
			initStore();
		}

		const hasDataBankTable = await hasData('bank');

		if (!hasDataBankTable) {
			await initBank();
		}

		checkStore();
	}

	async function handleEvent() {
		const pack = this.alt;
		if (pack == 'store') {
			window.location = 'store.html';
			return;
		};

		const cant = await readStore(pack);
		if (!cant) {
			this.className = 'disabled';
			showAlert(pack);
		} else {
			// this validation is to check if guessing word is in progress,
			// if response is false means shorcut is completed;
			if (applyShorcut(pack) == false) return; 
			await updateStore(pack, 1, '-');
			const updatedCant = await readStore(pack);
			if (!updatedCant) {
				this.className = 'disabled';
			}

		}
	}

	function applyShorcut(pack) {
		switch (pack) {
			case 'clean':
				return cleanOneButton(); break;
			case 'show':
				return showOneLetter(); break;
			case 'blackbox':
				randomGift(); break;
			default:
				break;
		}
	}

	async function showOneLetter() {
		const encrypted = [];
		for (let i = 0; i < targetWord.length; i++) {
			if (targetWord[i] !== hideWord()[i]) {
				encrypted.push(targetWord[i]);
			}
		}
		// return false if the word is already guessed,
		// to not continue on main function
		if (encrypted.length == 0) return false;
		const randomBtn = encrypted[Math.floor(Math.random() * encrypted.length)];
		const btn = await findButton(randomBtn);
		btn.click();
		return true;
	}
	function cleanOneButton() {
		const buttons = document.querySelectorAll('#guesses-container button.filled');
		const noPlayingWords = [];
		
		/*  
		Push all no matched btn to an array, cuz I can't update only one btn directly 
		on forEach method, all not matched buttons will be updated too.
		Then I can select one random btn and apply the custom changes;
		*/
		buttons.forEach(btn => {
			if (!targetWord.includes(btn.textContent.toLowerCase())) {
				noPlayingWords.push(btn);				
			}
		})
		// return false if all no playing buttons has been checked, 
		// to not continue on main function
		if (noPlayingWords.length == 0) return false;
		const randomBtn = noPlayingWords[Math.floor(Math.random() * noPlayingWords.length)];
		randomBtn.className = 'empty';
		randomBtn.disabled = true;
	}
	function randomGift() {
		const gifts = [giveFreeMoney, cleanOneButton, showOneLetter];

		const random = gifts[Math.floor(Math.random() * gifts.length)];
		random()
	}

	async function giveFreeMoney() {
		const availibleCredits = [5,10,20,30,40,50];
		const credit = availibleCredits[Math.floor((Math.random() * availibleCredits.length))];
		const doTransaction = await updateBank(credit, '+');
		if (doTransaction) {
			alert(`${credit} creditos depositados a tu cuenta`)
		}
	}

	function showAlert(pack) {
		console.log(`No hay ${pack} disponibles`);

	}

	async function checkStore() {
		const packs = idb.readAll('store');
		packs.onsuccess = function (e) {
			result = e.target.result;
			result.map(pack => {
				if (pack.cant == 0) {
					const elem = document.querySelector(`img[alt=${pack.name}`);
					elem.className = 'disabled';
				}
			})
		}
	}

	function findButton(key) {
		const buttons = document.querySelectorAll('button');
		return new Promise((resolve, reject) => {
			buttons.forEach(function (btn) {
				if (btn.textContent == key.toUpperCase()) {
					resolve(btn);
				}
			})
		})
	}

	const itemsAvatar = document.querySelectorAll('img');
	itemsAvatar.forEach(item => item.addEventListener('click', handleEvent, false));




	const guessesBtnParent = document.getElementById('guesses-container');
	const answerBntParent = document.getElementById('answer');
	var wordList = await loadDB('./assets/database.json');
	var guesses = [];
	const maxLives = 6;
	var targetWord = '';

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
			clearInterval(intervalId);
		}
	}

	function showMessage(typeMessage) {
		const lock_layout = document.querySelector('#lock-layout');
		const message_body = document.querySelector('#message-body');
		const title = document.querySelector('#title');
		const message = document.querySelector('#message');

		lock_layout.className = "lock-layout locked";

		toggleKeyupListener();

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

		toggleKeyupListener();
	}
	
	function renderGuessesBtn(val) {
		const props = { class: 'filled', textContent: val.toUpperCase() };
		const btn = newElement('button', props);
		btn.addEventListener('click', update, false);
		guessesBtnParent.appendChild(btn);
	}
	function toggleBtnState(e) {
		if (e.type == 'click') {
			if (e.target.className == 'filled') {
				e.target.className = 'empty';
			} else {
				e.target.className = 'filled';
			}
			e.target.disabled = true;
		} else {
			const buttons = document.querySelectorAll('button');
			buttons.forEach(function (btn) {
				
				if (btn.textContent == e.key.toUpperCase()) {
					btn.className = 'empty';
					btn.disabled = true;
					// if (btn.className == 'filled') {
					// } else {
					// 	btn.className = 'filled';
					// }
				}

			})
		}
	}
	async function loadDB(path) {
		const response = await fetch(path);
		const db = await response.json();
		const tmp = [];
		for (const word in db) {
			tmp.push(db[word]);
		}
		return tmp;
	}
	function readLevel() {
		return localStorage.getItem('level');
	}
	function initLevel() {
		localStorage.setItem('level', 1);
	}
	function updateLevel() {
		const oldlevel = readLevel();
		
		if (!oldlevel) {
			localStorage.setItem('level', 1);			
		} else {
			if (parseInt(oldlevel) > wordList.length) return;
			localStorage.setItem('level', parseInt(oldlevel) + 1);
			localStorage.setItem('guesses', '');
		}
	}
	function fetchWord() {
		console.log(wordList.length);
		if (readLevel() - 1 < wordList.length) {
			targetWord = wordList[readLevel() -1];
		} else {
			// alert('All level are completed');
			showMessage('end-game')
			return "end-game";
		}
	}
	function hideWord() {
		answerBntParent.innerHTML = '';
		var hiddenWord = '';
		guesses = localStorage.getItem('guesses').split('');

		targetWord.split('').map(letter => {
			if (!guesses.includes(letter.toLowerCase())) {
				hiddenWord += '-';
				const props = {class: 'empty', textContent: '0'};
				const btn = newElement('button', props);
				answerBntParent.appendChild(btn);
			} else {
				hiddenWord += letter;
				const props = { class: 'filled', textContent: letter };
				const btn = newElement('button', props);
				answerBntParent.appendChild(btn);
			}
		})

		guesses.forEach(disableMatchButton);
		
		return hiddenWord;
	}
	function disableMatchButton(key) {
		const buttons = document.querySelectorAll('#guesses-container button.filled');
		console.log(key)
		buttons.forEach(function (btn) {

			if (btn.textContent == key.toUpperCase()) {
				btn.disabled = true;
				btn.className = 'empty';
			}

		})
	}
	function storeGuess(key) {
		if (/^[a-zA-Z]$/.test(key)) {
			// console.log(key);
			
			if (!guesses.includes(key.toLowerCase())) {
				guesses.push(key.toLowerCase());
				localStorage.setItem('guesses', localStorage.getItem('guesses') + key.toLowerCase());
				return false;
			}
			return true;
		}
	}
	function reviewLives() {
		var remainingLives = maxLives;
		var str = targetWord.toLowerCase();
		const liveHtm = document.getElementById('remaining-lives');
		guesses = localStorage.getItem('guesses').split('')
		guesses.filter(function (val) {
			if (!str.includes(val)) {
				remainingLives--;	
				liveHtm.textContent = remainingLives;
			}
		})

		if (remainingLives <= 0) {
			saveTimer();
			setTimeout(function () {
				// alert('You lost, try again');
				showMessage("level-fail");
				renderTimer();
				const intervalId = setInterval(() => {
					renderTimer(intervalId);
				},1000)
			},10)
		}
	}
	function checkIfWon() {
		if (targetWord == hideWord()) {
			setTimeout(function () {
				// alert('You won');
				showMessage("level-success");
				updateLevel();
				setTimeout(() => {
					hideMessage()
					resetGame()
				}, 2000);
			},200)
		}
	}
	function resetGame() {
		const parent = document.getElementById('guesses-container');
		parent.innerHTML = '';
		localStorage.setItem('guesses', '');
		guesses = [];
		targetWord = '';
		main();
	}
	function update(e) {
		toggleBtnState(e);
		const isKeyStored = storeGuess(e.key || e.target.textContent);
		console.log(hideWord());
		if (!isKeyStored) {
			reviewLives();
			console.log(hideWord())
		}
		checkIfWon();
	}
	function main() {
		if (!localStorage.getItem('guesses')) {
			localStorage.setItem('guesses', '')
		}
		if (!readLevel()) {
			initLevel();
		}
		fetchWord();


		const liveHtm = document.getElementById('remaining-lives');		
		const levelHtm = document.getElementById('current-level');
		levelHtm.textContent = readLevel();
		liveHtm.textContent = maxLives;
		const abc = 'abcdefghijklmnñopqrstuvwxyz'.split('');
		abc.forEach(renderGuessesBtn);
		console.log(targetWord);
		console.log(hideWord());
		reviewLives();
		
	}
	
	document.addEventListener('keyup', update, false);

	function toggleKeyupListener() {
		if (document.querySelector('#lock-layout').className == "lock-layout locked") {
			document.removeEventListener('keyup', update, false);
		} else {
			document.addEventListener('keyup', update, false);
		}
	}

	main()
})()