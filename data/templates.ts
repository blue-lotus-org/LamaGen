import type { AgentTemplate } from "@/types/agent"

export const templates: AgentTemplate[] = [
  {
    id: "rag-agent",
    name: "RAG Agent",
    description: "Retrieval-Augmented Generation agent that can search and use documents",
    config: {
      model: "gemini",
      workerCount: 2,
      customization: {
        temperature: 0.7,
        maxTokens: 1000,
        useTools: true,
        useMemory: false,
        useRetrieval: true,
      },
    },
    code: `import { 
  SimpleDirectoryReader, 
  VectorStoreIndex, 
  serviceContextFromDefaults,
  GoogleGenerativeAI,
  ContextChatEngine,
  AgentRunner,
  Task,
  TaskStep,
  TaskStatus,
  ToolOutput,
  FunctionTool,
  Document
} from "llamaindex";

// RAG Agent with document retrieval capabilities
const createRAGAgent = async (documents: Document[]) => {
  // Initialize the Gemini model
  const model = new GoogleGenerativeAI({ model: "gemini-pro" });
  
  // Create service context
  const serviceContext = serviceContextFromDefaults({
    llm: model,
  });

  // Create vector store index from documents
  const index = await VectorStoreIndex.fromDocuments(documents, { serviceContext });
  
  // Create retriever
  const retriever = index.asRetriever();
  
  // Create query engine
  const queryEngine = index.asQueryEngine();
  
  // Create search tool
  const searchTool = new FunctionTool({
    name: "search_documents",
    description: "Search for information in the documents",
    func: async (query: string) => {
      const response = await queryEngine.query(query);
      return response.toString();
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
  });

  // Manager agent configuration
  const managerAgent = new AgentRunner({
    name: "RAG Manager",
    description: "Manager agent that coordinates document retrieval and analysis",
    llm: model,
    tools: [searchTool],
  });

  // Worker agents
  const workerAgents = [];
  for (let i = 0; i < 2; i++) {
    workerAgents.push(
      new AgentRunner({
        name: \`Worker Agent \${i+1}\`,
        description: "Worker agent that processes document information",
        llm: model,
        tools: [searchTool],
      })
    );
  }

  // Execute tasks with manager-worker topology
  const executeTask = async (task: Task) => {
    // Manager creates subtasks
    const subtasks = await managerAgent.createSubtasks(task);
    
    // Distribute subtasks to workers
    const results = await Promise.all(
      subtasks.map((subtask, index) => {
        const workerIndex = index % workerAgents.length;
        return workerAgents[workerIndex].executeTask(subtask);
      })
    );
    
    // Manager compiles results
    return await managerAgent.compileResults(results);
  };

  return {
    executeTask,
    managerAgent,
    workerAgents,
    index,
  };
};

export default createRAGAgent;`,
  },
  {
    id: "chat-agent",
    name: "Chat Agent",
    description: "Conversational agent with memory for ongoing discussions",
    config: {
      model: "mistral",
      workerCount: 1,
      customization: {
        temperature: 0.8,
        maxTokens: 2000,
        useTools: false,
        useMemory: true,
        useRetrieval: false,
      },
    },
    code: `import { 
  serviceContextFromDefaults,
  Mistral,
  ChatMessage,
  AgentRunner,
  Task,
  SimpleChatEngine,
  ChatHistory,
  ChatStore
} from "llamaindex";

// Chat Agent with memory
const createChatAgent = async () => {
  // Initialize the Mistral model
  const model = new Mistral({ model: "mistral-large" });
  
  // Create service context
  const serviceContext = serviceContextFromDefaults({
    llm: model,
  });

  // Create chat history store
  const chatStore = new ChatStore();
  
  // Create chat history
  const chatHistory = new ChatHistory();

  // Create chat engine
  const chatEngine = new SimpleChatEngine({
    llm: model,
    chatHistory,
  });

  // Manager agent configuration
  const managerAgent = new AgentRunner({
    name: "Chat Manager",
    description: "Manager agent that handles conversation flow",
    llm: model,
  });

  // Worker agent
  const workerAgent = new AgentRunner({
    name: "Chat Worker",
    description: "Worker agent that processes and responds to messages",
    llm: model,
  });

  // Execute chat with memory
  const chat = async (message: string) => {
    // Add user message to history
    chatHistory.addMessage(
      new ChatMessage({
        role: "user",
        content: message,
      })
    );
    
    // Create task from message
    const task = new Task({
      description: \`Respond to: \${message}\`,
      expectedOutputs: ["Conversational response"],
    });
    
    // Manager processes the task
    const subtasks = await managerAgent.createSubtasks(task);
    
    // Worker handles the response
    const result = await workerAgent.executeTask(subtasks[0]);
    
    // Manager compiles the result
    const finalResponse = await managerAgent.compileResults([result]);
    
    // Add assistant response to history
    chatHistory.addMessage(
      new ChatMessage({
        role: "assistant",
        content: finalResponse.toString(),
      })
    );
    
    return finalResponse.toString();
  };

  // Get chat history
  const getHistory = () => {
    return chatHistory.messages;
  };

  return {
    chat,
    getHistory,
    managerAgent,
    workerAgent,
  };
};

export default createChatAgent;`,
  },
  {
    id: "tool-agent",
    name: "Tool-using Agent",
    description: "Agent that can use external tools and APIs to accomplish tasks",
    config: {
      model: "gemini",
      workerCount: 3,
      customization: {
        temperature: 0.5,
        maxTokens: 1500,
        useTools: true,
        useMemory: false,
        useRetrieval: false,
      },
    },
    code: `import { 
  serviceContextFromDefaults,
  GoogleGenerativeAI,
  AgentRunner,
  Task,
  TaskStep,
  TaskStatus,
  ToolOutput,
  FunctionTool
} from "llamaindex";

// Tool-using Agent
const createToolAgent = async () => {
  // Initialize the Gemini model
  const model = new GoogleGenerativeAI({ model: "gemini-pro" });
  
  // Create service context
  const serviceContext = serviceContextFromDefaults({
    llm: model,
  });

  // Create weather tool
  const weatherTool = new FunctionTool({
    name: "get_weather",
    description: "Get the current weather for a location",
    func: async (location: string) => {
      // In a real implementation, this would call a weather API
      return \`Weather for \${location}: 72°F and sunny\`;
    },
    parameters: {
      type: "object",
      properties: {
        location: {
          type: "string",
          description: "The city and state, e.g. San Francisco, CA",
        },
      },
      required: ["location"],
    },
  });

  // Create calculator tool
  const calculatorTool = new FunctionTool({
    name: "calculator",
    description: "Perform a calculation",
    func: async (expression: string) => {
      try {
        // Note: In production, you'd want to use a safer evaluation method
        return \`Result: \${eval(expression)}\`;
      } catch (error) {
        return \`Error calculating: \${error.message}\`;
      }
    },
    parameters: {
      type: "object",
      properties: {
        expression: {
          type: "string",
          description: "The mathematical expression to evaluate",
        },
      },
      required: ["expression"],
    },
  });

  // Create search tool
  const searchTool = new FunctionTool({
    name: "search",
    description: "Search for information",
    func: async (query: string) => {
      // In a real implementation, this would call a search API
      return \`Search results for "\${query}": Found 10 relevant results.\`;
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
  });

  // Manager agent configuration
  const managerAgent = new AgentRunner({
    name: "Tool Manager",
    description: "Manager agent that coordinates tool usage",
    llm: model,
    tools: [weatherTool, calculatorTool, searchTool],
  });

  // Worker agents
  const workerAgents = [];
  for (let i = 0; i < 3; i++) {
    workerAgents.push(
      new AgentRunner({
        name: \`Worker Agent \${i+1}\`,
        description: "Worker agent that uses tools to complete tasks",
        llm: model,
        tools: [weatherTool, calculatorTool, searchTool],
      })
    );
  }

  // Execute tasks with manager-worker topology
  const executeTask = async (task: Task) => {
    // Manager creates subtasks
    const subtasks = await managerAgent.createSubtasks(task);
    
    // Distribute subtasks to workers
    const results = await Promise.all(
      subtasks.map((subtask, index) => {
        const workerIndex = index % workerAgents.length;
        return workerAgents[workerIndex].executeTask(subtask);
      })
    );
    
    // Manager compiles results
    return await managerAgent.compileResults(results);
  };

  return {
    executeTask,
    managerAgent,
    workerAgents,
  };
};

export default createToolAgent;`,
  },
  {
    id: "multi-modal-agent",
    name: "Multi-Modal Agent",
    description: "Agent that can process both text and image inputs",
    config: {
      model: "gemini",
      workerCount: 2,
      customization: {
        temperature: 0.6,
        maxTokens: 2000,
        useTools: true,
        useMemory: false,
        useRetrieval: true,
      },
    },
    code: `import { 
  serviceContextFromDefaults,
  GoogleGenerativeAI,
  AgentRunner,
  Task,
  FunctionTool,
  Document,
  MultiModalData
} from "llamaindex";

// Multi-Modal Agent that can process text and images
const createMultiModalAgent = async () => {
  // Initialize the Gemini model (supports multi-modal inputs)
  const model = new GoogleGenerativeAI({ 
    model: "gemini-pro-vision",
    temperature: 0.6,
    maxTokens: 2000
  });
  
  // Create service context
  const serviceContext = serviceContextFromDefaults({
    llm: model,
  });

  // Create image analysis tool
  const imageAnalysisTool = new FunctionTool({
    name: "analyze_image",
    description: "Analyze the content of an image",
    func: async (imageUrl: string) => {
      // In a real implementation, this would process the image
      // using the multi-modal capabilities of the model
      return \`Image analysis complete for \${imageUrl}\`;
    },
    parameters: {
      type: "object",
      properties: {
        imageUrl: {
          type: "string",
          description: "URL of the image to analyze",
        },
      },
      required: ["imageUrl"],
    },
  });

  // Create OCR tool
  const ocrTool = new FunctionTool({
    name: "extract_text",
    description: "Extract text from an image",
    func: async (imageUrl: string) => {
      // In a real implementation, this would extract text from the image
      return \`Text extracted from \${imageUrl}: Sample extracted text\`;
    },
    parameters: {
      type: "object",
      properties: {
        imageUrl: {
          type: "string",
          description: "URL of the image to extract text from",
        },
      },
      required: ["imageUrl"],
    },
  });

  // Manager agent configuration
  const managerAgent = new AgentRunner({
    name: "Multi-Modal Manager",
    description: "Manager agent that coordinates multi-modal processing",
    llm: model,
    tools: [imageAnalysisTool, ocrTool],
  });

  // Worker agents
  const workerAgents = [];
  for (let i = 0; i < 2; i++) {
    workerAgents.push(
      new AgentRunner({
        name: \`Worker Agent \${i+1}\`,
        description: "Worker agent that processes multi-modal inputs",
        llm: model,
        tools: [imageAnalysisTool, ocrTool],
      })
    );
  }

  // Process multi-modal input
  const processInput = async (text: string, imageUrls: string[] = []) => {
    // Create multi-modal data
    const multiModalData = new MultiModalData({
      text: text,
      imageUrls: imageUrls,
    });
    
    // Create task with multi-modal data
    const task = new Task({
      description: text,
      multiModalData: multiModalData,
      expectedOutputs: ["Multi-modal analysis"],
    });
    
    // Manager creates subtasks
    const subtasks = await managerAgent.createSubtasks(task);
    
    // Distribute subtasks to workers
    const results = await Promise.all(
      subtasks.map((subtask, index) => {
        const workerIndex = index % workerAgents.length;
        return workerAgents[workerIndex].executeTask(subtask);
      })
    );
    
    // Manager compiles results
    return await managerAgent.compileResults(results);
  };

  return {
    processInput,
    managerAgent,
    workerAgents,
  };
};

export default createMultiModalAgent;`,
  },
  {
    id: "reasoning-agent",
    name: "Reasoning Agent",
    description: "Agent with advanced reasoning capabilities for complex problem-solving",
    config: {
      model: "mistral",
      workerCount: 4,
      customization: {
        temperature: 0.3,
        maxTokens: 3000,
        useTools: true,
        useMemory: true,
        useRetrieval: true,
      },
    },
    code: `import { 
  serviceContextFromDefaults,
  Mistral,
  AgentRunner,
  Task,
  FunctionTool,
  ChatMessage,
  ChatHistory,
  ReActAgent,
  Document,
  VectorStoreIndex
} from "llamaindex";

// Reasoning Agent with advanced problem-solving capabilities
const createReasoningAgent = async (documents: Document[] = []) => {
  // Initialize the Mistral model
  const model = new Mistral({ 
    model: "mistral-large",
    temperature: 0.3,
    maxTokens: 3000
  });
  
  // Create service context
  const serviceContext = serviceContextFromDefaults({
    llm: model,
  });

  // Initialize chat history for memory
  const chatHistory = new ChatHistory();

  // Create vector store index if documents are provided
  let index;
  let retriever;
  if (documents.length > 0) {
    index = await VectorStoreIndex.fromDocuments(documents, { serviceContext });
    retriever = index.asRetriever();
  }

  // Create calculator tool
  const calculatorTool = new FunctionTool({
    name: "calculator",
    description: "Perform a calculation",
    func: async (expression: string) => {
      try {
        return \`Result: \${eval(expression)}\`;
      } catch (error) {
        return \`Error calculating: \${error.message}\`;
      }
    },
    parameters: {
      type: "object",
      properties: {
        expression: {
          type: "string",
          description: "The mathematical expression to evaluate",
        },
      },
      required: ["expression"],
    },
  });

  // Create reasoning tool
  const reasoningTool = new FunctionTool({
    name: "step_by_step_reasoning",
    description: "Break down a complex problem into steps",
    func: async (problem: string) => {
      // In a real implementation, this would use the model to break down the problem
      return \`Problem: \${problem}\\n1. Understand the problem\\n2. Identify key variables\\n3. Apply relevant formulas\\n4. Calculate the solution\\n5. Verify the answer\`;
    },
    parameters: {
      type: "object",
      properties: {
        problem: {
          type: "string",
          description: "The problem to solve",
        },
      },
      required: ["problem"],
    },
  });

  // Create tools array
  const tools = [calculatorTool, reasoningTool];
  
  // Add retrieval tool if documents are provided
  if (retriever) {
    const retrievalTool = new FunctionTool({
      name: "search_knowledge",
      description: "Search for information in the knowledge base",
      func: async (query: string) => {
        const nodes = await retriever.retrieve(query);
        return nodes.map(node => node.text).join("\\n\\n");
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
    });
    tools.push(retrievalTool);
  }

  // Create ReAct agent for manager (for better reasoning)
  const managerAgent = new ReActAgent({
    name: "Reasoning Manager",
    description: "Manager agent that coordinates complex problem-solving",
    llm: model,
    tools,
    chatHistory,
  });

  // Worker agents
  const workerAgents = [];
  for (let i = 0; i < 4; i++) {
    workerAgents.push(
      new AgentRunner({
        name: \`Worker Agent \${i+1}\`,
        description: "Worker agent that handles specific reasoning tasks",
        llm: model,
        tools,
      })
    );
  }

  // Solve a problem
  const solveProblem = async (problem: string) => {
    // Add problem to memory
    chatHistory.addMessage(
      new ChatMessage({
        role: "user",
        content: problem,
      })
    );
    
    // Create task
    const task = new Task({
      description: \`Solve this problem: \${problem}\`,
      expectedOutputs: ["Solution with reasoning"],
    });
    
    // Manager creates subtasks with reasoning
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
    
    // Add solution to memory
    chatHistory.addMessage(
      new ChatMessage({
        role: "assistant",
        content: finalResult.toString(),
      })
    );
    
    return finalResult.toString();
  };

  return {
    solveProblem,
    managerAgent,
    workerAgents,
    chatHistory,
    index,
    retriever,
  };
};

export default createReasoningAgent;`,
  },
]

