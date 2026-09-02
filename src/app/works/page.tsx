// src/app/works/page.tsx
// Server component: data /works diambil di server (SSR) lalu dioper ke UI client
// (filter/sort) di works-client.tsx. Render awal sudah berisi semua karya.
import {
  getWorksListServer,
  getScopesServer,
  getIndustriesServer,
} from "@/lib/works-server";
import WorksClient from "./works-client";

export default async function WorksPage() {
  const [works, scopes, industries] = await Promise.all([
    getWorksListServer(),
    getScopesServer(),
    getIndustriesServer(),
  ]);

  return <WorksClient works={works} scopes={scopes} industries={industries} />;
}
