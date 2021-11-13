import React from 'react';
import ApiProvider from "./src/apiProvider";
/**
 * Implement Gatsby's SSR (Server Side Rendering) APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/ssr-apis/
 */

// You can delete this file if you're not using it

// Wraps every page in a component
export function wrapPageElement({ element, props }) {

  return (
          <ApiProvider>{element}</ApiProvider>
  )
}