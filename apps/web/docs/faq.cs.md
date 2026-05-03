# Časté dotazy (FAQ)

## Co je JacLy?

JacLy je IDE běžící v prohlížeči pro tvorbu programů pro mikrokontroléry ESP32 pomocí firmwaru [Jaculus](https://github.com/jaculus-org/Jaculus-esp32). Kód lze psát buď ve vizuálním blokovém editoru, nebo přímo v TypeScriptu.

## Co je Jaculus?

Jaculus umožňuje spouštět JavaScript na vestavěných zařízeních.
Více informací o projektu najdete na [jaculus.org](https://jaculus.org/).

## Musím něco instalovat?

Ne. JacLy běží zcela v prohlížeči. Jediným požadavkem je kompatibilní prohlížeč (doporučujeme Chrome nebo Edge pro podporu Web Serial) a v případě některých desek příslušný USB ovladač.

## Které mikrokontroléry jsou podporovány?

JacLy podporuje podmnožinu mikrokontrolérů ESP32. Nejlepší výkon nabízí **ESP32-S3** s externím PSRAM. Mezi další podporované čipy patří ESP32 a varianty ESP32-S3. Úplný seznam najdete v [Dokumentaci](/docs/#podporovane-mikrokontrolery).

## Jak nahraji firmware?

Otevřete stránku [Instalátor](/installer), připojte ESP32 přes USB, vyberte čip a verzi firmwaru a klikněte na **Nahrát firmware**. Po nahrání stiskněte tlačítko reset na desce pro spuštění nového firmwaru.

## Moje zařízení není detekováno — co mám dělat?

1. Ujistěte se, že používáte Chrome nebo Edge (Firefox Web Serial nepodporuje).
2. Nainstalujte USB ovladač pro svou desku, pokud je potřeba (např. ovladač CH340 nebo CP2102).
3. Zkuste jiný USB kabel — některé kabely přenáší pouze napájení.
4. Ověřte, že port nemá otevřený jiný program (sériový terminál, Arduino IDE).

## Mohu JacLy používat offline?

JacLy je PWA (Progressive Web App) a lze ho nainstalovat přímo z prohlížeče. Funkce vyžadující připojení k internetu (načítání šablon, balíčků) offline nefungují, ale editace a spouštění kódu na připojeném zařízení fungovat bude.

## Kde jsou uloženy moje projekty?

Projekty jsou uloženy lokálně v prohlížeči pomocí IndexedDB. Na žádný server se nenahrávají. Projekt lze exportovat jako ZIP archiv ze stránky Projekty.
