import * as z from "@zod/zod/v4";

export type EndpointOutput = string | Response | Record<string, unknown>;

export type ApiEndpointDef<INPUT extends null | z.ZodType, OUTPUT extends EndpointOutput> = {
  inputSchema: INPUT;
  handler: (reqBody: z.infer<INPUT>) => Promise<OUTPUT>;
};

export type WideApiEndpointDef = {
  inputSchema: null | z.ZodType;
  handler: (reqBody: unknown) => Promise<EndpointOutput>;
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
