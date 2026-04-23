class Produs {
    constructor(id, np, c) {
        this.id = id;
        this.numeProdus = np;
        this.cantitate = c;
    }

    serializeaza () {
        //convertim obiectul in json
        return JSON.stringify(this)
    }

    deserializeaza (jsonString) {
        let o = JSON.parse(jsonString)
        this.id = o.id;
        this.numeProdus = o.numeProdus;
        this.cantitate = o.cantitate;
    }
 }

function genereazaId() {
    return localStorage.length + 1;
}

function salveazaProdus(p) {
    // sau "" + p.id
    localStorage.setItem(p.id.toString(), p.serializeaza());
}

function adaugaProdus() {
    let np = document.getElementById("numeProdus").value;
    let c = document.getElementById("cantitate").value;
    let id = genereazaId();

    let p = new Produs(id, np, c);

    //eroare: am corectat pentru a putea schimba storage
    if(storageManager) {
        storageManager.salveaza(p);
    } else {
        salveazaProdus(p); // daca nu avem setat ceva
    }

    //trimitem la myWorker obiectul produs
    myWorker.postMessage(p);

    console.log("am ajuns!");
    //localStorage.setItem(""+id, p.serializeaza());
 }

 //----------------------------------------------------------------

 //wirker permite sa rulezi cod in paralel pe un thread separat fara sa blochezi pagina web

 //creare worker care porneste thread separat
 const myWorker = new Worker("js/worker.js");

 //raspunsul de la worker
 myWorker.onmessage = function(e) {
    //main primeste raspunsul lui worker din worker.js
    console.log("Main thread: am primit raspuns de la worker!");
    //adaugam rand
    adaugaRand(e.data);
 }

 function adaugaRand(produs) {
    let tabel = document.getElementById("tabelCumparaturi").getElementsByTagName("tbody")[0];

    let rand = tabel.insertRow();

    let c0 = rand.insertCell(0);
    let c1 = rand.insertCell(1);
    let c2 = rand.insertCell(2);

    c0.innerText = produs.id;
    c1.innerText = produs.numeProdus;
    c2.innerText = produs.cantitate;
 }

document.getElementById("btnAdauga").addEventListener("click", adaugaProdus);

//-----------------------------------------------------------------
///clasa de baza
class StorageManager {
    salveaza(produs) {
        
    }

    incarca(callback) {
        
    }

    sterge() {
        
    }
}

///subclasa - mosteneste StOrageManager

class LocalStorage extends StorageManager {
    salveaza(produs) {
        localStorage.setItem(produs.id.toString(), produs.serializeaza());
        this.db = new LocalStorage();
    }

    incarca(callback) {
        // in momentul incarcarii paginii: facut la lab
        for(let i = 0; i < localStorage.length; i++)
        {
            let k = localStorage.key(i);
            let s = localStorage.getItem(k);
            
            let p2 = new Produs();
            p2.deserializeaza(s);
            callback(p2);
        }
    }

    sterge() {
        localStorage.clear();
    }
}

let storageManager = null;

class IndexedDB extends StorageManager {
    constructor() {
        super(); //folosim constructorul clasei mostenite
    }

    deschideDB(callback) {
        //deschidem baza de date
        const request = indexedDB.open("Cumparaturi", 1);

        //onupgradeneeded cand db e creeata prima data
        request.onupgradeneeded = (event) => {
            // Salveaza IDBDatabase interfata
            const db = event.target.result;

            //cream un objectStore pentru bada de date
            //ca in sql produse e tabelul, id e PK
            const objectStore = db.createObjectStore("produse", {keyPath: "id"});
            console.log("IndexedDB: Store creat");
        };

        request.onsuccess = (event) => {
            this.db = event.target.result; //salvam referinta la db
            console.log("IndexedDB: deschisa");

            //continuam executia cu fct de callback
            if(callback)
                callback();
        }

        request.onerror = (event) => {
            console.log("IndexedDB: Eroare", event.target.error);
        }
    }

    salveaza(produs) {
        //facem o tranzactie
        const transaction = this.db.transaction(["produse"], "readwrite"); //lista de obiete, flag de readwrite
        //referinta la objectStore de la deschidere
        const store = transaction.objectStore("produse");

        //salvam un obiect
        const request = store.put({
            id: produs.id,
            numeProdus: produs.numeProdus,
            cantitate: produs.cantitate
        });

        //eroare 1
        request.onsuccess = (e) => {
            console.error(" produs salvat");
        }

        request.onerror = (e) => {
            console.error("eroare salvare:", e.target.error);
        }
    }

    incarca(callback) {
        const transaction = this.db.transaction(["produse"], "readonly"); //lista de obiete, flag de readwrite
        const store = transaction.objectStore("produse");

        //parcurge toate inregistrarile din store una cate una
        const request = store.openCursor();

        request.onsuccess = (event) => {
            const cursor = event.target.result;

            if(cursor) {
                //obiectul curent
                const data = cursor.value;

                //cream un obiect Produs
                const p = new Produs(data.id, data.numeProdus, data.cantitate);

                callback(p); //trimitem produsul la fct

                cursor.continue(); //trecem la urmatoarea inregistrare
            }
        }
    }

    sterge() {
        const transaction = this.db.transaction(["produse"], "readwrite"); //lista de obiete, flag de readwrite
        const store = transaction.objectStore("produse");

        store.clear();
    }


}


async function schimbaStorage(tip) {
    if (tip === 'indexeddb') {
        storageManager = new IndexedDB();
        console.log("Storage: IndexedDB");
        // golim tabelul si reincarcam din noul storage
        document.getElementById("corpTabel").innerHTML = "";
        storageManager.deschideDB(function() {storageManager.incarca(adaugaRand)});
    } else {
        storageManager = new LocalStorage();
        console.log("Storage: localStorage");
        // golim tabelul si reincarcam din noul storage
        document.getElementById("corpTabel").innerHTML = "";
        storageManager.incarca(adaugaRand);
    }
}

//listener de event - adaugat din cauza erorii ca nu imi gaseste functia de schimbaStorage
document.querySelectorAll('input[name="storage"]').forEach(function(radio) { //selectam toate butoanele care au name="storage"
    radio.addEventListener("change", function() { // eveniment declansat in functie de butonul selectat
        schimbaStorage(this.value);
    });
});
