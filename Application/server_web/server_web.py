#server = instanta a unei aplicatii care primeste cereri
#client = instanta care acceseaza serviciile puse la dispozitie de un server

# ultimul punct important!!!!!!!!!!!!!!!!!!!!!!!

import socket
import os
#pt tema 3 importam gzip si threading
import gzip
import threading
import json #lab 7

def construieste_raspuns(clientsocket, nume_resursa):

    gzipOK = True #pus pentru myWorker - el nu trebuie comprimat ca da eroare
    if nume_resursa.endswith('.html'):  #tipuri media
        tip_continut = 'text/html; charset=utf-8'
    elif nume_resursa.endswith('.json'):
        tip_continut = 'application/json'
        gzipOK = False
    elif nume_resursa.endswith('.xml'):
        tip_continut = 'application/xml'
    elif nume_resursa.endswith('.ico'):
        tip_continut = 'image/x-icon'
    elif nume_resursa.endswith('.css'):
        tip_continut = 'text/css'
    elif nume_resursa.endswith('.js'):
        tip_continut = 'application/javascript'
        gzipOK = False
    elif nume_resursa.endswith('.png'):
        tip_continut = 'image/png'
    elif nume_resursa.endswith('.gif'):
        tip_continut = 'image/gif' # greseala anterioara: text/gif GRESIT  
    elif nume_resursa.endswith('.jpg') or nume_resursa.endswith('.jpeg'):
        tip_continut = 'image/jpeg'
    else:
        tip_continut = 'text/plain; charset=utf-8'

    #determinam numele fisierului pe disc
    numefisier = os.path.join('..', 'continut', nume_resursa.lstrip('/'))
    #evident nu stiu sa scriu caile corect, asa ca am pus asta pentru erorile de cale
    print(">>> Resursa ceruta:", nume_resursa)
    print(">>> Caut fisierul la:", os.path.abspath(numefisier))
    
    #deschid fisierul
    try:
        #am schimbat in structura cu with ca sa imi si inchida fisierul
        with open(numefisier, "rb") as f: # rb - read binary pt imagini
            continut = f.read()
        
    except:
        #nu exista fisierul
        print('Fisier inexistent!')
        clientsocket.sendall(b"HTTP/1.1 404 Not Found\r\n\r\n") # \r\n de la header si celalalt e linia separatoare obligatorie
        return

    #linia de start
    clientsocket.sendall(b"HTTP/1.1 200 OK\r\n")
    #encode() pt ca sendall() accepta bytes si nu string
    clientsocket.sendall(("Content-Type: " + tip_continut + '\r\n').encode())
 
    if gzipOK:
        # comprimam si trimitem cu header gzip
        continut_final = gzip.compress(continut)
        clientsocket.sendall(b"Content-Encoding: gzip\r\n")
    else:
        # trimitem continutul necomprimat (fara header gzip) pt js
        continut_final = continut
 
    clientsocket.sendall(("Content-Length: " + str(len(continut_final)) + "\r\n").encode())
    clientsocket.sendall(b"\r\n")
    clientsocket.sendall(continut_final)
    
    #prim urmare nu mai avem nevoie de structura anterior creata cu trimiterea datelor pe fragmente cu bufferul de 1024

#creeaza un server socket
serversocket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

#specifica ca serverul va rula pe portul 5678, accesibil de pe orice ip al serverului
serversocket.bind(('', 5678))

#serverul poate accepta conexiuni; specifica cati clienti por astepta la coada ex. 5 clienti asteapta
serversocket.listen(5)

