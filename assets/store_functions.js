function initPacks() {
    const packList = [
        {
            name: "show",
            img: 'show.svg',
            packs: {
                pack1: { cant: 1, price: 5 } ,
                pack2: { cant: 10, price: 20 },
                pack3: { cant: 100, price: 150 }
            }
            
        },
        {
            name: "blackbox", 
            img: 'box.svg',
            packs: {
                pack1: { cant: 1, price: 10 },
                pack2: { cant: 10, price:  30},
                pack3: { cant: 100, price: 200 }
            }
        },
        {
            name: "clean",
            img: 'clean.svg',
            packs: {
                pack1: { cant: 1, price: 5 },
                pack2: { cant: 10, price: 20 },
                pack3: { cant: 100, price: 150 }
            }
        }
    ]

    packList.forEach((pack) => {
        const add = idb.add('packs', pack);
        add.onsuccess = function (e) {
            console.log(`pack ${pack.name} added`);
            
        }
        
    })
    
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
function readPack(item, pack) {
    return new Promise((resolve, reject) => {
        const transaction = idb.read('packs', item);
        transaction.onsuccess = function (e) {
            resolve(e.target.result.packs[pack]);                
        }
    })
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
    return new Promise(function (resolve, reject) {
        idb.update('bank', 1, {credits: newCredits}, async function (e) {
            if (e) {
                resolve(true);
            } else {
                resolve(false); // just need bool so not trigger { @reject }
            }
        })
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