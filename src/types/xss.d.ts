declare module 'xss' {
  interface XssOptions {
    whiteList?: { [key: string]: string[] };
    stripIgnoreTag?: boolean;
    stripIgnoreTagBody?: string[];
  }

  function xss(html: string, options?: XssOptions): string;
  
  export = xss;
} 