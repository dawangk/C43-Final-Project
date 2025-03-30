export interface ResponseType {
  data?: any;
  error?: {
    status: number;
    message: string;
  };
}