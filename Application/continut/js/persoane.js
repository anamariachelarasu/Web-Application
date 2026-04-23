//functia e atasata la window ca sa poata fi apelata din orice loc
//folosita de schimbaContinut care face window[jsFunctie]()


window.incarcaPersoane = async function () {
    console.log("Hello din persoane.js!");
    //cream obiectul
    var xhttp = new XMLHttpRequest();

    //callback apelat cand starea cererii se schimba
    xhttp.onreadystatechange = function() {
        //cand raspunsul e gata si 200 ca server a raspuns cu succes
        if(xhttp.readyState == 4 && xhttp.status == 200) {
            //luam direct XML-ul ca DOM
            var xmlDoc = this.responseXML;
            var persoane = xmlDoc.getElementsByTagName("persoana");

            //construim un tabel
            let tabel = "<table border='1'>";
            tabel += "<tr><th>Nume</th><th>Prenume</th><th>Vârsta</th><th>Adresa</th></tr>";

            //pt fiecare persoana din XML
            for (let i = 0; i < persoane.length; i++)
            {
                //luam primul tag <nume> din interiorul <persoana>, primul nod copil al tagului si valoarea acestuia 
                var nume = persoane[i].getElementsByTagName("nume")[0].childNodes[0].nodeValue;
                var prenume = persoane[i].getElementsByTagName("prenume")[0].childNodes[0].nodeValue;
                var varsta = persoane[i].getElementsByTagName("varsta")[0].childNodes[0].nodeValue;
                
                var adresa = persoane[i].getElementsByTagName("adresa")[0];

                var strada = adresa.getElementsByTagName("strada")[0].childNodes[0].nodeValue;
                var numar = adresa.getElementsByTagName("numar")[0].childNodes[0].nodeValue;
                var localitate = adresa.getElementsByTagName("localitate")[0].childNodes[0].nodeValue;

                var adresa = strada + " " + numar + ", " + localitate;

                tabel += `<tr><td>${nume}</td><td>${prenume}</td><td>${varsta}</td><td>${adresa}</td></tr>`;
            }
            tabel += "</table>";

            //punem in continut tot tabelul
            document.getElementById("continut").innerHTML = tabel;
        }
    };

    //configurarea cererii
    xhttp.open("GET", "resurse/persoane.xml", true);
    //trimiterea cererii
    xhttp.send();
}
