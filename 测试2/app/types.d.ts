declare module 'fabric' {
  const fabric: any;
  export { fabric };
}

interface FabricStatic {
  Canvas: new (element: HTMLCanvasElement, options?: any) => any;
  Rect: new (options?: any) => any;
  Text: new (text: string, options?: any) => any;
  Image: {
    fromURL: (url: string, callback: (img: any) => void) => void;
  };
  Object: any;
  Group: any;
}

declare global {
  interface Window {
    fabric: FabricStatic;
  }
}

export {}; 