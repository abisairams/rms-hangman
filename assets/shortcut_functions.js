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