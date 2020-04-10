(function () {
    
    var totalMoney = 1000;
    var blackBox = 0;
    var show = 0;
    var clean = 0;


    function handleEvent(event) {
        const cant = this.getAttribute('cant');
        const price = this.getAttribute('price');
        const product = this.getAttribute('product');
        
        if (enoughMoney(price)) {
            updateBank(price, '-');
            switch (product) {
                case 'blackbox':
                    blackBox += parseInt(cant);
                    console.log(blackBox);
                    
                    break;
                case 'show':
                    show += parseInt(cant);
                    console.log(show);
                    break;
                case 'clean':
                    clean += parseInt(cant);
                    console.log(`clean ${clean}`);
                    
                    break;

            }
            
            moneyHtml.innerText = readBank();
        } else {
            alert('Not enough money');
        }
        
    }
    function readBank() {
        return totalMoney;
    }
    function updateBank(cant, operation) {
        totalMoney = eval(`${totalMoney} ${operation} ${cant}`);
    }
    function enoughMoney(cant) {
        if (totalMoney - cant >= 0) {
            return true
        } else {
            return false;
        }
        
    }

    const moneyHtml = document.getElementById('credits');
    const buttons = document.getElementsByName('buy');
    
    buttons.forEach(function (button) {
        button.addEventListener('click', handleEvent, false);        
    });    
    
})()