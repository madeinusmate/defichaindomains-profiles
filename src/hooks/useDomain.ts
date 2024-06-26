import { useEffect, useState } from "react";
import { utils } from "ethers";

const useDomain = (domainName: string) => {
  const [resolvedAddress, setResolvedAddress] = useState<string | null>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    const fetchDomain = async () => {
      try {
        const labelHash = utils.namehash(domainName);
        console.log(labelHash);
        const graphqlQuery = {
          query: `
            query GetDomainByName($name: String!) {
              domains(where: { name: $name }) {
                resolver {
                addr {
                  id
                }
                texts
              }
              }
            }
          `,
          variables: {
            name: domainName,
          },
        };

        const graphqlResponse = await fetch(
          "https://proxy-production-8e85.up.railway.app/https://subgraph.defichain-domains.com/subgraphs/name/defichaindomains/subgraph",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(graphqlQuery),
          }
        );
        const { data } = await graphqlResponse.json();

        if (data.domains[0]) {
          const domainData = data.domains[0];
          const address = domainData.resolver.addr.id;
          setResolvedAddress(address);
        } else {
          setResolvedAddress(null);
        }
      } catch (error) {
        console.error("Error fetching domains:", error);
      } finally {
        setLoading(false);
      }
    };

    if (domainName) {
      fetchDomain();
    }
  }, [domainName]);
  return { resolvedAddress, loading };
};

export default useDomain;
