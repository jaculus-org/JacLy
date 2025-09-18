import { useJac } from '@/jaculus/provider/jac-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SelectConnection } from '@/components/jaculus/connect/SelectConnection';
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
  FolderPlus,
  FolderOpen,
  Wifi,
} from 'lucide-react';
import { JaculusDisconnected } from './disconnected';

export function JaculusInterface() {
  const { device, setDevice } = useJac();

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
    return <JaculusDisconnected />;
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
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Usb className="h-4 w-4" />
            Connection
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <SelectConnection oneLine={true} />

            {device && (
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDevice(null)}
                  className="gap-2"
                >
                  <Unplug className="h-4 w-4" />
                  Disconnect
                </Button>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
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
          <div className="flex gap-2">
            <Button variant="default" size="sm" className="gap-2">
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
          <div className="flex gap-2">
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
          <div className="flex gap-2">
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
          <div className="flex gap-2">
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

      {/* Project Management */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            Project Management
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <FolderPlus className="h-4 w-4" />
              Create New Project
            </Button>
            <Button variant="ghost" size="sm" className="gap-2">
              <FolderOpen className="h-4 w-4" />
              Update Project
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
