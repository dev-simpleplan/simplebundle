export const REGISTER = (functionId) => `mutation{
    cartTransformCreate(functionId: "${functionId}"){
      cartTransform{
        id
      }
      userErrors{
        message
      }
    }   
  }
`;
