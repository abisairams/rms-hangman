(async function () {
    
    const idb = new Idb();
    const req = idb.open('rms-hangman', 1, function (e) {
        const store = idb.createTable('store', {keyPath: 'name', autoIncrement: false, unique: true});
        const banck = idb.createTable('bank', {keyPath: 'id', autoIncrement: true, unique: true});
    })
    req.onsuccess = async function (e) {
        idb.db = e.target.result;
        // Check if init data is in storage
        
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
    
    function initStore(e) {
        const items = [
            { name: 'show', cant: 3 },
            { name: 'clean', cant: 3 },
            { name: 'blackbox', cant: 3 }

        ]
        
        items.forEach(item => {
            const transaction = idb.add('store', item);
            transaction.onsuccess = function (e) {
                console.log(`Item ${item.name} added`);
            }
            transaction.onerror = function (err) {throw new Error(err)};
        })
        
    }
    function initBank(e) {
        return new Promise((resolve, reject) => {
            const transaction = idb.add('bank', {credits: 100});
            transaction.onsuccess = function (e) {
                console.log('100 credits added');
                
                resolve(e);
            }
            transaction.onerror = function (err) {
                throw new Error(e)
            };
            
        })
        
    }
    function hasData(table) {
        return new Promise((resolve, reject) => {
            const req = idb.readAll(table);            
            req.onsuccess = (e => {
                if (e.target.result.length == 0) {
                    resolve(false);
                } else {
                    resolve(true);
                }
            })
        });
    }
    function readBank() {
        return new Promise(function (resolve, reject) {
            const credits = idb.read('bank', 1);
            credits.onsuccess = function (e) {
                resolve (e.target.result.credits);
            }
            credits.onerror = function(err) {
                reject(err)
            }
        })
    }
    function readStore(item) {
        return new Promise(function (resolve, reject) {
            const cant = idb.read('store', item);
            cant.onsuccess = function (e) {
                resolve(e.target.result.cant);
            }
            cant.onerror = function (err) {
                reject(err)
            }
        })
    }
    async function updateBank(cant, operation) {
        const oldCredits = await readBank();
        const newCredits = eval(`${oldCredits} ${operation} ${cant}`);
        idb.update('bank', 1, {credits: newCredits}, async function (e) {
            creditHtml.innerText = await readBank();            
        })
    }
    async function updateStore(item, cant, operation) {
        const oldCant = await readStore(item);
        const newCant = eval(`${oldCant} ${operation} ${cant}`);
        const transaction = idb.update('store', item, {name: item, cant: newCant}, function (e) {
            console.log(`${cant} ${item} agregados a tu almacen`);
            
        });

    }
    async function enoughCredit(cant) {
        const credits = await readBank();
        if (credits - cant >= 0) {
            return true;
        } else {
            return false;
        }
        
    }

    async function handleEvent() {
        const cant = this.getAttribute('cant');
        const price = this.getAttribute('price');
        const product = this.getAttribute('product');

        if (await enoughCredit(price)) {
            updateBank(price, '-');
            updateStore(product, cant, '+');

            creditHtml.innerText = await readBank();
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