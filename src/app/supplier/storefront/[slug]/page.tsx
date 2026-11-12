import SupplierStorefrontPage from '@/app/suppliers/[slug]/page';

export default function StorefrontAliasPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return <SupplierStorefrontPage params={params} />;
}
