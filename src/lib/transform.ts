import { parseExpression } from '@babel/parser';
import { analyzeFunction } from './analyze';
import { generateWxml } from './generate';

export function transformToWxml(code: string) {
  try {
    const ast = parseExpression(code);
    const rootNode = analyzeFunction(ast, [null, null, { children: [] }]);
    return rootNode.children.map(generateWxml).join('');
  } catch (error: any) {
    if (error.node) {
      error.message += `: ${code.slice(error.node.start, error.node.end)}`;
    }
    throw error;
  }
}
