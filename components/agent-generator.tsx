"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AgentForm } from "@/components/agent-form"
import { AgentPreview } from "@/components/agent-preview"
import { AgentOutput } from "@/components/agent-output"
import { AgentTester } from "@/components/agent-tester"
import { SettingsDialog } from "@/components/settings-dialog"
import type { AgentConfig } from "@/types/agent"
import { templates } from "@/data/templates"

export function AgentGenerator() {
  const [agentConfig, setAgentConfig] = useState<AgentConfig>({
    name: "",
    description: "",
    model: "mistral", // Default to mistral
    tasks: [],
    workerCount: 2,
    outputFormat: "typescript",
    customization: {
      temperature: 0.7,
      maxTokens: 1000,
      useTools: false,
      useMemory: false,
      useRetrieval: false,
    },
  })

  const [generatedCode, setGeneratedCode] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState("configure")

  // Check if API keys are set
  useEffect(() => {
    const storedKeys = localStorage.getItem("agent-generator-api-keys")
    if (!storedKeys) {
      // Trigger settings dialog if no API keys are set
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("toggle-settings"))
      }, 500)
    }
  }, [])

  // Detect AI model from tasks
  useEffect(() => {
    if (agentConfig.tasks.length > 0) {
      // Check if any task mentions Gemini
      const hasGeminiTask = agentConfig.tasks.some(
        (task) => task.toLowerCase().includes("gemini") || task.toLowerCase().includes("google"),
      )

      // Check if any task mentions Mistral
      const hasMistralTask = agentConfig.tasks.some((task) => task.toLowerCase().includes("mistral"))

      // Update model based on task content
      if (hasGeminiTask && !hasMistralTask) {
        setAgentConfig((prev) => ({ ...prev, model: "gemini" }))
      } else if (hasMistralTask && !hasGeminiTask) {
        setAgentConfig((prev) => ({ ...prev, model: "mistral" }))
      }
    }
  }, [agentConfig.tasks])

  const handleTemplateSelect = (templateId: string) => {
    // Find the selected template
    const template = templates.find((t) => t.id === templateId)
    if (template) {
      // Create a merged config that preserves user's name and description if they exist
      const mergedConfig = {
        ...agentConfig,
        ...template.config,
        name: agentConfig.name || template.name,
        description: agentConfig.description || template.description,
        template: template.id,
        // Ensure customization options are properly merged
        customization: {
          ...agentConfig.customization,
          ...template.config.customization,
        },
      }

      // Update the agent config with the template values
      setAgentConfig(mergedConfig)

      // Generate code from the template
      setTimeout(() => {
        const code = customizeTemplateCode(template, mergedConfig)
        setGeneratedCode(code)
        setIsGenerating(false)
        setActiveTab("output")
      }, 1000)
    }
  }

  const handleGenerate = async () => {
    setIsGenerating(true)

    // Check if API keys are available
    const storedKeys = localStorage.getItem("agent-generator-api-keys")
    const apiKeys = storedKeys ? JSON.parse(storedKeys) : {}

    const requiredKey = agentConfig.model === "gemini" ? "gemini" : "mistral"

    if (!apiKeys[requiredKey]) {
      alert(`API key for ${agentConfig.model} is missing. Please add it in Settings.`)
      window.dispatchEvent(new CustomEvent("toggle-settings"))
      setIsGenerating(false)
      return
    }

    // If using a template, use its code as a base
    if (agentConfig.template) {
      const template = templates.find((t) => t.id === agentConfig.template)
      if (template) {
        const code = customizeTemplateCode(template, agentConfig)
        setGeneratedCode(code)
        setIsGenerating(false)
        setActiveTab("output")
        return
      }
    }

    // Generate code from scratch if no template or template not found
    setTimeout(() => {
      const code = generateAgentCode(agentConfig)
      setGeneratedCode(code)
      setIsGenerating(false)
      setActiveTab("output")
    }, 2000)
  }

  const customizeTemplateCode = (template: any, config: AgentConfig): string => {
    // Start with the template code
    let code = template.code

    // Replace template values with user values
    code = code.replace(/RAG Manager|Chat Manager|Tool Manager/g, config.name + " Manager")

    // Update model references based on selected model
    if (config.model === "gemini") {
      code = code.replace(/new Mistral$${ model: ".*?" }$$/g, 'new GoogleGenerativeAI({ model: "gemini-pro" })')
      code = code.replace(/Mistral,/g, "GoogleGenerativeAI,")
    } else {
      code = code.replace(/new GoogleGenerativeAI$${ model: ".*?" }$$/g, 'new Mistral({ model: "mistral-large" })')
      code = code.replace(/GoogleGenerativeAI,/g, "Mistral,")
    }

    // Update worker count
    const workerCountRegex = /for $$let i = 0; i < \d+; i\+\+$$/g
    code = code.replace(workerCountRegex, `for (let i = 0; i < ${config.workerCount}; i++)`)

    // Update temperature and max tokens
    code = code.replace(/temperature: [0-9.]+/g, `temperature: ${config.customization.temperature}`)
    code = code.replace(/maxTokens: \d+/g, `maxTokens: ${config.customization.maxTokens}`)

    // Update description
    if (config.description) {
      code = code.replace(/description: ".*?"/g, `description: "${config.description}"`)
    }

    return code
  }

  const generateAgentCode = (config: AgentConfig): string => {
    // This is a more sophisticated template that incorporates the customization options
    let code = `import { 
  SimpleDirectoryReader, 
  VectorStoreIndex, 
  serviceContextFromDefaults,
  ${config.model === "gemini" ? "GoogleGenerativeAI" : "Mistral"},
  ContextChatEngine,
  AgentRunner,
  Task,
  TaskStep,
  TaskStatus,
  ToolOutput,
  FunctionTool${config.customization?.useMemory ? ",\n  ChatMessage,\n  ChatHistory" : ""}
} from "llamaindex";

/**
 * ${config.name}
 * ${config.description}
 * 
 * Created with Agent Generator
 * Model: ${config.model}
 * Workers: ${config.workerCount}
 */
const create${config.name.replace(/\s+/g, "")} = async () => {
  // Initialize the ${config.model} model
  const model = new ${config.model === "gemini" ? "GoogleGenerativeAI" : "Mistral"}({ 
    model: "${config.model === "gemini" ? "gemini-pro" : "mistral-large"}",
    temperature: ${config.customization?.temperature || 0.7},
    maxTokens: ${config.customization?.maxTokens || 1000}
  });
  
  // Create service context
  const serviceContext = serviceContextFromDefaults({
    llm: model,
  });
`

    // Add tools if enabled
    if (config.customization?.useTools) {
      code += `
  // Define tools
  const tools = [
    new FunctionTool({
      name: "search_information",
      description: "Search for information on a given topic",
      func: async (query: string) => {
        // Implement actual search functionality here
        return \`Results for: \${query}\`;
      },
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The search query",
          },
        },
        required: ["query"],
      },
    }),
    // Add more tools as needed
  ];
`
    }

    // Add memory if enabled
    if (config.customization?.useMemory) {
      code += `
  // Initialize chat history for memory
  const chatHistory = new ChatHistory();
`
    }

    // Add retrieval if enabled
    if (config.customization?.useRetrieval) {
      code += `
  // Initialize vector store for retrieval
  // Note: In a real implementation, you would load actual documents
  const documents = [
    // Add your documents here
  ];
  
  // Create vector store index
  const index = await VectorStoreIndex.fromDocuments(documents, { serviceContext });
  
  // Create retriever
  const retriever = index.asRetriever();
`
    }

    // Manager agent configuration
    code += `
  // Manager agent configuration
  const managerAgent = new AgentRunner({
    name: "${config.name} Manager",
    description: "${config.description}",
    llm: model,${config.customization?.useTools ? "\n    tools," : ""}
  });

  // Worker agents
  const workerAgents = [];
  for (let i = 0; i < ${config.workerCount}; i++) {
    workerAgents.push(
      new AgentRunner({
        name: \`Worker Agent \${i+1}\`,
        description: "Worker agent that completes assigned subtasks",
        llm: model,${config.customization?.useTools ? "\n        tools," : ""}
      })
    );
  }

  // Define tasks
  const predefinedTasks = [
    ${config.tasks
      .map(
        (task) => `new Task({
      description: "${task}",
      expectedOutputs: ["Completed ${task}"],
    })`,
      )
      .join(",\n    ")}
  ];
`

    // Execute task function
    code += `
  // Execute tasks with manager-worker topology
  const executeTask = async (task) => {
    ${config.customization?.useMemory ? '// Add task to memory\n    chatHistory.addMessage(\n      new ChatMessage({\n        role: "user",\n        content: task.description,\n      })\n    );\n\n    ' : ""}// Manager creates subtasks
    const subtasks = await managerAgent.createSubtasks(task);
    
    // Distribute subtasks to workers
    const results = await Promise.all(
      subtasks.map((subtask, index) => {
        const workerIndex = index % workerAgents.length;
        return workerAgents[workerIndex].executeTask(subtask);
      })
    );
    
    // Manager compiles results
    const finalResult = await managerAgent.compileResults(results);
    
    ${config.customization?.useMemory ? '// Add result to memory\n    chatHistory.addMessage(\n      new ChatMessage({\n        role: "assistant",\n        content: finalResult.toString(),\n      })\n    );\n\n    ' : ""}return finalResult;
  };

  return {
    executeTask,
    managerAgent,
    workerAgents,${config.customization?.useMemory ? "\n    chatHistory," : ""}${config.customization?.useRetrieval ? "\n    index,\n    retriever," : ""}
    predefinedTasks
  };
};

export default create${config.name.replace(/\s+/g, "")};
`

    return code
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Create Your AI Agent</h2>
        <p className="text-muted-foreground">
          Build AI agents using LlamaIndex TypeScript with a manager-worker topology.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="configure">Configure</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="test" disabled={!generatedCode}>
            Test
          </TabsTrigger>
          <TabsTrigger value="output" disabled={!generatedCode}>
            Output
          </TabsTrigger>
        </TabsList>

        <TabsContent value="configure" className="space-y-4">
          <AgentForm
            agentConfig={agentConfig}
            setAgentConfig={setAgentConfig}
            onGenerate={handleGenerate}
            setAgentConfig={setAgentConfig}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            onTemplateSelect={handleTemplateSelect}
          />
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <AgentPreview agentConfig={agentConfig} />
        </TabsContent>

        <TabsContent value="test" className="space-y-4">
          <AgentTester agentConfig={agentConfig} generatedCode={generatedCode} />
        </TabsContent>

        <TabsContent value="output" className="space-y-4">
          <AgentOutput generatedCode={generatedCode} />
        </TabsContent>
      </Tabs>

      <SettingsDialog />
    </div>
  )
}

