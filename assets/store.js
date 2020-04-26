const idb = new Idb();

(async function () {
    
    const req = idb.open('rms-hangman', 1, function (e) {
        const packs = idb.createTable('packs', { keyPath: 'item', autoIncrement: false, unique: true });
        const store = idb.createTable('store', {keyPath: 'name', autoIncrement: false, unique: true});
        const banck = idb.createTable('bank', {keyPath: 'id', autoIncrement: true, unique: true});
    })
    req.onsuccess = async function (e) {
        idb.db = e.target.result;
        // Check if init data is in storage
        
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
            creditHtml.innerText = await readBank();
        } else {
            creditHtml.innerText = await readBank();
        }
        
    }


    async function handleEvent() {
        const pack = this.getAttribute('pack');
        const product = this.getAttribute('product');

        const buyDetails = await readPack(product, pack);
        const cant = buyDetails.cant;
        const price = buyDetails.price;


        if (await enoughCredit(price)) {
            
            if (await updateBank(price, '-')) {
                updateStore(product, cant, '+');
                creditHtml.innerText = await readBank();
            } else {
                console.log('Something was wrong, try again.')
            }

        } else {
            alert('Not enough credits');
        }

    }

    const creditHtml = document.getElementById('credits');
    const buttons = document.getElementsByName('buy');
    
    buttons.forEach(function (button) {
        button.addEventListener('click', handleEvent, false);        
    });    
    
})()