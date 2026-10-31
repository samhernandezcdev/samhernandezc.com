// One static SVG per view and leg variant of the lifting-set drawing, with its
// numbered callouts and the marks for removed parts. The viewer fetches a file
// only when the reader asks for that view or angle; nothing preloads them.
import type { APIRoute, GetStaticPaths } from "astro";
import { VIEWS, buildFigure } from "@/lib/hoist-figure.mjs";
import { VARIANTS, type VariantId } from "@/lib/hoist-model";

export const getStaticPaths = (() =>
  VIEWS.flatMap((view) => Object.keys(VARIANTS).map((variant) => ({ params: { name: `${view}-${variant}` }, props: { view, variant: variant as VariantId } })))) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) =>
  new Response(buildFigure(props.variant, { view: props.view }).svg.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"'), {
    headers: { "Content-Type": "image/svg+xml" },
  });
