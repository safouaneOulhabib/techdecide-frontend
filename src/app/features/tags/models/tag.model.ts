export type Tag = {
  id: number;
  name: string;
  color: string;
};

export type CreateTagRequest = {
  name: string;
  color?: string;
};