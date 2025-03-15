"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import type { AgentConfig } from "@/types/agent"
import { Plus, Trash2, Loader2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TemplateGallery } from "@/components/template-gallery"

interface AgentFormProps {
  agentConfig: AgentConfig
  setAgentConfig: (config: AgentConfig) => void
  onGenerate: () => void
  isGenerating: boolean
  onTemplateSelect: (templateId: string) => void
}

export function AgentForm({ agentConfig, setAgentConfig, onGenerate, isGenerating, onTemplateSelect }: AgentFormProps) {
  const [newTask, setNewTask] = useState("")
  const [formTab, setFormTab] = useState("basic")

  useEffect(() => {
    // If a template is selected, switch to basic tab to show the updated fields
    if (agentConfig.template) {
      setFormTab("basic")
    }
  }, [agentConfig.template])

  const addTask = () => {
    if (newTask.trim()) {
      setAgentConfig({
        ...agentConfig,
        tasks: [...agentConfig.tasks, newTask.trim()],
      })
      setNewTask("")
    }
  }

  const removeTask = (index: number) => {
    setAgentConfig({
      ...agentConfig,
      tasks: agentConfig.tasks.filter((_, i) => i !== index),
    })
  }

  const handleTemplateSelect = (template: any) => {
    setAgentConfig({
      ...agentConfig,
      ...template.config,
      template: template.id,
    })
    onTemplateSelect(template.id)
  }

  return (
    <Tabs value={formTab} onValueChange={setFormTab} className="space-y-4">
      <TabsList>
        <TabsTrigger value="templates">Templates</TabsTrigger>
        <TabsTrigger value="basic">Basic</TabsTrigger>
        <TabsTrigger value="advanced">Advanced</TabsTrigger>
      </TabsList>

      <TabsContent value="templates">
        <TemplateGallery onSelectTemplate={handleTemplateSelect} />
      </TabsContent>

      <TabsContent value="basic">
        <Card>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Agent Name</Label>
              <Input
                id="name"
                placeholder="Enter agent name"
                value={agentConfig.name}
                onChange={(e) => setAgentConfig({ ...agentConfig, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what your agent does"
                value={agentConfig.description}
                onChange={(e) => setAgentConfig({ ...agentConfig, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>AI Model</Label>
              <RadioGroup
                value={agentConfig.model}
                onValueChange={(value) => setAgentConfig({ ...agentConfig, model: value as "gemini" | "mistral" })}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="gemini" id="gemini" />
                  <Label htmlFor="gemini">Gemini</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mistral" id="mistral" />
                  <Label htmlFor="mistral">Mistral</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <Label>Worker Count: {agentConfig.workerCount}</Label>
              </div>
              <Slider
                value={[agentConfig.workerCount]}
                min={1}
                max={5}
                step={1}
                onValueChange={(value) => setAgentConfig({ ...agentConfig, workerCount: value[0] })}
              />
            </div>

            <div className="space-y-2">
              <Label>Tasks</Label>
              <div className="flex space-x-2">
                <Input
                  placeholder="Add a task for your agent"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addTask()
                    }
                  }}
                />
                <Button type="button" onClick={addTask} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2 mt-2">
                {agentConfig.tasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No tasks added yet. Add tasks that your agent will perform.
                  </p>
                ) : (
                  agentConfig.tasks.map((task, index) => (
                    <div key={index} className="flex items-center justify-between bg-secondary p-2 rounded-md">
                      <span className="text-sm">{task}</span>
                      <Button variant="ghost" size="icon" onClick={() => removeTask(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="advanced">
        <Card>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between">
                <Label>Temperature: {agentConfig.customization?.temperature.toFixed(1)}</Label>
              </div>
              <Slider
                value={[agentConfig.customization?.temperature || 0.7]}
                min={0}
                max={1}
                step={0.1}
                onValueChange={(value) =>
                  setAgentConfig({
                    ...agentConfig,
                    customization: {
                      ...agentConfig.customization,
                      temperature: value[0],
                    },
                  })
                }
              />
              <p className="text-xs text-muted-foreground">
                Lower values make output more focused and deterministic. Higher values make output more creative and
                varied.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <Label>Max Tokens: {agentConfig.customization?.maxTokens}</Label>
              </div>
              <Slider
                value={[agentConfig.customization?.maxTokens || 1000]}
                min={100}
                max={4000}
                step={100}
                onValueChange={(value) =>
                  setAgentConfig({
                    ...agentConfig,
                    customization: {
                      ...agentConfig.customization,
                      maxTokens: value[0],
                    },
                  })
                }
              />
              <p className="text-xs text-muted-foreground">Maximum number of tokens to generate in the response.</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="use-tools">Use Tools</Label>
                <Switch
                  id="use-tools"
                  checked={agentConfig.customization?.useTools || false}
                  onCheckedChange={(checked) =>
                    setAgentConfig({
                      ...agentConfig,
                      customization: {
                        ...agentConfig.customization,
                        useTools: checked,
                      },
                    })
                  }
                />
              </div>
              <p className="text-xs text-muted-foreground">Enable the agent to use external tools and APIs.</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="use-memory">Use Memory</Label>
                <Switch
                  id="use-memory"
                  checked={agentConfig.customization?.useMemory || false}
                  onCheckedChange={(checked) =>
                    setAgentConfig({
                      ...agentConfig,
                      customization: {
                        ...agentConfig.customization,
                        useMemory: checked,
                      },
                    })
                  }
                />
              </div>
              <p className="text-xs text-muted-foreground">Enable the agent to remember previous interactions.</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="use-retrieval">Use Retrieval</Label>
                <Switch
                  id="use-retrieval"
                  checked={agentConfig.customization?.useRetrieval || false}
                  onCheckedChange={(checked) =>
                    setAgentConfig({
                      ...agentConfig,
                      customization: {
                        ...agentConfig.customization,
                        useRetrieval: checked,
                      },
                    })
                  }
                />
              </div>
              <p className="text-xs text-muted-foreground">Enable the agent to retrieve information from documents.</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <Button
        onClick={onGenerate}
        disabled={isGenerating || !agentConfig.name || !agentConfig.description || agentConfig.tasks.length === 0}
        className="w-full mt-4"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating Agent
          </>
        ) : (
          "Generate Agent"
        )}
      </Button>
    </Tabs>
  )
}

