<div align="right">
<sub>Public | Free OpenSource</sub>
</div>

# Bluelotus Llamaindex Agent Generator (LamaGen)

## Presentation

Welcome to the Bluelotus Llamaindex Agent Generator! This application is designed to help you create and manage agents for the Llamaindex platform. With our user-friendly interface, you can easily generate, test, and deploy agents tailored to your specific needs.

### Features

- **Agent Generation**: Create new agents with custom configurations.
- **Agent Testing**: Test your agents in a simulated environment before deployment.
- **Agent Deployment**: Deploy your agents to the Llamaindex platform with ease.
- **Template Gallery**: Browse and use pre-built agent templates to get started quickly.
- **Settings Dialog**: Customize your agent settings to fit your requirements.

### Getting Started

1. **Installation**: Follow the installation instructions below to set up the application.
2. **Agent Creation**: Use the agent form to create a new agent.
3. **Testing**: Test your agent using the agent tester.
4. **Deployment**: Deploy your agent to the Llamaindex platform.

## Technical

### Tech Stack

- **Framework**: Next.js
- **UI Library**: React
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Form Handling**: react-hook-form
- **Date Manipulation**: date-fns
- **Charting**: recharts

### Project Structure

- **app/**: Contains the main application components.
  - `globals.css`: Global CSS styles.
  - `layout.tsx`: Main layout component.
  - `page.tsx`: Main page component.
- **components/**: Reusable UI components.
  - `agent-form.tsx`: Agent creation form.
  - `agent-generator.tsx`: Agent generation component.
  - `agent-output.tsx`: Agent output display.
  - `agent-preview.tsx`: Agent preview component.
  - `agent-tester.tsx`: Agent testing component.
  - `footer.tsx`: Footer component.
  - `header.tsx`: Header component.
  - `settings-dialog.tsx`: Settings dialog component.
  - `template-gallery.tsx`: Template gallery component.
  - `theme-provider.tsx`: Theme provider component.
  - `ui/**`: Various UI components from Radix UI.
- **data/**: Data files and templates.
  - `templates.ts`: Agent templates.
- **hooks/**: Custom React hooks.
  - `use-mobile.tsx`: Hook for mobile detection.
  - `use-toast.ts`: Hook for toast notifications.
- **lib/**: Utility functions.
  - `utils.ts`: Utility functions.
- **public/**: Public assets.
  - `placeholder-logo.png`: Placeholder logo image.
  - `placeholder-logo.svg`: Placeholder logo SVG.
  - `placeholder-user.jpg`: Placeholder user image.
  - `placeholder.jpg`: Placeholder image.
  - `placeholder.svg`: Placeholder SVG.
- **styles/**: Additional styles.
  - `globals.css`: Global CSS styles.
- **types/**: TypeScript type definitions.
  - `agent.ts`: Agent type definitions.

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/blue-lotus-org/LamaGen.git
   ```
2. Navigate to the project directory:
   ```sh
   cd LamaGen
   ```
3. Install the dependencies:
   ```sh
   npm install
   ```
   or
   ```sh
   pnpm install
   ```
4. Start the development server:
   ```sh
   npm run dev
   ```
   or
   ```sh
   pnpm dev
   ```

### Contributing

We welcome contributions from the community! If you'd like to contribute, please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and commit them with descriptive messages.
4. Push your branch to your fork.
5. Create a pull request to the main repository.

### License

This project is licensed under the MIT License.

### Credits
- UI by `v0.dev`
- App about `llamaindex` agentic platform
- Creator `blue lotus` aka `lotus chain`

---

## Topology
```
█████████████████████
█  User Request     █
█████████████████████
          █
          ▼
██████████████████████
█   Manager Agent    █
█(Subtask Generation)█
██████████████████████
          █
          ▼
████████████████████████████████████████
█ Distribute Subtasks to Worker Agents █
████████████████████████████████████████
          █
  ███████████████████   ██████████████████████
  █Worker Agent 1   █   █   Worker Agent N   █
  █(Process Subtask)█   █   (Process Subtask)█
  ███████████████████   ██████████████████████
          █                   █
          ▼                   ▼
  ███████████████   ███████████████
  █   Answer 1  █   █ Answer N    █
  ███████████████   ███████████████
          █
███████████████████████████████████████
█ Collect Answers from Worker Agents  █
███████████████████████████████████████
          █
          ▼
█████████████████████
█   Compile Answers █
█████████████████████
          █
          ▼
█████████████████████████████
█     TS Standard Agent     █
█       (Output Result)     █
█████████████████████████████
```
