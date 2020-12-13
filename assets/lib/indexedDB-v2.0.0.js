/*!
 * rms-idb indexedDB mini-library v2.0.0
 * Creado por Abisai Ramos
 * como practica sobre indexedDB API
 */

class Idb {
  constructor() {
    if (typeof indexedDB == 'undefined') {
      throw Error('indexedDB API not supported');
    }
    this.db = null;
  }
  open(name, version, callback) {
    var self = this;
    var temp = indexedDB.open(name, version);
    temp.onupgradeneeded = function (e) {
      self.db = e.target.result;
      if (callback) {
        callback(e);
      }
    }
    return temp;
  }
  createTable(table, settings) {
    if (!this.db.objectStoreNames.contains(table)) {
      return this.db.createObjectStore(table, settings);
    }
  }
  transaction(table, mode) {
    var transaction = this.db.transaction([table], mode)
      .objectStore(table);
    return transaction;
  }
  add(table, data) {
    var transaction = this.transaction(table, 'readwrite');
    var add = transaction.add(data);
    return add;
  }
  read(table, key) {
    var transaction = this.transaction(table, 'readonly');
    return transaction.get(key);
  }
  readAll(table) {
    var transaction = this.transaction(table, 'readonly');
    return transaction.getAll();
  }
  remove(table, key) {
    var transaction = this.transaction(table, 'readwrite');
    return transaction.delete(key);
  }
  removeObjectStore(objectStore) {
    // This method only works onversionchage
    this.db.deleteObjectStore(objectStore);
  }
  update(table, key, data, callback) {
    var transaction = this.transaction(table, 'readwrite');
    transaction.get(key)
      .onsuccess = function (e) {
        if (!e.target.result) return callback(null, 'No se encontro un registro con ese id')
        var reg = e.target.result;
        for (var cell in reg) {
          if (reg.hasOwnProperty(cell)) {
            if (data.hasOwnProperty(cell)) {
              reg[cell] = data[cell];
            }
          }
        }
        var update = transaction.put(reg);
        update.onsuccess = callback;
        update.onerror = callback
      }
  }
}
