export interface AgentConfig {
  name: string
  description: string
  model: "gemini" | "mistral"
  tasks: string[]
  workerCount: number
  outputFormat: "typescript"
  customization: {
    temperature: number
    maxTokens: number
    useTools: boolean
    useMemory: boolean
    useRetrieval: boolean
  }
  template?: string
}

export interface APIKeys {
  gemini: string
  mistral: string
}

export interface AgentTemplate {
  id: string
  name: string
  description: string
  config: Partial<AgentConfig>
  code: string
}

