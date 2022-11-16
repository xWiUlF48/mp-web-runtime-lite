import * as t from '@babel/types';
import { printOp } from './ops';
import { win } from './window';

export interface OpsBinding {
  value: any[];
}

export function analyzeFunction(
  ast: t.Node,
  args: any[] = [],
  scope?: Map<string, any>
) {
  if (ast.type !== 'FunctionExpression') {
    unexpected(ast);
  }
  const bindings = new Map(scope);
  for (let i = 0, ii = args.length; i < ii; i++) {
    const param = ast.params[i];
    if (param.type !== 'Identifier') {
      unexpected(param);
    }
    bindings.set(param.name, args[i]);
  }
  return analyzeFunctionExpression(ast, bindings);
}

function analyzeFunctionExpression(
  ast: t.FunctionExpression,
  scope: Map<string, any>
) {
  function getStringValue(node: t.Node) {
    if (node.type !== 'StringLiteral') {
      unexpected(node);
    }
    return node.value;
  }

  function getNumericValue(node: t.Node) {
    if (node.type !== 'NumericLiteral') {
      unexpected(node);
    }
    return node.value;
  }

  function getOps(ops: OpsBinding, index: number) {
    if (index < 0) {
      return true;
    }
    return printOp(ops.value[index]);
  }

  function analyzeCallExpression(call: t.CallExpression) {
    if (call.callee.type !== 'Identifier') {
      return;
    }
    const args = call.arguments;
    switch (call.callee.name) {
      case '_': {
        const parent = analyzeExpression(args[0]);
        const child = analyzeExpression(args[1]);
        parent.children.push(child);
        break;
      }
      case '_rz': {
        const ops = analyzeExpression(args[0]);
        const el = analyzeExpression(args[1]);
        const name = getStringValue(args[2]);
        const value = getOps(ops, getNumericValue(args[3]));
        el.attrs[name] = value;
        break;
      }
      case '_2z': {
        const ops = analyzeExpression(args[0]);
        const list = getOps(ops, getNumericValue(args[1]));
        const iter = analyzeExpression(args[2]);
        const el = analyzeExpression(args[6]);
        const itemName = getStringValue(args[7]);
        const indexName = getStringValue(args[8]);
        const keyName = getStringValue(args[9]);
        el.attrs['wx:for'] = list;
        if (itemName !== 'item') {
          el.attrs['wx:for-item'] = itemName;
        }
        if (indexName !== 'index') {
          el.attrs['wx:for-index'] = indexName;
        }
        el.attrs['wx:key'] = keyName;
        analyzeFunction(iter.node, [null, null, el], scope);
        break;
      }
      case '_ic': {
        if (args[0].type !== 'MemberExpression') {
          unexpected(args[0]);
        }
        const el = analyzeExpression(args[5]);
        el.children.push({
          type: 'include',
          index: getNumericValue(args[0].property),
        });
        break;
      }
      case '_n': {
        return {
          type: 'element',
          tag: getStringValue(args[0]),
          attrs: {},
          children: [],
        };
      }
      case '_oz': {
        const ops = analyzeExpression(args[0]);
        return {
          type: 'value',
          ops: getOps(ops, getNumericValue(args[1])),
        };
      }
      case '_v': {
        return {
          type: 'element',
          tag: 'block',
          attrs: {},
          children: [],
        };
      }
      case '_mz': {
        if (args[2].type !== 'ArrayExpression') {
          unexpected(args[2]);
        }
        if (args[3].type !== 'ArrayExpression') {
          unexpected(args[3]);
        }
        if (args[3].elements.length) {
          unexpected(args[3]);
        }
        const attrs: Record<string, string | true> = {};
        let base = -1;
        for (let i = 0, ii = args[2].elements.length; i < ii; i += 2) {
          const name = args[2].elements[i];
          const index = args[2].elements[i + 1];
          if (!name || !index) {
            unexpected(args[2]);
          }
          if (name.type !== 'StringLiteral') {
            unexpected(name);
          }
          const ops = analyzeExpression(args[0]);
          let indexValue: number;
          if (index.type === 'UnaryExpression' && index.operator === '-') {
            indexValue = -getNumericValue(index.argument);
          } else {
            indexValue = getNumericValue(index);
          }
          if (indexValue >= 0) {
            if (base < 0) {
              base = indexValue;
            } else {
              indexValue += base;
            }
          }
          attrs[name.value] = getOps(ops, indexValue);
        }
        return {
          type: 'element',
          tag: getStringValue(args[1]),
          attrs,
          children: [],
        };
      }
      case '_gd': {
        if (args[0].type !== 'MemberExpression') {
          unexpected(args[0]);
        }
        return {
          type: 'template',
          index: getNumericValue(args[0].property),
          name: analyzeExpression(args[1]),
        };
      }
      case '_1z': {
        const ops = analyzeExpression(args[0]);
        return {
          type: 'template',
          template: getOps(ops, getNumericValue(args[1])),
        };
      }
      default: {
        if (call.callee.name.startsWith('gz$gwx')) {
          return {
            type: 'ops',
            value: win.__WXML_GLOBAL__.ops_cached[call.callee.name.slice(2)],
          };
        }
        unexpected(call.callee);
      }
    }
  }

  function analyzeExpression(node: t.Node): any {
    switch (node.type) {
      case 'CallExpression': {
        return analyzeCallExpression(node);
      }
      case 'Identifier': {
        return scope.get(node.name);
      }
      default: {
        unexpected(node);
      }
    }
  }

  function analyzeIfStatement(node: t.IfStatement) {
    if (node.test.type === 'MemberExpression') {
      return;
    }
    const test = analyzeExpression(node.test);
    if (test.type === 'template') {
      if (node.consequent.type !== 'BlockStatement') {
        unexpected(node.consequent);
      }
      if (node.consequent.body[0].type !== 'VariableDeclaration') {
        unexpected(node.consequent.body[0]);
      }
      if (node.consequent.body[3].type !== 'ExpressionStatement') {
        unexpected(node.consequent.body[3]);
      }
      const call = node.consequent.body[3].expression;
      if (call.type !== 'CallExpression') {
        unexpected(call);
      }
      const args = call.arguments;
      analyzeStatement(node.consequent.body[0]);
      const el = analyzeExpression(args[2]);
      el.children.push({
        type: 'template',
        template: analyzeExpression(call.callee),
        data: analyzeExpression(args[0]),
      });
      return;
    }
    analyzeIfBranch(node.consequent, test);
    analyzeIfBranch(node.alternate);
  }

  function analyzeIfBranch(node?: t.Statement | null, test?: any) {
    if (!node) {
      return;
    }
    if (node.type === 'IfStatement') {
      return analyzeIfStatement(node);
    }
    if (node.type !== 'BlockStatement') {
      unexpected(node);
    }
    if (node.body[0].type !== 'ExpressionStatement') {
      unexpected(node.body[0]);
    }
    if (node.body[0].expression.type !== 'AssignmentExpression') {
      unexpected(node.body[0].expression);
    }
    if (node.body[0].expression.left.type !== 'MemberExpression') {
      unexpected(node.body[0].expression.left);
    }
    if (node.body[0].expression.left.property.type !== 'Identifier') {
      unexpected(node.body[0].expression.left);
    }
    if (node.body[0].expression.left.property.name !== 'wxVkey') {
      unexpected(node.body[0].expression.left);
    }
    const vkey = getNumericValue(node.body[0].expression.right);
    const el = analyzeExpression(node.body[0].expression.left.object);
    if (!el.branches) {
      el.branches = {};
    }
    el.branches[vkey] = { test, children: [] };
    el.children = el.branches[vkey].children;
    analyzeStatement(node);
  }

  function analyzeStatement(node: t.Node): any {
    switch (node.type) {
      case 'VariableDeclaration': {
        for (const decl of node.declarations) {
          if (decl.id.type !== 'Identifier') {
            unexpected(decl.id);
          }
          if (!decl.init) {
            unexpected(decl);
          }
          switch (decl.init.type) {
            case 'CallExpression': {
              scope.set(decl.id.name, analyzeCallExpression(decl.init));
              break;
            }
            case 'FunctionExpression': {
              scope.set(decl.id.name, {
                type: 'fn',
                node: decl.init,
              });
              break;
            }
            case 'LogicalExpression': {
              analyzeExpression(decl.init.left);
              break;
            }
            case 'BinaryExpression':
            case 'MemberExpression': {
              break;
            }
            default: {
              unexpected(decl.init);
            }
          }
        }
        break;
      }
      case 'ExpressionStatement': {
        switch (node.expression.type) {
          case 'CallExpression': {
            analyzeCallExpression(node.expression);
            break;
          }
          case 'AssignmentExpression': {
            // ignore
            break;
          }
          default: {
            unexpected(node.expression);
          }
        }
        break;
      }
      case 'ReturnStatement': {
        if (node.argument?.type !== 'Identifier') {
          unexpected(node);
        }
        return scope.get(node.argument.name);
      }
      case 'IfStatement': {
        return analyzeIfStatement(node);
      }
      case 'BlockStatement': {
        for (const child of node.body) {
          const res = analyzeStatement(child);
          if (child.type === 'ReturnStatement') {
            return res;
          }
        }
        break;
      }
      case 'TryStatement': {
        return analyzeStatement(node.block);
      }
      default:
        unexpected(node);
    }
  }

  return analyzeStatement(ast.body);
}

function unexpected(node: t.Node): never {
  const error: any = new Error(`Unexpected node`);
  error.node = node;
  throw error;
}
