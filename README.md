# Stock Market Dashboard WEBLAB HS24 Projekt
# Kontext
Das Stock Market Dashboard stellt verschiedenste Aktien mit live updates zur Verfügung. Dies sollte dazu dienen das Stock traders möglichst schnell Informationen über den Markt bekommen können.

Als Software-Anbieter möchte ich das Stock Market Dashboard als SaaS anbieten. Das Dasboard besteht aus folgenden elementaren Teilen:
- User können sich registrieren und anmelden.
- Top Aktien werden als Dashboard angezeigt mit live updates
- Man kann nach Aktien suchen.

Optionaler Teil:
- User können ihr Dashboard modifizieren so wie sie es wollen.

# Anforderungen
- **User Story 1**: Registrieren / Anmelden auf der Webseite (Prio 'Must').
- **Akzeptanzkriterien**:
  - Anforderung für eine Registrierung:
    - Name, Vorname
    - E-Mail, von welcher das Format validiert werden muss
    - Passwort, Dieses **muss** gewisse Sicherheitsstandards erreichen. Genug lang (mind. 8 Zeichen), Enthält mindestens eine Nummer + ein Sonderzeichen
    - Bei der Registrierung muss der User Input Client-Seitig wie auch Server-Seitig validiert werden.
  - Die gleiche E-Mail kann nicht zwei mal registriert werden.
  - Nach dem registrieren kann man sich direkt via Login anmelden.

- **User Story 2**: Das Dashboard zeigt Aktien als Graphen an(Prio 'Could').
- **Akzeptanzkriterien**:
  - Aktien werden als Graphen dargestellt.
  - Die Graphen zeigen die Preistrends über eine gewisse Zeit (1 Tag, 1 Woche, etc.)

- **User Story 3**: Es können Aktien zum Dashboard hinzugefügt oder entfernt werden (Prio 'Must').
- **Akzeptanzkriterien**:
  - Via Suche kann man weitere Aktien finden und zu seinem Dashboard hinzufügen.
    - Die Aktien sollten über einen Button (z.B 'Add to Dashboard') hinzugefügt werden können.
  - Aktien die man nicht will können entfernt werden vom Dashboard.

- **User Story 4**: Web Sockets for live updates (Prio 'Should).
- **Akzeptanzkriterien**:
  - Es sollten Web-Sockets genutzt werden für real-time preis updates.
  - Preise werden aktualisiert ohne das die Seite aktualisiert werden muss.
  - Die Updates passieren in einem vordefinierten Zeitintervall (10Sekunden z.B)

- **User Story 5**: User Preference (Prio 'Should')
- **Akzeptanzkriterien**:
  - Mittels favorite button (stern z.B) können User Aktien favorisieren.
    - Z.B ein Sterm Symbol bei jeder Aktie und bei klicken auf dieses Symbol wird diese entweder favorisiert oder von den favoriten weggenommen falls bereits favorisiert.
  - Favorisierte Aktien werden immer zuerst geladen und sind auch zuoberst.

- **User Story 6**: Das Dashboard kann belibieg angepasst werden vom User (Prio 'Could).
- **Akzeptanzkriterien**:
  - Die Aktien können beliebig angeordnet werden nach Benutzer präferenzen.
    - Z.B kann per Drag&Drop oder Nummerierung die Reihenfolgen der dargestellten Aktien angepasst werden.

- **User Story 7**: User Portfolio und historische Stock Market Daten abspeichern können (Prio 'Should')
- **Akzeptanzkriterien**:
  - User Portfolio (Liste der favorisierten Aktien z.B) wird in einer DB persistiert.
  - Aktuelle Daten werden gecached für schnellen Zugriff.
    
# Technologiestack (vorübergehender Vorschlag)
## Frontend
- Für das Frontend wird [Angular(Version 19)](https://angular.dev/) + [D3js](https://d3js.org/) verwendet
  - **Begründung für diese Wahl**:
    - [Angular](https://angular.dev/) daher dieses sich gut für SPA eignet und es sowohl im Unterricht vorgestellt wird
    - [D3js](https://d3js.org/) daher sich dieses für die darstellung von Graphen und Dahsboards sehr gut eignet.
    - Für das Styling wird [Angular Material](https://material.angular.io/) verwendet daher man dort bereits vorgebaute Komponenten hat.

- Für das Backend wird [Expressjs](https://expressjs.com/) verwendet.
  - **Begründung für diese Wahl**:
    - Vorgegeben vom Kurs.
    - Hat WebSocket support + einfach zu deployen mit Docker.
