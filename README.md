# Hudobný portál

**Autor**: Tomaš Babjak, Daniel Minarik

---

## Spustenie systému
Požiadavkov na spustenie servara je mať nainštalovaný Node verzie 8.0.0 a vyššie. Následne spustenie sa realizujú nasledovne.

1. Rozbaľ zip súbor
2. Prejdi do daného priečinka s projektom
3. Spusti príkaz npm install -> vykoná inštalovanie balíčkov(framework,...)
4. Spusti príkaz *adonis serve --dev* -> spustenie servera
5. Server je predvolene spustený na adrese http://127.0.0.1:3333

Na správne pracovanie je potrebné taktiež definovať pripojenie na databázu. Vytvorenie objektov v tejto databáze sa následne realizuje pomocou migrácií, resp. spustením príkazu *adonis migration:run*; *adonis seed*
