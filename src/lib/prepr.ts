import { PREPR_GRAPHQL_URL } from 'astro:env/server';
import { print } from 'graphql';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import type { PreprHeaders } from '@preprio/toolkit';

export async function prepr<TResult, TVariables>(
  document: TypedDocumentNode<TResult, TVariables>,
  variables: TVariables,
  headers: PreprHeaders = {},
): Promise<TResult> {
  const response = await fetch(PREPR_GRAPHQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify({ query: print(document), variables }),
  });
  const { data, errors } = await response.json();
  if (errors?.length) throw new Error(errors[0].message);
  return data;
}