#functie construita pentru a procesa fiecare client in parte
def proceseaza_client(clientsocket, address):
    print('S-a conectat un client')

    #se proceseaza cererea si se citeste prima linie de text
    cerere =''
    linieDeStart = ''
    while True:
        data = clientsocket.recv(1024)

        if not data:
            break

        cerere = cerere + data.decode()

        print('S-a citit mesajul: \n---------------------------\n' + cerere + '\n---------------------------')
        #cautam sf liniei de start ca sa extragem linia de start
        pozitie = cerere.find('\r\n')
        
        #linia de start
        if(pozitie > -1):
            linieDeStart = cerere[0:pozitie]
            print('S-a citit linia de start din cerere: ##### ' + linieDeStart + '#####')
            break
    print('S-a terminat citirea.')
    
    if linieDeStart:
        parti = linieDeStart.split(' ')
         # parti[0] = metoda (GET)
         # parti[1] = resursa (/index.html)
         # parti[2] = versiunea
        if len(parti) >= 2:
            metoda = parti[0]
            nume_resursa = parti[1]
            #redirectionare catre index.html
            if nume_resursa == '/':
                nume_resursa = '/index.html'
                
            #lab 7
            if metoda == 'POST' and nume_resursa == '/api/utilizatori':
                # extragem body-ul din cerere
                separator = cerere.find('\r\n\r\n')
                if separator > -1:
                    body = cerere[separator + 4:]
                else:
                    body = ''
                
                continut_length = 0
                for linie in cerere.split('\r\n'):
                    if linie.lower().startswith('content-length:'):
                        continut_length = int(linie.split(':')[1].strip())
                        break

                while len(body.encode()) < continut_length:
                    data = clientsocket.recv(1024)
                    if not data:
                        break
                    body += data.decode()    
                    
                try:
                    utilizator_nou = json.loads(body)
                    cale_json = os.path.join('..', 'continut', 'resurse', 'utilizatori.json')

                    with open(cale_json, 'r', encoding='utf-8') as f:
                        utilizatori = json.load(f)

                    # verificam daca utilizatorul exista deja
                    for u in utilizatori:
                        if u['utilizator'] == utilizator_nou['utilizator']:
                            exista = True
                    #exista = any(u['utilizator'] == utilizator_nou['utilizator'] for u in utilizatori)
                    if exista:
                        raspuns_body = 'Utilizatorul există deja!'.encode('utf-8')
                        clientsocket.sendall(b"HTTP/1.1 302 Found\r\n")
                    else:
                        utilizatori.append(utilizator_nou)
                        with open(cale_json, 'w', encoding='utf-8') as f:
                            json.dump(utilizatori, f, ensure_ascii=False, indent=2)
                        raspuns_body = 'Utilizator înregistrat cu succes!'.encode('utf-8')
                        clientsocket.sendall(b"HTTP/1.1 200 OK\r\n")

                    clientsocket.sendall(b"Content-Type: text/plain; charset=utf-8\r\n")
                    clientsocket.sendall(("Content-Length: " + str(len(raspuns_body)) + "\r\n").encode())
                    clientsocket.sendall(b"Access-Control-Allow-Origin: *\r\n")
                    clientsocket.sendall(b"\r\n")
                    clientsocket.sendall(raspuns_body)

                except Exception as e:
                    print('Eroare POST:', e)
                    clientsocket.sendall(b"HTTP/1.1 500 Internal Server Error\r\n\r\n")

            else:
                construieste_raspuns(clientsocket, nume_resursa)

    clientsocket.close()
    print('S-a terminat comunicarea cu clientul.')

#cat timp conexiunea nu este inchisa
while True:
    print('###################################')
    print('Serverul asculta potentiali clienti')

    #metoda `accept` este blocanta => clientsocket, care reprezinta socket-ul corespunzator clientului conectat
    (clientsocket, address) = serversocket.accept()

    #facem un thread pt fiecare client: vine clientul -> il primitem spre procesare cu "ID-ul" sau ca argumente
    t = threading.Thread(target=proceseaza_client, args=(clientsocket, address))
    t.daemon = True # daca oprim programul toate threadurile vor fi ucise
    #daca aveam t.daemon = False atunci programul nostru nu s-ar fi incheiat decat in momentul in care toate threadurile s-ar fi terminat
    t.start()