import * as z from 'zod/v4';
import { Subject } from 'rxjs';
import { Location } from '../db/schema.ts';
import { JwtPayload } from './auth.ts';

export type EndpointOutput = string | Response | Record<string, unknown>;

export type ApiEndpointDef<INPUT extends null | z.ZodType, OUTPUT extends EndpointOutput> = {
  inputSchema: INPUT;
  protected?: boolean;
  handler: (reqBody: z.infer<INPUT>, req: Request, user: JwtPayload | null) => Promise<OUTPUT>;
};

export type WideApiEndpointDef = {
  inputSchema: null | z.ZodType;
  protected?: boolean;
  handler: (reqBody: unknown, req: Request, user: JwtPayload | null) => Promise<EndpointOutput>;
}

export function defineEndpoint<INPUT extends z.ZodType | null, OUTPUT extends EndpointOutput>(
  opts: ApiEndpointDef<INPUT, OUTPUT>,
) {
  return opts;
}


export function parseOrDie<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error('Validation error:', result.error);
    throw new Response('Invalid input', {
      status: 400,
      headers: { 'content-type': 'text/plain' },
    });
  }
  return result.data;
}

/** used to broadcast new locations being added */
export const locations$ = new Subject<Location>();
