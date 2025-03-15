"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { AgentTemplate } from "@/types/agent"
import { templates } from "@/data/templates"

interface TemplateGalleryProps {
  onSelectTemplate: (template: AgentTemplate) => void
}

export function TemplateGallery({ onSelectTemplate }: TemplateGalleryProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  const handleSelect = (template: AgentTemplate) => {
    setSelectedTemplate(template.id)
    onSelectTemplate(template)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Pre-built Templates</h3>
        <p className="text-sm text-muted-foreground">
          Choose a template to get started quickly with common agent patterns.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card
            key={template.id}
            className={`cursor-pointer transition-all ${selectedTemplate === template.id ? "ring-2 ring-primary" : ""}`}
            onClick={() => handleSelect(template)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{template.name}</CardTitle>
              <CardDescription className="text-xs">{template.description}</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="text-xs space-y-1">
                <div>Model: {template.config.model || "Any"}</div>
                <div>Workers: {template.config.workerCount || "Default"}</div>
                {template.config.customization?.useTools && <div className="text-primary">Uses Tools</div>}
                {template.config.customization?.useMemory && <div className="text-primary">Uses Memory</div>}
                {template.config.customization?.useRetrieval && <div className="text-primary">Uses Retrieval</div>}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation() // Prevent double triggering
                  handleSelect(template)
                }}
              >
                Use Template
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

