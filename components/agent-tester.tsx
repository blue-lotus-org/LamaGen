"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Play, ArrowRight, ChevronDown, ChevronUp } from "lucide-react"
import type { AgentConfig } from "@/types/agent"

interface AgentTesterProps {
  agentConfig: AgentConfig
  generatedCode: string
}

export function AgentTester({ agentConfig, generatedCode }: AgentTesterProps) {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [testHistory, setTestHistory] = useState<Array<{ input: string; output: string }>>([])
  const [expandedHistory, setExpandedHistory] = useState<number | null>(null)

  const runTest = async () => {
    if (!input.trim()) return

    setIsLoading(true)
    setOutput("")

    // Check if API keys are available
    const storedKeys = localStorage.getItem("agent-generator-api-keys")
    const apiKeys = storedKeys ? JSON.parse(storedKeys) : {}

    const requiredKey = agentConfig.model === "gemini" ? "gemini" : "mistral"

    if (!apiKeys[requiredKey]) {
      setOutput("Error: API key for " + agentConfig.model + " is missing. Please add it in Settings.")
      setIsLoading(false)
      return
    }

    // Simulate agent execution with a delay
    // In a real implementation, this would execute the agent code
    setTimeout(() => {
      // Generate a simulated response based on the input and agent config
      let simulatedOutput = `Agent "${agentConfig.name}" response:\n\n`

      if (agentConfig.customization?.useTools) {
        simulatedOutput += `[Using tools to process request]\n`
      }

      if (agentConfig.customization?.useRetrieval) {
        simulatedOutput += `[Retrieving relevant information]\n`
      }

      // Add some task-specific response
      if (agentConfig.tasks.length > 0) {
        simulatedOutput += `\nExecuting tasks:\n`
        agentConfig.tasks.forEach((task, index) => {
          simulatedOutput += `- ${task}: Completed\n`
        })
        simulatedOutput += `\n`
      }

      // Add a response based on the input
      simulatedOutput += `Based on your input "${input}", I've analyzed the request and prepared a response using the ${agentConfig.model} model.\n\n`

      // Add some random content based on the input
      if (input.toLowerCase().includes("weather")) {
        simulatedOutput += "The weather information you requested shows sunny conditions with a temperature of 72°F."
      } else if (input.toLowerCase().includes("search") || input.toLowerCase().includes("find")) {
        simulatedOutput += "I've searched for the information and found 5 relevant results that match your query."
      } else if (input.toLowerCase().includes("calculate") || input.toLowerCase().includes("math")) {
        simulatedOutput += "I've calculated the result: 42"
      } else {
        simulatedOutput +=
          "I've processed your request and completed the necessary tasks. Is there anything else you need help with?"
      }

      setOutput(simulatedOutput)
      // Store the full response in test history
      setTestHistory((prev) => [...prev, { input, output: simulatedOutput }])
      setIsLoading(false)
    }, 2000)
  }

  const toggleExpandHistory = (index: number) => {
    if (expandedHistory === index) {
      setExpandedHistory(null)
    } else {
      setExpandedHistory(index)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test Your Agent</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            placeholder="Enter a test input for your agent..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={3}
            className="resize-none"
          />
          <Button onClick={runTest} disabled={isLoading || !input.trim()} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Test
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Run Test
              </>
            )}
          </Button>
        </div>

        {output && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Output:</div>
            <div className="bg-secondary p-4 rounded-md whitespace-pre-wrap text-sm">{output}</div>
          </div>
        )}

        {testHistory.length > 0 && (
          <div className="space-y-2 mt-4">
            <div className="text-sm font-medium">Test History:</div>
            <div className="space-y-2">
              {testHistory.map((item, index) => (
                <div key={index} className="bg-secondary/50 p-3 rounded-md text-xs">
                  <div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => toggleExpandHistory(index)}
                  >
                    <div className="font-medium">Input: {item.input}</div>
                    <Button variant="ghost" size="sm">
                      {expandedHistory === index ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {expandedHistory === index && (
                    <div className="mt-2 border-t border-border pt-2">
                      <div className="font-medium mb-1">Response:</div>
                      <div className="whitespace-pre-wrap">{item.output}</div>
                    </div>
                  )}

                  {expandedHistory !== index && (
                    <div className="mt-2 text-muted-foreground flex items-center">
                      <ArrowRight className="h-3 w-3 mr-1" />
                      <span>
                        {item.output.split("\n")[0]}
                        {item.output.split("\n").length > 1 ? "..." : ""}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

