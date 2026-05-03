# JacLy Documentation

Welcome to the JacLy documentation! This guide will help you get started with using JacLy.

## Supported microcontrollers

JacLy currently supports a subset of ESP32 microcontrollers.
The Jaculus framework works best on ESP32-S3 with external PSRAM.
It can be used on other ESP32 microcontrollers, but you may encounter program size and memory limitations.

The full list of supported chips:
- ESP32-S3 (best option — ideally with external PSRAM)
- ESP32

The source code of the Jaculus firmware is available on GitHub: [jaculus-org/Jaculus-esp32](https://github.com/jaculus-org/Jaculus-esp32).

## Getting Started

To get started with JacLy, you need to flash the Jaculus firmware onto your ESP32 microcontroller.
You can do it on the separate installer page [/installer](https://jacly.jaculus.org/installer) or directly from the JacLy editor.
The firmware contains a JS interpreter and all the necessary features to control peripherals and run your scripts.

The full guide on how to flash the firmware can be found in the [Flash Firmware](#flash-firmware) section of the documentation.

After flashing the firmware, you sometimes need to reset the chip by pressing the reset button on the board or simply reconnecting the power supply.

The next step is to [create your new project](/project/new). JacLy works as an online web editor, so you don't need to install any software on your computer (except for the USB drivers for some boards).

JacLy supports two types of projects:
- **Visual editor projects** — Blockly-based visual editor with a wide range of supported blocks. Great for beginners and for rapid prototyping.
- **Code editor projects** — for more advanced users who want to write their code in TypeScript or directly in JavaScript.

Select one of the templates and create the project.
The editor will open and automatically install the necessary dependencies for your project.

Using the [Package Manager](#package-manager) you can install additional libraries and packages to extend the functionality of your project.

To upload code to your device, connect your ESP32 board to your computer via USB, click the **Connect** button in the editor header and select your device from the list. After that, you can click **Flash** or **Build & Flash** to compile and run the code on your device.

When you successfully connect your device, the side panel with the serial monitor will open automatically so you can see the output of your program and interact with it via the serial input.

## Flash Firmware

Work in progress — the guide will be added soon. In the meantime, you can check the [installer page](/installer) for instructions on how to flash the firmware. The legacy installer is available at [https://installer.jaculus.org](https://installer.jaculus.org/).

## Package Manager

Work in progress — the guide will be added soon. In the meantime, you can browse the package repository on GitHub: [jaculus-org/Jaculus-libraries](https://github.com/jaculus-org/Jaculus-libraries).

## Troubleshooting

If you encounter any issues while using JacLy, please check the [FAQ](/docs/faq) section of the documentation, where you can find answers to the most common questions and problems.
