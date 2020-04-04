(async function () {
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
		} else {
			const buttons = document.querySelectorAll('button');
			buttons.forEach(function (btn) {
				
				if (btn.textContent == e.key.toUpperCase()) {
					if (btn.className == 'filled') {
						btn.className = 'empty';
					} else {
						btn.className = 'filled';
					}
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
	function fetchWord() {
		targetWord = wordList[Math.floor(Math.random() * wordList.length)];
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
			}
		})
		return hiddenWord;
	}
	function storeGuess(key) {
		if (/^[a-zA-Z]/.test(key)) {
			if (!guesses.includes(key)) {
				guesses.push(key.toLowerCase());
			}			
		}
	}
	function reviewLives() {
		var remainingLives = maxLives;
		var str = targetWord.toLowerCase();

		guesses.filter(function (val) {
			if (!str.includes(val)) {
				remainingLives--;	
			}
		})

		if (remainingLives <= 0) {
			alert('You lost, try again');
			resetGame()
		}
	}
	function checkIfWon() {
		if (targetWord == hideWord()) {
			setTimeout(function () {
				alert('You won');
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
		storeGuess(e.key || e.target.textContent);
		console.log(hideWord());
		reviewLives();
		checkIfWon();
	}
	function main() {
		fetchWord();
		console.log(targetWord);
		console.log(hideWord());
		const abc = 'abcdefghijklmnñopqrstuvwxyz'.split('');
		abc.forEach(renderGuessesBtn);
	}
	main()
	document.addEventListener('keyup', update, false);
})()