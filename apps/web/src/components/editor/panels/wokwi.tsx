import { useRef } from 'react';
import { useJacProject } from '@/providers/jac-project-provider';

export function WokwiPanel() {
  const { device } = useJacProject();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // useEffect(() => {
  //   // Load code from localStorage if available
  //   const path = getProjectFsRoot(project.id) + '/code.js';
  //   if (!fs.existsSync(path)) {
  //     fs.writeFileSync(path, defaultJsCode, 'utf-8');
  //   }

  //   const handleMessage = async (event: MessageEvent) => {
  //     if (event.data && event.data.port) {
  //       console.log('Received MessagePort from iframe');

  //       const transport = new MessagePortTransport(event.data.port);
  //       const client = new APIClient(transport);
  //       clientRef.current = client;

  //       await client.connected;

  //       client.onConnected = async helloMessage => {
  //         console.log('Wokwi client connected', helloMessage);
  //         await loadDiagram();

  //         const firmwareResponse = await fetch('/bin/jaculus.uf2');
  //         const jaculusBinContent = await firmwareResponse.arrayBuffer();
  //         await client.fileUpload(
  //           'jaculus.uf2',
  //           new Uint8Array(jaculusBinContent)
  //         );

  //         window.dispatchEvent(
  //           new CustomEvent('wokwi-port-available', {
  //             detail: { port: event.data.port },
  //           })
  //         );
  //       };

  //       client.listen(
  //         'serial-monitor:data',
  //         (event: APIEvent<SerialMonitorDataPayload>) => {
  //           const rawBytes = new Uint8Array(event.payload.bytes);
  //           const text = new TextDecoder().decode(rawBytes);
  //           setOutput(prev => prev + text);
  //         }
  //       );

  //       client.listen('ui:clickStart', () => {
  //         handleStart();
  //       });

  //       client.onEvent = event => {
  //         console.log('Wokwi event:', event);
  //       };

  //       client.onError = error => {
  //         console.error('Wokwi error:', error);
  //       };
  //     }
  //   };

  //   window.addEventListener('message', handleMessage);
  //   console.log('Wokwi ESP32 MicroPython script loaded');

  //   return () => {
  //     window.removeEventListener('message', handleMessage);
  //   };
  // }, []);

  // const loadDiagram = async () => {
  //   if (clientRef.current) {
  //     const client = clientRef.current;

  //     const diagramPath = getProjectFsRoot(project.id) + '/diagram.json';
  //     if (!fs.existsSync(diagramPath)) {
  //       fs.writeFileSync(diagramPath, diagramDefault, 'utf-8');
  //     }
  //     const diagramFromFs = fs.readFileSync(diagramPath, 'utf-8');
  //     await client.fileUpload('diagram.json', diagramFromFs);
  //   }
  // };

  // const handleStart = async () => {
  //   if (clientRef.current) {
  //     const client = clientRef.current;
  //     await client.serialMonitorListen();
  //     await loadDiagram();

  //     await client.simStart({
  //       firmware: 'jaculus.uf2',
  //     });
  //   }
  // };

  if (!device) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-100 dark:bg-gray-900 text-slate-900 dark:text-gray-100">
        <p>
          No device connected. Please connect a Wokwi ESP32 device to use the
          simulator.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-100 dark:bg-gray-900 text-slate-900 dark:text-gray-100">
      <iframe
        ref={iframeRef}
        src="https://wokwi.com/experimental/embed"
        width="100%"
        height="100%"
        id="wokwi-embed"
        className="rounded-lg"
      ></iframe>
    </div>
  );
}
