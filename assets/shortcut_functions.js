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

function decryptWord(targetWord, targetWordHidden) {
	const wordLength = targetWord.length;
	const wordToArray = targetWord.split('');

	return wordToArray.filter(function (letter, index) {
		if (letter !== targetWordHidden[index]) {
			return letter
		}
	})
}

function pickSomethingRandom(array) {
	return array[Math.floor(Math.random() * array.length)];
}

async function showOneLetter(targetWord, targetWordHidden) {
	const encriptedLettersRamining = decryptWord(targetWord, targetWordHidden);

	if (!encriptedLettersRamining.length) return false;
	const randomBtn = pickSomethingRandom(encriptedLettersRamining);
	const btn = await findButton(randomBtn);
	btn.click();
	return true;
}

function cleanOneButton(targetWord) {
	const buttons = document.querySelectorAll('#guesses-container button.filled');
	const noPlayingWords = [];
	
	/*  
	Push all no matched btn to an array, cuz I can't update only one btn directly 
	on forEach method, all not matched buttons will be updated too.
	Then I can select one random btn and apply the custom changes;
	*/
	buttons.forEach(btn => {
		if (!targetWord.includes(btn.textContent.toLowerCase())) {
			noPlayingWords.push(btn);		}
	})
	// return false if all no playing buttons has been checked, 
	// to not continue on main function
	if (noPlayingWords.length == 0) return false;
	const randomBtn = noPlayingWords[Math.floor(Math.random() * noPlayingWords.length)];
	randomBtn.className = 'empty';
	randomBtn.disabled = true;
}

function randomGift(targetWord, hiddenWord) {
	const gifts = [giveFreeMoney, cleanOneButton, showOneLetter];
	const random = gifts[Math.floor(Math.random() * gifts.length)];
	random(targetWord, hiddenWord)
}

async function giveFreeMoney() {
	const availibleCredits = [5,10,20,30,40,50];
	const credit = availibleCredits[Math.floor((Math.random() * availibleCredits.length))];
	const doTransaction = await updateBank(credit, '+');
	if (doTransaction) {
		alert(`${credit} creditos depositados a tu cuenta`)
	}
}

function applyShorcut(pack, targetWord, targetWordHidden) {
	switch (pack) {
		case 'clean':
			return cleanOneButton(targetWord); break;
		case 'show':
			return showOneLetter(targetWord,targetWordHidden); break;
		case 'blackbox':
			randomGift(targetWord, targetWordHidden); break;
		default:
			break;
	}
}