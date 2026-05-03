# Dokumentace JacLy

Vítejte v dokumentaci JacLy! Tento průvodce vám pomůže začít používat JacLy.

## Podporované mikrokontroléry

JacLy aktuálně podporuje podmnožinu mikrokontrolérů ESP32.
Framework Jaculus funguje nejlépe na ESP32-S3 s externím PSRAM.
Lze ho používat i na jiných mikrokontrolérech ESP32, ale může dojít k omezením způsobeným velikostí programu a dostupnou pamětí.

Úplný seznam podporovaných čipů:
- ESP32-S3 (nejlepší volba – ideálně s externím PSRAM)
- ESP32

Zdrojový kód firmwaru Jaculus je dostupný na GitHubu: [jaculus-org/Jaculus-esp32](https://github.com/jaculus-org/Jaculus-esp32).

## Začínáme

Abyste mohli začít používat JacLy, je potřeba nahrát firmware Jaculus do vašeho mikrokontroléru ESP32.
Lze to provést na samostatné instalační stránce [/installer](https://jacly.jaculus.org/installer) nebo přímo z editoru JacLy.
Firmware obsahuje interpret JavaScriptu a všechny potřebné funkce pro ovládání periferií a spouštění skriptů.

Podrobný návod na nahrání firmwaru najdete v části [Nahrání firmwaru](#nahrani-firmwaru).

Po nahrání firmwaru je někdy potřeba resetovat čip stisknutím tlačítka reset na desce nebo prostým odpojením a opětovným připojením napájení.

Dalším krokem je [vytvoření nového projektu](/project/new). JacLy funguje jako online webový editor, takže není potřeba instalovat žádný software do počítače (s výjimkou USB ovladačů pro některé desky).

JacLy podporuje dva typy projektů:
- Projekty ve vizuálním editoru – blokový editor postavený na Blockly se širokou nabídkou podporovaných bloků. Tento editor je vhodný pro začátečníky a pro prototypování.
- Projekty v textovém editoru – pro pokročilejší uživatele, kteří chtějí psát kód v TypeScriptu nebo přímo v JavaScriptu.

Vyberte jednu ze šablon a projekt vytvořte. Editor se otevře a automaticky nainstaluje potřebné závislosti.

Pomocí [Správce balíčků](#spravce-balicku) lze instalovat další knihovny a balíčky pro rozšíření funkcionality projektu.

K instalaci firmwaru slouží průvodce [Nahrání firmwaru](#nahrani-firmwaru), který vás provede celým procesem krok za krokem.
Základem je připojit desku ESP32 k počítači přes USB, kliknout na tlačítko Připojit v záhlaví editoru a vybrat zařízení ze seznamu. Poté klikněte na tlačítko Nahrát nebo Sestavit a nahrát pro nahrání kódu a jeho spuštění na zařízení.

Po úspěšném připojení zařízení se automaticky otevře postranní panel se sériovým monitorem, kde uvidíte výstup vašeho programu a můžete s ním interagovat prostřednictvím sériového vstupu.

## Nahrání firmwaru

Tato část dokumentace se připravuje. Mezitím si přečtěte pokyny na [stránce instalátoru](/installer). Starší verze instalátoru je dostupná na [https://installer.jaculus.org](https://installer.jaculus.org/).

## Správce balíčků

Tato část dokumentace se připravuje. Mezitím se podívejte na repozitář balíčků na GitHubu: [jaculus-org/Jaculus-libraries](https://github.com/jaculus-org/Jaculus-libraries).

## Řešení problémů

Pokud narazíte na jakýkoli problém při používání JacLy, přečtěte si část [FAQ](/docs/faq), kde najdete odpovědi na nejčastější dotazy a problémy.
