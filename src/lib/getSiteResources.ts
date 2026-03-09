import getSiteAdapter from "./getSiteAdapter";
import fetchResources from "./fetchResources";

const adapter = getSiteAdapter();
const getSharedResources = fetchResources(adapter.siteName);

export default getSharedResources;
