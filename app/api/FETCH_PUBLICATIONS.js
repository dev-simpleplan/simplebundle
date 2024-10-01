export const FETCH_PUBLICATIONS = `
query {
    publications(first:50) {
        edges{
            node{
                id
                name
            }
        }
    }
  }
`;
