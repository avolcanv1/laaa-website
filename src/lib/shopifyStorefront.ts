/**
 * Shopify Storefront API helpers for Laaa Tienda.
 * Create a Headless / Custom storefront channel app in Shopify Admin → Apps → Develop apps,
 * enable Storefront API, and create a Storefront API access token (public, for browser use).
 *
 * @see https://shopify.dev/docs/api/storefront
 */

import { nonBreakingHyphens } from "./nonBreakingHyphens";

const STOREFRONT_API_VERSION = "2024-10";

type ShopifyMoney = { amount: string; currencyCode: string };

export type ShopifyProductCard = {
  id: string;
  handle: string;
  title: string;
  imageUrl: string | null;
  imageAlt: string | null;
  /** First variant GID for cartLinesAdd */
  firstVariantId: string | null;
  price: ShopifyMoney | null;
};

export type ShopifyProductVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  price: ShopifyMoney;
};

export type ShopifyProductDetail = {
  id: string;
  handle: string;
  title: string;
  descriptionHtml: string;
  availableForSale: boolean;
  images: { url: string; altText: string | null }[];
  variants: ShopifyProductVariant[];
  price: ShopifyMoney | null;
};

export type CartLine = {
  id: string;
  quantity: number;
  merchandiseId: string;
  productHandle: string | null;
  title: string;
  variantTitle: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  price: ShopifyMoney;
  lineTotal: ShopifyMoney;
};

export type CartDetails = {
  id: string;
  totalQuantity: number;
  checkoutUrl: string | null;
  subtotal: ShopifyMoney | null;
  lines: CartLine[];
};

export function formatShopifyMoney(
  price: ShopifyMoney | null | undefined,
): string {
  if (!price) return "—";
  const n = Number(price.amount);
  if (Number.isNaN(n)) return "—";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: price.currencyCode,
    }).format(n);
  } catch {
    return `$${price.amount}`;
  }
}

export function isProductSoldOut(product: {
  availableForSale: boolean;
  descriptionHtml: string;
}): boolean {
  if (!product.availableForSale) return true;
  const text = product.descriptionHtml.replace(/<[^>]+>/g, " ").toLowerCase();
  return text.includes("sold-out") || text.includes("agotado");
}

export function isShopifyConfigured(): boolean {
  const domain = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN as string | undefined;
  const token = import.meta.env.VITE_SHOPIFY_STOREFRONT_PUBLIC_TOKEN as
    | string
    | undefined;
  return Boolean(
    domain?.trim() && token?.trim(),
  );
}

function endpoint(): string | null {
  const domain = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN?.trim();
  if (!domain) return null;
  const host = domain.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return `https://${host}/api/${STOREFRONT_API_VERSION}/graphql.json`;
}

async function storefrontFetch<T>(params: {
  query: string;
  variables?: Record<string, unknown>;
}): Promise<{ data?: T; errors?: { message: string }[] } | null> {
  const url = endpoint();
  const token = import.meta.env.VITE_SHOPIFY_STOREFRONT_PUBLIC_TOKEN?.trim();
  if (!url || !token) return null;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify({
      query: params.query,
      variables: params.variables ?? {},
    }),
  });

  if (!res.ok) return null;
  return res.json() as Promise<{ data?: T; errors?: { message: string }[] }>;
}

const PRODUCTS_QUERY = `
  query TiendaProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          handle
          title
          featuredImage {
            url
            altText
          }
          variants(first: 1) {
            edges {
              node {
                id
              }
            }
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`;

export async function fetchStorefrontProducts(
  first = 24,
): Promise<ShopifyProductCard[]> {
  type Data = {
    products: {
      edges: {
        node: {
          id: string;
          handle: string;
          title: string;
          featuredImage: { url: string; altText: string | null } | null;
          variants: { edges: { node: { id: string } }[] };
          priceRange: { minVariantPrice: ShopifyMoney };
        };
      }[];
    };
  };

  const json = await storefrontFetch<Data>({
    query: PRODUCTS_QUERY,
    variables: { first },
  });

  if (!json?.data?.products?.edges) return [];

  return json.data.products.edges.map(({ node: n }) => ({
    id: n.id,
    handle: n.handle,
    title: nonBreakingHyphens(n.title),
    imageUrl: n.featuredImage?.url ?? null,
    imageAlt: n.featuredImage?.altText ?? null,
    firstVariantId: n.variants.edges[0]?.node.id ?? null,
    price: n.priceRange?.minVariantPrice ?? null,
  }));
}

