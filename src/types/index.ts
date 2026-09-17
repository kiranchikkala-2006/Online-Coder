export type SupportedLanguageId =
  | 'python'
  | 'c'
  | 'cpp'
  | 'java'
  | 'javascript'
  | 'typescript'
  | 'go'
  | 'rust'
  | 'kotlin'
  | 'php';

export type ExecutionStatus =
  | 'success'
  | 'compilation_error'
  | 'runtime_error'
  | 'time_limit_exceeded'
  | 'memory_limit_exceeded'
  | 'system_error'
  | 'running'
  | 'idle';

export interface LanguageConfig {
  id: SupportedLanguageId;
  name: string;
  category: 'Interpreted' | 'Compiled' | 'Systems' | 'Web & Scripting' | 'Enterprise';
  icon: string;
  extension: string;
  filename: string;
  monacoLang: string;
  version: string;
  dockerImage: string;
  compileCmd: string | null;
  runCmd: string;
  defaultCode: string;
  description: string;
  popular?: boolean;
}

export interface RunCodeRequest {
  language: SupportedLanguageId;
  code: string;
  input?: string;
  jobId?: string;
  files?: Array<{ name: string; content: string }>;
}

export interface EditorTab {
  id: string;
  name: string;
  code: string;
  language: SupportedLanguageId;
  isAd?: boolean;
  adData?: {
    sponsor: string;
    title: string;
    tagline: string;
    ctaText: string;
    badge: string;
  };
}

export interface RunCodeResponse {
  status: ExecutionStatus;
  output: string;
  error: string;
  executionTime: number; // in seconds
  memoryUsageMB: number; // in MB
  sandbox: 'docker' | 'isolated_process' | 'local_runner';
  exitCode?: number;
  dockerAvailable?: boolean;
}

export interface EditorSettings {
  fontSize: number;
  tabSize: number;
  minimap: boolean;
  wordWrap: 'on' | 'off';
  lineNumbers: 'on' | 'off';
  autoClosingBrackets: 'always' | 'never';
}
