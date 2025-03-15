import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { AgentConfig } from "@/types/agent"

interface AgentPreviewProps {
  agentConfig: AgentConfig
}

export function AgentPreview({ agentConfig }: AgentPreviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent Preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!agentConfig.name && !agentConfig.description ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-muted-foreground">Configure your agent to see a preview</p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">{agentConfig.name || "Unnamed Agent"}</h3>
              <p className="text-muted-foreground">{agentConfig.description || "No description provided"}</p>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Configuration</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{agentConfig.model === "gemini" ? "Gemini" : "Mistral"} Model</Badge>
                <Badge variant="outline">{agentConfig.workerCount} Workers</Badge>
                <Badge variant="outline">TypeScript Output</Badge>
                <Badge variant="outline">Temp: {agentConfig.customization?.temperature.toFixed(1) || "0.7"}</Badge>
                <Badge variant="outline">Max Tokens: {agentConfig.customization?.maxTokens || "1000"}</Badge>
                {agentConfig.customization?.useTools && <Badge variant="secondary">Uses Tools</Badge>}
                {agentConfig.customization?.useMemory && <Badge variant="secondary">Uses Memory</Badge>}
                {agentConfig.customization?.useRetrieval && <Badge variant="secondary">Uses Retrieval</Badge>}
                {agentConfig.template && <Badge variant="primary">From Template</Badge>}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Tasks ({agentConfig.tasks.length})</h4>
              {agentConfig.tasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tasks defined</p>
              ) : (
                <ul className="space-y-1">
                  {agentConfig.tasks.map((task, index) => (
                    <li key={index} className="text-sm bg-secondary p-2 rounded-md">
                      {task}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Architecture</h4>
              <div className="bg-secondary p-4 rounded-md">
                <div className="flex flex-col items-center space-y-4">
                  <div className="bg-primary text-primary-foreground px-4 py-2 rounded-md w-full max-w-xs text-center">
                    Manager Agent
                  </div>
                  <div className="w-0.5 h-4 bg-border"></div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {Array.from({ length: agentConfig.workerCount }).map((_, i) => (
                      <div
                        key={i}
                        className="bg-accent text-accent-foreground px-4 py-2 rounded-md w-24 text-center text-sm"
                      >
                        Worker {i + 1}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {(agentConfig.customization?.useTools ||
              agentConfig.customization?.useMemory ||
              agentConfig.customization?.useRetrieval) && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Features</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {agentConfig.customization?.useTools && (
                    <div className="bg-secondary p-2 rounded-md text-xs">
                      <div className="font-medium">Tools</div>
                      <div className="text-muted-foreground">Agent can use external tools and APIs</div>
                    </div>
                  )}
                  {agentConfig.customization?.useMemory && (
                    <div className="bg-secondary p-2 rounded-md text-xs">
                      <div className="font-medium">Memory</div>
                      <div className="text-muted-foreground">Agent remembers previous interactions</div>
                    </div>
                  )}
                  {agentConfig.customization?.useRetrieval && (
                    <div className="bg-secondary p-2 rounded-md text-xs">
                      <div className="font-medium">Retrieval</div>
                      <div className="text-muted-foreground">Agent can search through documents</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