const PRODUCT_BY_HANDLE_QUERY = `
  query TiendaProductByHandle($handle: String!) {
    productByHandle(handle: $handle) {
      id
      handle
      title
      descriptionHtml
      availableForSale
      images(first: 12) {
        edges {
          node {
            url
            altText
          }
        }
      }
      variants(first: 25) {
        edges {
          node {
            id
            title
            availableForSale
            price {
              amount
              currencyCode
            }
          }
        }
      }
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
    }
  }
`;

export async function fetchProductByHandle(
  handle: string,
): Promise<ShopifyProductDetail | null> {
  type Data = {
    productByHandle: {
      id: string;
      handle: string;
      title: string;
      descriptionHtml: string;
      availableForSale: boolean;
      images: { edges: { node: { url: string; altText: string | null } }[] };
      variants: {
        edges: {
          node: {
            id: string;
            title: string;
            availableForSale: boolean;
            price: ShopifyMoney;
          };
        }[];
      };
      priceRange: { minVariantPrice: ShopifyMoney };
    } | null;
  };

  const json = await storefrontFetch<Data>({
    query: PRODUCT_BY_HANDLE_QUERY,
    variables: { handle },
  });

  const p = json?.data?.productByHandle;
  if (!p) return null;

  return {
    id: p.id,
    handle: p.handle,
    title: nonBreakingHyphens(p.title),
    descriptionHtml: p.descriptionHtml,
    availableForSale: p.availableForSale,
    images: p.images.edges.map(({ node }) => node),
    variants: p.variants.edges.map(({ node }) => node),
    price: p.priceRange?.minVariantPrice ?? null,
  };
}

const CART_FULL_QUERY = `
  query TiendaCart($id: ID!) {
    cart(id: $id) {
      id
      checkoutUrl
      totalQuantity
      cost {
        subtotalAmount {
          amount
          currencyCode
        }
      }
      lines(first: 50) {
        edges {
          node {
            id
            quantity
            cost {
              totalAmount {
                amount
                currencyCode
              }
            }
            merchandise {
              ... on ProductVariant {
                id
                title
                image {
                  url
                  altText
                }
                price {
                  amount
                  currencyCode
                }
                product {
                  title
                  handle
                }
              }
            }
          }
        }
      }
    }
  }
`;

function parseCartDetails(cart: {
  id: string;
  checkoutUrl: string | null;
  totalQuantity: number;
  cost: { subtotalAmount: ShopifyMoney } | null;
  lines: {
    edges: {
      node: {
        id: string;
        quantity: number;
        cost: { totalAmount: ShopifyMoney };
        merchandise: {
          id: string;
          title: string;
          image: { url: string; altText: string | null } | null;
          price: ShopifyMoney;
          product: { title: string; handle: string };
        };
      };
    }[];
  };
}): CartDetails {
  return {
    id: cart.id,
    totalQuantity: cart.totalQuantity,
    checkoutUrl: cart.checkoutUrl,
    subtotal: cart.cost?.subtotalAmount ?? null,
    lines: cart.lines.edges.map(({ node }) => ({
      id: node.id,
      quantity: node.quantity,
      merchandiseId: node.merchandise.id,
      productHandle: node.merchandise.product.handle,
      title: nonBreakingHyphens(node.merchandise.product.title),
      variantTitle:
        node.merchandise.title !== "Default Title"
          ? node.merchandise.title
          : null,
      imageUrl: node.merchandise.image?.url ?? null,
      imageAlt: node.merchandise.image?.altText ?? null,
      price: node.merchandise.price,
      lineTotal: node.cost.totalAmount,
    })),
  };
}

export async function fetchCartDetails(
  cartId: string,
): Promise<CartDetails | null> {
  type Data = {
    cart: {
      id: string;
      checkoutUrl: string | null;
      totalQuantity: number;
      cost: { subtotalAmount: ShopifyMoney } | null;
      lines: {
        edges: {
          node: {
            id: string;
            quantity: number;
            cost: { totalAmount: ShopifyMoney };
            merchandise: {
              id: string;
              title: string;
              image: { url: string; altText: string | null } | null;
              price: ShopifyMoney;
              product: { title: string; handle: string };
            };
          };
        }[];
      };
    } | null;
  };

  const json = await storefrontFetch<Data>({
    query: CART_FULL_QUERY,
    variables: { id: cartId },
  });

  const cart = json?.data?.cart;
  if (!cart) return null;
  return parseCartDetails(cart);
}

