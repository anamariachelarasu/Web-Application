self.onmessage = function(e) {
    //worker primeste p trimis in adaugaProdus
    console.log("Worker: s-a primit produsul!", e.data);

    //trimite inapoi raspunsul
    self.postMessage(e.data);
}