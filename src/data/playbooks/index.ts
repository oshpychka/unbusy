import { agencyPlaybooks } from "./agency";
import { saasPlaybooks } from "./saas";
import { servicePlaybooks } from "./service";

export { industries, type Industry, type Playbook } from "./types";

export const playbooks = [
  ...servicePlaybooks,
  ...agencyPlaybooks,
  ...saasPlaybooks,
];

export function getPlaybook(slug: string) {
  return playbooks.find((playbook) => playbook.slug === slug);
}
