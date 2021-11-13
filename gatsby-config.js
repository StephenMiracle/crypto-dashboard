require("dotenv").config({
  path: `.env`,
})

module.exports = {
  siteMetadata: {
    title: `Etherflare`,
    description: `Tracking ethereum data from around the chain`,
    author: `@gatsbyjs`,
    siteUrl: `https://etherflare.com`,
  },
  plugins: [
    `gatsby-plugin-react-helmet`,
    {
      resolve: 'gatsby-plugin-apollo',
      options: {
        uri: process.env.GATSBY_GRAPHQL_HOST
      }
    },
    `gatsby-plugin-image`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Etherflare`,
        short_name: `etherflare`,
        start_url: `/`,
        background_color: `#15114a`,
        // This will impact how browsers show your PWA/website
        // https://css-tricks.com/meta-theme-color-and-trickery/
        theme_color: `#15114a`,
        display: `minimal-ui`,
        icon: `src/images/gatsby-icon.png`, // This path is relative to the root of the site.
      },
    },
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.dev/offline
    // `gatsby-plugin-offline`,
  ],
}
