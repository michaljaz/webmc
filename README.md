# web-minecraft
Render minecrafta w przeglądarce
<h1>Instalacja</h1>

```bash
#Instalacja repozytorium
git clone https://github.com/michaljaz/web-minecraft

#Instalacja i uruchomienie serwera node.js 
#(Proces 1)
npm install -g http-server
http-server web-minecraft/

#Uruchomienie serwera gry socket.io 
#(Proces 2, ten proces musisz wywołać w osobnej zakładce: np. klikając Ctrl+Shift+T)
node web-minecraft/server/server.js

```

<h1>Jak uruchomić grę?</h1>
Aby włączyć grę wystarczy, że wejdziesz w link: <a href="http://localhost:8080/">http://localhost:8080/</a>.<br>
<i>(Najpierw oczywiście musisz wykonać kroki podane powyżej)</i>
