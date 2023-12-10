Jak používate aplikaci:

- aplikace je vedená z pohledu uživatele Jirka
- pro načtení mockovaných dat je potřeba překopírovat data z mock_data_and_server/MOCK_DATA do složky mock_data_and_server/data 
- při startu aplikace se načtou nákupní seznamy a uživatele informujeme o tom, že komunikace se serverem proběhla úspěšně/neúspěšně
- pak můžeme dělat libovolné změny, které se budou zaznamenávat. Pokud chceme začít znovu z mnou definovaného výchozího stavu, tak je potřeba nakopírovat opět mock data do pracovních dat
- jméno položky v nákupním seznamu změníme tak, že klikneme na položku upravíme jméno a kliknutím někam vedle se provede API call a výsledek se uloží
- dalšího člena do seznamu můžeme přidat, ale musí to být člen, kterého máme v users.json v datech. Pokud tam není tak API call vrátí chybu representovanou modálním oknem
