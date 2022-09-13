const extract = function (log, n) {
  let lb = Number(log.stack.peek(0));
  let ub = Number(log.stack.peek(1)) + lb;
  let topics = [];
  for (let i = 0; i < n; i++) {
    topics.push(log.stack.peek(2 + i).toString(16));
  }
  return {
    topics: topics,
    data: toHex(log.memory.slice(lb, ub)),
    contract: toHex(log.contract.getAddress()),
  };
};

const step = function (log, db) {
  let code = log.op.toString();
  if (code === "LOG0") {
    this.events.push(this.extract(log, 0));
  }
  if (code === "LOG1") {
    this.events.push(this.extract(log, 1));
  }
  if (code === "LOG2") {
    this.events.push(this.extract(log, 2));
  }
  if (code === "LOG3") {
    this.events.push(this.extract(log, 3));
  }
  if (code === "LOG4") {
    this.events.push(this.extract(log, 4));
  }
};

const fault = function (log, db) {
  // empty
};

const result = function (ctx, db) {
  return this.events;
};

export function getTracerFunc() {
  return `{
    events: [],
    extract: ${extract.toString()},
    step: ${step.toString()},
    fault: ${fault.toString()},
    result: ${result.toString()}
  }`;
}
