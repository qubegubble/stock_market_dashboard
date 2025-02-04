# Stock Market Dashboard WEBLAB HS24 Projekt
# Kontext
Das Stock Market Dashboard stellt verschiedenste Aktien mit live updates zur Verfügung. Dies sollte dazu dienen das Stock traders möglichst schnell Informationen über den Markt bekommen können.

Als Software-Anbieter möchte ich das Stock Market Dashboard als SaaS anbieten. Das Dasboard besteht aus folgenden elementaren Teilen:
- User können sich registrieren und anmelden.
- Top Aktien werden als Dashboard angezeigt mit live updates
Optionaler Teil:
- User können ihr Dashboard modifizieren so wie sie es wollen.

## Must Haves
- *User Authentication*: Users should be able to register, log in and manage their profile.
- *Real-Time Stock Data fetching*: The backend should fetch stock data from an API (Alpha Vantage, Yahoo Finance) using Go Routines
- *Search and Filter*: Users should be able to search for for stocks by ticker symbol, company name, or industry
- *Database Storage*: Store user portfolios and historical stock data in PostgreSQL (with caching in Redis).
