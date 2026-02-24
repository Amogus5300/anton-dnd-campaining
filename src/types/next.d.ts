import 'next';

declare module 'next' {
  interface Metadata {
    title?: string;
    description?: string;
  }
}