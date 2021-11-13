import React from 'react';
import { ApolloClient, InMemoryCache, HttpLink, ApolloProvider } from "@apollo/client";


export default function Provider({children}) {
    let client = new ApolloClient({
      cache: new InMemoryCache()
    });
  
  
    if (typeof fetch !== 'undefined') {
      client = new ApolloClient({
          cache: new InMemoryCache(),
          link: new HttpLink({
              uri: process.env.GATSBY_GRAPHQL_HOST,
              fetch
          })
      });
    }

    return(
        <ApolloProvider client={client}>
        { children }
        </ApolloProvider>
    )
}