import { Provider } from "./providers/types.js";
import { Session } from "./session.js";
import { Store } from "./store/types.js";

export const AUTH_PROVIDERS = "AUTH_PROVIDERS";
export const AUTH_STORE = "AUTH_STORE";

export interface AuthModuleOptions {
  providers: Record<string, Provider>;
  store: Store<Session>;
}
