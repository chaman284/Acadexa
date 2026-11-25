declare module 'mammoth' {
  interface ExtractRawTextOptions {
    buffer?: Buffer;
    path?: string;
  }

  interface ExtractRawTextResult {
    value: string;
    messages: unknown[];
  }

  export function extractRawText(options: ExtractRawTextOptions): Promise<ExtractRawTextResult>;
}
