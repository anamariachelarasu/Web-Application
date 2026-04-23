/* timp */
function getMyTime()
{
    let elem=document.getElementById("myTime");
    if (!elem) return;
    const timp = new Date();
    elem.innerHTML = "Data curenta este " + timp.toLocaleDateString() + "<br>Timpul curent este: " + timp.toLocaleTimeString();
}

function myLoad()
{
    /* functia se va apela o data la 500 ms) */
    /* gresit: setInterval(getMyTime(), 500); pt ca va avea parametri number, number in loc de functie, functie */
    setInterval(getMyTime, 500);
}

/* URL */
function getmyURL()
{
    let elem = document.getElementById("myURL");
    if (!elem) return;
    elem.innerHTML = "URL-ul meu este " + window.location.href;
}

function myURLoad()
{
    setInterval(getmyURL, 500);
}

/* locatie */
function afiseazaLocatia(position)
{
    console.log(position);
    let x = document.getElementById("myLocation");
    if (!position || !position.coords) {
        x.innerHTML = "Locația: date indisponibile.";
        return;
    }
    x.innerHTML = "Latitudine: " + position.coords.latitude + "<br>Longitudine: " + position.coords.longitude;
}

function myLocationLoad()
{
    console.log("aaaaaa");
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(afiseazaLocatia);
    } else {
        document.getElementById("myLocation").innerHTML = "Locația: browserul nu suportă geolocation.";
    }
}
/* browser */
var user = navigator.userAgent;

function getMyBrowser()
{
    let x = document.getElementById("myBrowser");
    if (!x) return;
    x.innerHTML = "Browser: " + user;
}

function myBroswerLoad()
{
    setInterval(getMyBrowser, 500);
}

function getMyOS()
{

    let x = document.getElementById("myOS");
    if (!x) return;
    let os = "Necunoscut";
    if (navigator.userAgent.indexOf("Win") !== -1)
        os = "Windows";
    else
        if (navigator.userAgent.indexOf("Mac") !== -1)
            os = "macOS";
    x.innerHTML = "Sistem de operare: " + os;
}

function myOSLoad()
{
    setInterval(getMyOS, 500);
}

function initCanvas() {
    const myCanvas = document.getElementById("myCanvas");
    const ctx = myCanvas.getContext("2d");

    // incarca imaginea
    const img = new Image();
    img.src = "imagini/pisica_canvas.jpg";
    img.onload = function() {
    ctx.drawImage(img, 0, 0, myCanvas.width, myCanvas.height);
    };
}

/* Tema 2 - facut la laborator*/
// schimbam declararea din let in var pt ca la reincarcarea paginii "Desen" Javascript incearca sa le declare din nou
var px1 = -1;
var py1 = -1;
function press(e)
{
    console.log("Hello from script.js press() fun")
    const myCanvas = document.getElementById("myCanvas");
    const ctx = myCanvas.getContext("2d");
    console.log(e);
    if(px1 == -1) /* prima apasare */
    {
        px1 = e.offsetX;
        py1 = e.offsetY;
    }
    else /* a doua apasare */
    {
        let px2 = e.offsetX;
        let py2 = e.offsetY;
        let x = Math.min(px1, px2);
        let y = Math.min(py1, py2);
        let myWidth  = Math.abs(px1 - px2);
        let myHeight = Math.abs(py1 - py2);

        const fill = document.getElementById("fill").value;
        const stroke = document.getElementById("stroke").value;

        ctx.fillStyle = fill;
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 3;
        
        ctx.fillRect(x, y, myWidth, myHeight);
        ctx.strokeRect(x, y, myWidth, myHeight);

        px1 = -1;   // reset pt urmatoarea pereche de clickuri
        py1 = -1;
    }
}

/* Tema 3 */
function insertRow() {
    const table = document.getElementById("myTable");
    // luam pozitia liniei si culoarea selectata
    const rowPos = parseInt(document.getElementById("rowPos").value);
    const color = document.getElementById("rowColor").value;

    //if introdus ca sa scap de eroarea: Uncaught DOMException: Index or size is negative or greater than the allowed amount
    if (isNaN(rowPos) || rowPos < 0 || rowPos > table.rows.length) {
        console.log("eroare fun insertRow: nu e valoarea valida intre 0 și " + table.rows.length);
        return;
    }

    // creare rand nou
    const newRow = table.insertRow(rowPos);

    // Numarul de coloane va fi egal cu primul rand existent
    const col = table.rows[0].cells.length;

    // Pracurgem coloanele si inseram celule
    for (let i = 0; i < col; i++) {
        const newCell = newRow.insertCell(i);
        newCell.innerHTML = "hei";
        newCell.style.backgroundColor = color;
    }
}

function insertCol() {
    const table = document.getElementById("myTable");
    const colPos = parseInt(document.getElementById("colPos").value);
    const color = document.getElementById("colColor").value;

    //if introdus ca sa scap de eroarea: Uncaught DOMException: Index or size is negative or greater than the allowed amount
    if (isNaN(colPos) || colPos < 0 || colPos > table.rows[0].cells.length) {
        console.log("eroare fun insertCol: nu e valoarea valida intre 0 și " + table.rows[0].cells.length);
        return;
    }

    // Parcurgem liniile si inseram celulele
    for (let i = 0; i < table.rows.length; i++) {
        //pt fiecare linie mergem si inseram la pozitia aleasa pentru coloana si inseram acolo
        const row = table.rows[i];
        const newCell = row.insertCell(colPos);
        newCell.innerHTML = "hei";
        newCell.style.backgroundColor = color;
    }
}

window.incarcaFunctii = async function ()
{
    myLoad();
    myURLoad();
    myLocationLoad();
    myBroswerLoad();
    myOSLoad();
    initCanvas();
    insertCol();
    insertRow();
}

//butonul de inregistreaza
async function inregistreaza() {
    const utilizator = document.getElementById("nutilizator").value;
    const parola = document.getElementById("parola").value;
    const prenume = document.getElementById("prenume").value;
    const nume = document.getElementById("nume").value;
    const email = document.getElementById("email").value;
    const telefon = document.getElementById("telefon").value;
    const sex = document.getElementById("sex").value;
    const mancare = document.getElementById("mancare").value;
    const culoare = document.getElementById("culoare").value;
    const dnastere = document.getElementById("dnastere").value;
    const onastere = document.getElementById("onastere").value;
    const varsta = document.getElementById("varsta").value;
    const website = document.getElementById("website").value;
    const descriere = document.getElementById("descriere").value;

    try {
        const res = await fetch("/api/utilizatori", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ utilizator, parola, prenume, nume, email, telefon, sex, mancare, culoare, dnastere, onastere, varsta, website, descriere })
        });

        const text = await res.text();
        const rezultat = document.getElementById("rezultat");
        rezultat.style.color = "green";
        rezultat.innerHTML = text;
    } catch (err) {
        const rezultat = document.getElementById("rezultat");
        rezultat.style.color = "red";
        rezultat.innerHTML = "Eroare: " + err.message;
    }
}