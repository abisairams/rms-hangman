const idb = new Idb();

(async function () {
    
    const req = idb.open('rms-hangman', 1, function (e) {
        const packs = idb.createTable('packs', { keyPath: 'name', autoIncrement: false, unique: true });
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

        const listPacks = await readPacksTable();
        listPacks.forEach(renderPack);

    }

    function readPacksTable() {
        return new Promise((resolve, reject) => {
            const read = idb.readAll('packs')
            read.onsuccess = function (e) {
                resolve(e.target.result);
            }            
        })
    }
    function renderPack(item) {
        const parentBox = newElement('div', { class: `group ${item.name}` });
        const packs = item.packs;
        for (pack in packs) {

            const label = newElement('label', { textContent: `${packs[pack].cant} x $${packs[pack].price}`});
            const img = newElement('img', {src: `img/${item.img}`});
            const button = newElement('button', {name: 'buy', price: packs[pack].price, cant: packs[pack].cant, pack: pack, product: item.name, textContent: 'Comprar'})
            const box = newElement('div', { class: 'item-box' }, [label, img, button]);

            button.onclick = handleEvent


            parentBox.appendChild(box);

        }
        parentBoxes.appendChild(parentBox);
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

    const parentBoxes = document.getElementById('parentBoxes');
    const creditHtml = document.getElementById('credits');
    parentBoxes.innerHTML = '';
     
    
})()