export async function fetchCartTotalQuantity(
  cartId: string,
): Promise<number | null> {
  const details = await fetchCartDetails(cartId);
  return details?.totalQuantity ?? null;
}

export async function fetchCheckoutUrl(
  cartId: string,
): Promise<string | null> {
  const details = await fetchCartDetails(cartId);
  return details?.checkoutUrl ?? null;
}

const CART_CREATE = `
  mutation TiendaCartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
        totalQuantity
        cost {
          subtotalAmount {
            amount
            currencyCode
          }
        }
        lines(first: 50) {
          edges {
            node {
              id
              quantity
              cost {
                totalAmount {
                  amount
                  currencyCode
                }
              }
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  image {
                    url
                    altText
                  }
                  price {
                    amount
                    currencyCode
                  }
                  product {
                    title
                    handle
                  }
                }
              }
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const CART_LINES_ADD = `
  mutation TiendaCartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        checkoutUrl
        totalQuantity
        cost {
          subtotalAmount {
            amount
            currencyCode
          }
        }
        lines(first: 50) {
          edges {
            node {
              id
              quantity
              cost {
                totalAmount {
                  amount
                  currencyCode
                }
              }
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  image {
                    url
                    altText
                  }
                  price {
                    amount
                    currencyCode
                  }
                  product {
                    title
                    handle
                  }
                }
              }
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const CART_LINES_UPDATE = `
  mutation TiendaCartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        id
        checkoutUrl
        totalQuantity
        cost {
          subtotalAmount {
            amount
            currencyCode
          }
        }
        lines(first: 50) {
          edges {
            node {
              id
              quantity
              cost {
                totalAmount {
                  amount
                  currencyCode
                }
              }
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  image {
                    url
                    altText
                  }
                  price {
                    amount
                    currencyCode
                  }
                  product {
                    title
                    handle
                  }
                }
              }
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const CART_LINES_REMOVE = `
  mutation TiendaCartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        id
        checkoutUrl
        totalQuantity
        cost {
          subtotalAmount {
            amount
            currencyCode
          }
        }
        lines(first: 50) {
          edges {
            node {
              id
              quantity
              cost {
                totalAmount {
                  amount
                  currencyCode
                }
              }
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  image {
                    url
                    altText
                  }
                  price {
                    amount
                    currencyCode
                  }
                  product {
                    title
                    handle
                  }
                }
              }
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

type MutationCart = Parameters<typeof parseCartDetails>[0];

function cartFromMutation(cart: MutationCart | null | undefined): CartDetails | null {
  if (!cart?.id) return null;
  return parseCartDetails(cart);
}

export async function createCartWithLine(
  merchandiseId: string,
  quantity: number,
): Promise<CartDetails | null> {
  type CreateData = {
    cartCreate: {
      cart: MutationCart | null;
      userErrors: { message: string }[];
    };
  };

  const json = await storefrontFetch<CreateData>({
    query: CART_CREATE,
    variables: {
      input: {
        lines: [{ merchandiseId, quantity }],
      },
    },
  });

  return cartFromMutation(json?.data?.cartCreate?.cart);
}

export async function addCartLines(
  cartId: string,
  lines: { merchandiseId: string; quantity: number }[],
): Promise<CartDetails | null> {
  type AddData = {
    cartLinesAdd: {
      cart: MutationCart | null;
      userErrors: { message: string }[];
    };
  };

  const json = await storefrontFetch<AddData>({
    query: CART_LINES_ADD,
    variables: { cartId, lines },
  });

  return cartFromMutation(json?.data?.cartLinesAdd?.cart);
}

export async function cartLinesUpdate(
  cartId: string,
  lines: { id: string; quantity: number }[],
): Promise<CartDetails | null> {
  type UpdateData = {
    cartLinesUpdate: {
      cart: MutationCart | null;
      userErrors: { message: string }[];
    };
  };

  const json = await storefrontFetch<UpdateData>({
    query: CART_LINES_UPDATE,
    variables: { cartId, lines },
  });

  return cartFromMutation(json?.data?.cartLinesUpdate?.cart);
}

export async function cartLinesRemove(
  cartId: string,
  lineIds: string[],
): Promise<CartDetails | null> {
  type RemoveData = {
    cartLinesRemove: {
      cart: MutationCart | null;
      userErrors: { message: string }[];
    };
  };

  const json = await storefrontFetch<RemoveData>({
    query: CART_LINES_REMOVE,
    variables: { cartId, lineIds },
  });

  return cartFromMutation(json?.data?.cartLinesRemove?.cart);
}
