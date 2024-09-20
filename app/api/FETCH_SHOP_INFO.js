export const FETCH_SHOP_INFO = `
query {
  shop {
    name
    allProductCategoriesList{
      id
      fullName
    }
    myshopifyDomain
    url
    features{
      bundles{
        eligibleForBundles
      }
    }
    productTags(first:250){
    edges {
        node 
        }
     }
     productTypes(first:250){
      edges {
          node 
          }
       }
    resourceLimits {
      maxProductVariants
    }
    currencyCode
    plan{
     displayName
      partnerDevelopment
      shopifyPlus
    }
    createdAt
    billingAddress{
    address1
    address2
    city
    company
    country
    }
    contactEmail
    email
    description
    features{
    bundles{
      ineligibilityReason
    }
    cartTransform{
    eligibleOperations{
    expandOperation
    mergeOperation
    updateOperation
    }
    }
    storefront
    }
    ianaTimezone
    primaryDomain {
      host
      id
      url
    }
    updatedAt

  }
}
`;