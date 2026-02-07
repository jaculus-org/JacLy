import { useJacDevice } from "@/features/jac-device/provider/jac-device-provider";


export function WokwiSimulator() {
  const { device, connectionType } = useJacDevice();


  if(!device) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-100 dark:bg-gray-900 text-slate-900 dark:text-gray-100">
        <p>
          No device connected.
        </p>
        <p>Please connect a Jaculus device to use the Wokwi Simulator.</p>
      </div>
    );
  }

  if(connectionType !== 'wokwi') {
    return (
      <div className="flex items-center justify-center h-full bg-slate-100 dark:bg-gray-900 text-slate-900 dark:text-gray-100">
        <p>
          The connected device is not a Wokwi device.
        </p>
        <p>Please connect a Wokwi device to use the Wokwi Simulator.</p>
      </div>
    );
  }


  return (
    <div className="flex flex-col h-full bg-slate-100 dark:bg-gray-900 text-slate-900 dark:text-gray-100">
      <iframe
        // ref={iframeRef}
        // src="https://wokwi.com/experimental/embed"
        src="https://wokwi.com/experimental/viewer?api=1&diagram=https%3A%2F%2Fdocs.espressif.com%2Fprojects%2Farduino-esp32-wokwi-test%2Fen%2Fdocs-embed%2F_static%2Fbinaries%2Flibraries%2FESP32%2Fexamples%2FAnalogRead%2Fesp32%2Fdiagram.esp32.json&firmware=https%3A%2F%2Fdocs.espressif.com%2Fprojects%2Farduino-esp32-wokwi-test%2Fen%2Fdocs-embed%2F_static%2Fbinaries%2Flibraries%2FESP32%2Fexamples%2FAnalogRead%2Fesp32%2FAnalogRead.ino.merged.bin"
        width="100%"
        height="100%"
        id="wokwi-embed"
        className="rounded-lg"
      ></iframe>
    </div>
  );
}
