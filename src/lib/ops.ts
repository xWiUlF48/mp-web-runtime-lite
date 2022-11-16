export type Op = [number, ...string[]] | [number, ...Op[]] | Op[];

export function printOp(op: Op): string {
  if (Array.isArray(op[0])) {
    return `{{${printInteropOp(op as Op[])}}}`;
  }
  switch (op[0]) {
    case 1:
    case 3:
      return String(op[1]);
    case 11:
      return op
        .slice(1)
        .map((op) => printOp(op as Op))
        .join('');
    default:
      unexpected(op);
  }
}

function printInteropOp(op: Op[]): string {
  switch (op[0][0]) {
    case 2: {
      const first = printInteropValue(op[1]);
      if (op.length === 2) {
        return `${op[0][1]}${first}`;
      }
      const second = printInteropValue(op[2]);
      if (op.length === 3) {
        return `${first} ${op[0][1]} ${second}`;
      }
      if (op[0][1] === '?:') {
        return `(${first} ? ${second} : ${printInteropValue(op[3])})`;
      }
      return unexpected(op);
    }
    case 5: {
      const content = op
        .slice(1)
        .map((op: Op) => {
          const child = printInteropValue(op);
          if (child === '[]') {
            return null;
          }
          if (child.startsWith('[') && child.endsWith(']')) {
            return child.slice(1, -1);
          }
          return child;
        })
        .filter(Boolean)
        .join(', ');
      return `[${content}]`;
    }
    case 6: {
      const obj = printInteropValue(op[1]);
      const prop = printInteropValue(op[2]);
      if (/^[a-z_]\w*$/i.test(String(prop))) {
        return `${obj}.${prop}`;
      }
      return `${obj}['${prop}']`;
    }
    case 7: {
      return printInteropValue(op[1]);
    }
    case 8: {
      return `${op[1]}: ${printInteropValue(op[2])}`;
    }
    case 9: {
      return `{ ${op.slice(1).map(printInteropValue).join(', ')} }`;
    }
    case 12: {
      let args = printInteropValue(op[2]);
      if (args.startsWith('[') && args.endsWith(']')) {
        args = args.slice(1, -1);
      } else {
        args = `...${args}`;
      }
      return `${printInteropValue(op[1])}(${args})`;
    }
    default:
      unexpected(op);
  }
}

function printInteropValue(op: Op): string {
  if (Array.isArray(op[0])) {
    return printInteropOp(op as Op[]);
  }
  switch (op[0]) {
    case 1:
      if (typeof op[1] === 'string') {
        return `'${op[1]}'`;
      }
      return JSON.stringify(op[1]);
    case 3:
      return String(op[1]);
    case 11:
      return op
        .slice(1)
        .map((op) => printInteropValue(op as Op))
        .join(' + ');
    default:
      unexpected(op);
  }
}

function unexpected(ops: Op): never {
  throw new Error(`Unknown op type ${JSON.stringify(ops)}`);
}
