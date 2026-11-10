export type Json =
  string | number | boolean | null | Json[] | { [key: string]: Json };
export type DataRecord = { [key: string]: Json };

export type AppId =
  | "forms"
  | "email"
  | "sms"
  | "crm"
  | "invoices"
  | "calendar"
  | "chat"
  | "sheet"
  | "tasks"
  | "webhook"
  | "schedule"
  | "monitor";

export type FieldType =
  | "text"
  | "longtext"
  | "number"
  | "email"
  | "phone"
  | "date"
  | "select"
  | "url";

export type InputField = {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
  placeholder?: string;
};

export type OutputField = {
  path: string;
  label: string;
  type: "text" | "number" | "date" | "boolean" | "list";
  sample: Json;
};

export type TriggerEvent = {
  id: string;
  label: string;
  description: string;
  config: InputField[];
  outputs: OutputField[];
};

export type Operation = {
  id: string;
  label: string;
  kind: "read" | "write";
  fields: InputField[];
  outputs: OutputField[];
};

export type AppDefinition = {
  id: AppId;
  name: string;
  category:
    | "Communication"
    | "Sales"
    | "Finance"
    | "Scheduling"
    | "Team"
    | "Data"
    | "Developer"
    | "Built-in";
  description: string;
  icon: string;
  ratePerMinute: number;
  events: TriggerEvent[];
  operations: Operation[];
};

export type Trigger = {
  app: AppId;
  event: string;
  config: Record<string, string>;
};

export type RetryPolicy = { attempts: number; backoffMs: number };
export type ErrorPolicy = "stop" | "continue" | "fallback";

export type Operator =
  | "equals"
  | "not_equals"
  | "contains"
  | "gt"
  | "lt"
  | "between"
  | "is_empty"
  | "is_not_empty"
  | "days_since_gt"
  | "days_since_lt";

export type Condition = {
  id: string;
  left: string;
  operator: Operator;
  right: string;
  right2?: string;
};

type StepBase = { id: string; name?: string };

export type ActionStep = StepBase & {
  type: "action";
  app: AppId;
  operation: string;
  fields: Record<string, string>;
  onError?: ErrorPolicy;
  retry?: RetryPolicy;
  fallback?: Step[];
};

export type IfStep = StepBase & {
  type: "if";
  match: "all" | "any";
  conditions: Condition[];
  then: Step[];
  else: Step[];
};

export type SwitchCase = {
  id: string;
  label: string;
  equals: string;
  steps: Step[];
};

export type SwitchStep = StepBase & {
  type: "switch";
  value: string;
  cases: SwitchCase[];
  otherwise: Step[];
};

export type FilterStep = StepBase & {
  type: "filter";
  match: "all" | "any";
  conditions: Condition[];
};

export type DelayStep = StepBase & {
  type: "delay";
  mode: "for" | "until";
  amount: number;
  unit: "minutes" | "hours" | "days";
  until: string;
};

export type Assignment = { id: string; key: string; value: string };

export type TransformStep = StepBase & {
  type: "transform";
  assignments: Assignment[];
};

export type LoopStep = StepBase & {
  type: "loop";
  list: string;
  steps: Step[];
};

export type Step =
  | ActionStep
  | IfStep
  | SwitchStep
  | FilterStep
  | DelayStep
  | TransformStep
  | LoopStep;
export type StepType = Step["type"];

export type WorkflowSettings = {
  manualMinutes: number;
  onError: "stop" | "continue";
  retry: RetryPolicy;
};

export type Workflow = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  trigger: Trigger;
  steps: Step[];
  settings: WorkflowSettings;
  playbook?: string;
  createdAt: string;
  updatedAt: string;
};

export type TraceStatus = "ok" | "failed" | "skipped" | "stopped";

export type TraceEntry = {
  stepId: string;
  path: string;
  startedAt: number;
  finishedAt: number;
  status: TraceStatus;
  input: DataRecord;
  output: DataRecord | null;
  branch?: string;
  attempts: number;
  throttledMs: number;
  waitedMs: number;
  error?: string;
};

export type RunStatus = "success" | "failed" | "filtered";

export type Run = {
  id: string;
  workflowId: string;
  status: RunStatus;
  startedAt: number;
  finishedAt: number;
  payload: DataRecord;
  trace: TraceEntry[];
  recovered: number;
  error?: string;
};
