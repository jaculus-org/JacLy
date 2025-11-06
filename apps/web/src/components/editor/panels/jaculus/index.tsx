import { JacConnection } from '@/components/device/connect';
import { ConnectionSelector } from '@/components/device/connection-selector';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useJacProject } from '@/providers/jac-project-provider';
import { useTerminal } from '@/hooks/terminal-store';
import {
  Usb,
  Unplug,
  Settings,
  Play,
  Square,
  Terminal as TerminalIcon,
  Zap,
  Upload,
  Monitor,
  Eye,
  Wifi,
} from 'lucide-react';
import type { JaclyProject } from '@/lib/projects/project-manager';
import { jacCompile } from '@/lib/device/jaculus';

interface JaculusPanelProps {
  project: JaclyProject;
}

export function JaculusPanel({ project }: JaculusPanelProps) {
  const { device, setDevice } = useJacProject();
  const terminal = useTerminal();

  const handleStop = async () => {
    if (device) {
      try {
        await device.controller.stop();
      } catch (error) {
        console.error('Failed to stop program:', error);
      }
    }
  };

  if (!device) {
    return <JacConnection />;
  }

  return (
    <div className="h-full w-full p-4 space-y-4 overflow-y-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Jaculus Control Panel</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
          Connected
        </div>
      </div>

      {/* Connection */}
      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Usb className="h-4 w-4" />
            Connection
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <ConnectionSelector
              oneLine={true}
              addToTerminal={terminal.addEntry}
            />

            {device && (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDevice(null)}
                  className="gap-2"
                >
                  <Unplug className="h-4 w-4" />
                  Disconnect
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Build & Flash */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Build & Flash
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="default"
              size="sm"
              className="gap-2"
              onClick={async () => jacCompile(project, terminal.addEntry)}
            >
              <Upload className="h-4 w-4" />
              Build
            </Button>
            <Button variant="default" size="sm" className="gap-2">
              <Zap className="h-4 w-4" />
              Flash
            </Button>
            <Button variant="default" size="sm" className="gap-2">
              <Upload className="h-4 w-4" />
              Build, Flash & Monitor
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Device Control */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Play className="h-4 w-4" />
            Device Control
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Play className="h-4 w-4" />
              Start Program
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleStop}
              className="gap-2"
            >
              <Square className="h-4 w-4" />
              Stop Program
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Monitor className="h-4 w-4" />
              Monitor
            </Button>
            <Button variant="ghost" size="sm" className="gap-2">
              <Eye className="h-4 w-4" />
              Show Version
            </Button>
            <Button variant="ghost" size="sm" className="gap-2">
              <TerminalIcon className="h-4 w-4" />
              Show Status
            </Button>
            <Button variant="ghost" size="sm" className="gap-2">
              <Settings className="h-4 w-4" />
              Format Storage
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* WiFi Configuration */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Wifi className="h-4 w-4" />
            WiFi Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Wifi className="h-4 w-4" />
              Configure WiFi
            </Button>
            <Button variant="ghost" size="sm" className="gap-2">
              <Settings className="h-4 w-4" />
              Disable Minimal Mode
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" size="sm" className="gap-2">
              <Settings className="h-4 w-4" />
              Check for Jac Updates
            </Button>
            <Button variant="ghost" size="sm" className="gap-2">
              <Settings className="h-4 w-4" />
              Disable Minimal Mode
            </Button>
            <Button variant="ghost" size="sm" className="gap-2">
              <Settings className="h-4 w-4" />
              Show Level (Info)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
