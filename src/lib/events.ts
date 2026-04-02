type Listener = (data: AgentEvent) => void;

export interface AgentEvent {
  runId: string;
  agentType: string;
  taskType: string;
  status: "started" | "progress" | "completed" | "error";
  message: string;
  timestamp: number;
}

class AgentEventEmitter {
  private listeners: Set<Listener> = new Set();

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  emit(event: AgentEvent): void {
    for (const listener of this.listeners) {
      listener(event);
    }
  }
}

export const agentEvents = new AgentEventEmitter();
