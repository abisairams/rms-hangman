(async function () {
	var wordList = await loadDB('./assets/database.json');
	var guesses = [];
	const maxLives = 6;
	var targetWord = '';

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
		var hiddenWord = '';
		targetWord.split('').map(letter => {
			if (!guesses.includes(letter.toLowerCase())) {
				hiddenWord += '-';
			} else {
				hiddenWord += letter;
			}
		})
		return hiddenWord;
	}
	function storeGuess(key) {
		if (/^[a-zA-Z]/.test(key)) {
			if (!guesses.includes(key)) {
				guesses.push(key);
				console.log(guesses);
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
			alert('You won');
			resetGame();
		}
	}
	function resetGame() {
		guesses = [];
		targetWord = '';
		main();
	}
	function update(e) {
		storeGuess(e.key);
		console.log(hideWord());
		reviewLives();
		checkIfWon();
	}
	function main() {
		fetchWord();
		console.log(targetWord);
		console.log(hideWord());
	}
	main()
	document.addEventListener('keyup', update, false);
})()