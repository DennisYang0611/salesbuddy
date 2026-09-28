import { notFound } from "next/navigation";
import PricingView from "../PricingView";
import { pricingPages } from "../data";

export function generateStaticParams() { return Object.keys(pricingPages).map((slug) => ({ slug })); }

export default function PricingRoute({ params }: { params: { slug: string } }) {
  const page = pricingPages[params.slug as keyof typeof pricingPages];
  if (!page) notFound();
  return <PricingView page={page} slug={params.slug} />;
}
