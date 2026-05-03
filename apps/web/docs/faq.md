# Frequently Asked Questions

## What is JacLy?

JacLy is a browser-based IDE for creating programs for ESP32 microcontrollers using the [Jaculus](https://github.com/jaculus-org/Jaculus-esp32) firmware. You can write code either in a visual blocks editor or directly in TypeScript.

## What is Jaculus?

Jaculus allows for running JavaScript code on embedded devices.
More information about the project can be found on [jaculus.org](https://jaculus.org/).

## Do I need to install anything?

No. JacLy runs entirely in the browser. The only requirement is a compatible browser (Chrome or Edge recommended for Web Serial support) and, for some boards, the appropriate USB driver.

## Which microcontrollers are supported?

JacLy supports a subset of ESP32 microcontrollers. The best experience is on **ESP32-S3** with external PSRAM. Other supported chips include ESP32 and ESP32-S3 variants. See the [Documentation](/docs/#supported-microcontrollers) for the full list.

## How do I flash the firmware?

Open the [Installer](/installer) page, connect your ESP32 via USB, select your chip and firmware version, and click **Flash firmware**. After flashing, press the reset button on your board to boot into the new firmware.

## My device is not detected — what do I do?

1. Make sure you are using Chrome or Edge (Firefox does not support Web Serial).
2. Install the USB driver for your board if needed (e.g. CH340 or CP2102 driver).
3. Try a different USB cable — some cables are power-only.
4. Ensure no other program (serial terminal, Arduino IDE) has the port open.

## Can I use JacLy offline?

JacLy is a PWA (Progressive Web App) and can be installed from the browser. Some features that require fetching templates or packages from the internet will not work offline, but editing and running code on a connected device will work.

## Where is my project stored?

Projects are stored locally in your browser using IndexedDB. They are not uploaded to any server. You can export a project as a ZIP archive from the Projects page.
