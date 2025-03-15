"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { APIKeys } from "@/types/agent"
import { Eye, EyeOff } from "lucide-react"

export function SettingsDialog() {
  const [open, setOpen] = useState(false)
  const [apiKeys, setApiKeys] = useState<APIKeys>({
    gemini: "",
    mistral: "",
  })
  const [showKeys, setShowKeys] = useState({
    gemini: false,
    mistral: false,
  })

  // Load API keys from localStorage on component mount
  useEffect(() => {
    const storedKeys = localStorage.getItem("agent-generator-api-keys")
    if (storedKeys) {
      setApiKeys(JSON.parse(storedKeys))
    }
  }, [])

  // Listen for custom event to toggle settings dialog
  useEffect(() => {
    const handleToggleSettings = () => setOpen(true)
    window.addEventListener("toggle-settings", handleToggleSettings)
    return () => window.removeEventListener("toggle-settings", handleToggleSettings)
  }, [])

  const handleSave = () => {
    localStorage.setItem("agent-generator-api-keys", JSON.stringify(apiKeys))
    setOpen(false)
  }

  const toggleShowKey = (key: keyof typeof showKeys) => {
    setShowKeys({
      ...showKeys,
      [key]: !showKeys[key],
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>API Keys</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="gemini-key">Google Gemini API Key</Label>
            <div className="flex">
              <Input
                id="gemini-key"
                type={showKeys.gemini ? "text" : "password"}
                placeholder="AIza..."
                value={apiKeys.gemini}
                onChange={(e) => setApiKeys({ ...apiKeys, gemini: e.target.value })}
                className="flex-1"
              />
              <Button variant="ghost" size="icon" onClick={() => toggleShowKey("gemini")} className="ml-2">
                {showKeys.gemini ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mistral-key">Mistral API Key</Label>
            <div className="flex">
              <Input
                id="mistral-key"
                type={showKeys.mistral ? "text" : "password"}
                placeholder="..."
                value={apiKeys.mistral}
                onChange={(e) => setApiKeys({ ...apiKeys, mistral: e.target.value })}
                className="flex-1"
              />
              <Button variant="ghost" size="icon" onClick={() => toggleShowKey("mistral")} className="ml-2">
                {showKeys.mistral ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground mt-2">
            Your API keys are stored locally in your browser and never sent to our servers.
          </p>
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

