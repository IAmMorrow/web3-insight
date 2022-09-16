export type TracerEvent = {
  topics: string[],
  data: string,
  contract: string,
  caller: string,
  type: string,
}

export type TracerCall = {
  type: string,
  from: string,
  to: string,
  value: string,
  data: string,
}

export type DryRunResult = {
  gas_used: number,
  events: TracerEvent[],
  calls: TracerCall[],
  success: boolean,
  error?: string,
}

export type DebugTraceCallResult = {
  contract: string;
  topics: string[];
  data: string;
};
