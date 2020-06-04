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
		const availibleCredits = [20, 40, 50, 80, 100, 1000];
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
			localStorage.setItem('level', parseInt(oldlevel) + 1);
		}
	}
	function fetchWord() {
		console.log(wordList.length);
		if (readLevel() - 1 < wordList.length) {
			targetWord = wordList[readLevel() -1];
		} else {
			alert('All level are completed');
		}
	}
	function hideWord() {
		answerBntParent.innerHTML = '';
		var hiddenWord = '';
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
				disableMatchButton(letter);
			}
		})
		return hiddenWord;
	}
	function disableMatchButton(key) {
		const buttons = document.querySelectorAll('button');
		buttons.forEach(function (btn) {

			if (btn.textContent == key.toUpperCase()) {
				btn.disabled = true;
			}

		})
	}
	function storeGuess(key) {
		if (/^[a-zA-Z]$/.test(key)) {
			// console.log(key);
			
			if (!guesses.includes(key.toLowerCase())) {
				guesses.push(key.toLowerCase());
				return false;
			}
			return true;
		}
	}
	function reviewLives() {
		var remainingLives = maxLives;
		var str = targetWord.toLowerCase();
		const liveHtm = document.getElementById('remaining-lives');

		guesses.filter(function (val) {
			if (!str.includes(val)) {
				remainingLives--;	
				liveHtm.textContent = remainingLives;
			}
		})

		if (remainingLives <= 0) {
			setTimeout(function () {
				alert('You lost, try again');
				resetGame()
			},10)
		}
	}
	function checkIfWon() {
		if (targetWord == hideWord()) {
			setTimeout(function () {
				alert('You won');
				updateLevel();
				resetGame();
			},200)
		}
	}
	function resetGame() {
		const parent = document.getElementById('guesses-container');
		parent.innerHTML = '';
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
		}
		checkIfWon();
	}
	function main() {
		if (!readLevel()) {
			initLevel();
		}
		fetchWord();
		console.log(targetWord);
		console.log(hideWord());

		const liveHtm = document.getElementById('remaining-lives');		
		const levelHtm = document.getElementById('current-level');
		levelHtm.textContent = readLevel();
		liveHtm.textContent = maxLives;
		const abc = 'abcdefghijklmnñopqrstuvwxyz'.split('');
		abc.forEach(renderGuessesBtn);
	}
	main()
	document.addEventListener('keyup', update, false);
})()