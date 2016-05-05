import { CompileAnimationEntryMetadata } from '../compile_metadata';
import { AnimationEntryAst } from './animation_ast';
import { ParseError } from '../parse_util';
export declare class AnimationParseError extends ParseError {
    constructor(message: any);
    toString(): string;
}
export declare class ParsedAnimationResult {
    ast: AnimationEntryAst;
    errors: AnimationParseError[];
    constructor(ast: AnimationEntryAst, errors: AnimationParseError[]);
}
export declare function parseAnimationEntry(entry: CompileAnimationEntryMetadata): ParsedAnimationResult;
